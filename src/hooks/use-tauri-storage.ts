import { useState, useEffect, useCallback, useRef } from 'react';
import Database from '@tauri-apps/plugin-sql';
import { invoke } from '@tauri-apps/api/core';
import type { AppData, Project, Reference, Settings } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// This interface is to properly type the data coming from the DB
// before we parse the JSON strings.
interface ReferenceFromDb {
  id: string;
  title: string;
  authors: string; // JSON string
  year: number;
  journal?: string;
  doi?: string;
  abstract: string;
  tags: string; // JSON string
  priority: number;
  project_id: string;
  created_at: string;
  status: string;
  notes?: string;
}

export function useTauriStorage() {
  const db = useRef<Database | null>(null);
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    if (!db.current) return;
    setLoading(true);
    try {
      const projects = await db.current.select<Project[]>("SELECT * FROM projects");
      const referencesRaw = await db.current.select<ReferenceFromDb[]>("SELECT * FROM `references`");

      const references: Reference[] = referencesRaw.map(r => ({
        ...r,
        projectId: r.project_id, // map snake_case to camelCase
        createdAt: r.created_at,
        authors: JSON.parse(r.authors || '[]'),
        tags: JSON.parse(r.tags || '[]'),
        status: (r.status || "Not Finished") as "Finished" | "Not Finished",
        notes: r.notes || "",
      }));

      setData({ projects, references });
    } catch (error) {
      console.error('Failed to fetch all data:', error);
      setData({ projects: [], references: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  const initDb = useCallback(async () => {
    try {
      // Load settings to get database path
      let dbPath = "sqlite:refforge.db"; // default fallback
      try {
        const settings = await invoke<Settings>('get_settings');
        if (settings) {
          // Get the proper database path from settings
          if (settings.db_path) {
            dbPath = `sqlite:${settings.db_path}`;
          } else {
            // Use default path from backend
            const defaultPath = await invoke<string>('get_default_db_path');
            if (defaultPath) {
              dbPath = `sqlite:${defaultPath}`;
            }
          }
        }
      } catch (settingsError) {
        console.warn('Failed to load settings, using default database path:', settingsError);
      }

      const database = await Database.load(dbPath);
      db.current = database;
      
      // Add status column to references table if it doesn't exist
      try {
        await db.current.execute("ALTER TABLE `references` ADD COLUMN status TEXT NOT NULL DEFAULT 'Not Finished'");
      } catch (e) {
        // Ignore error if column already exists
        if (!String(e).includes('duplicate column name')) {
            console.error('Failed to alter `references` table:', e);
        }
      }
      await refreshData();
    } catch (error) {
      console.error("Failed to load database:", error);
      setLoading(false);
    }
  }, [refreshData]);

  useEffect(() => {
    initDb();
  }, [initDb]);

  const addProject = useCallback(async (projectData: Omit<Project, 'id'>) => {
    if (!db.current) return;
    const newProject: Project = { ...projectData, id: uuidv4() };
    await db.current.execute("INSERT INTO projects (id, name, color) VALUES ($1, $2, $3)", [newProject.id, newProject.name, newProject.color]);
    await refreshData();
  }, [refreshData]);

  const updateProject = useCallback(async (project: Project) => {
    if (!db.current) return;
    await db.current.execute("UPDATE projects SET name = $1, color = $2 WHERE id = $3", [project.name, project.color, project.id]);
    await refreshData();
  }, [refreshData]);

  const deleteProject = useCallback(async (id: string) => {
    if (!db.current) return;
    try {
        await db.current.execute('BEGIN TRANSACTION');
        await db.current.execute("DELETE FROM `references` WHERE project_id = $1", [id]);
        await db.current.execute("DELETE FROM projects WHERE id = $1", [id]);
        await db.current.execute('COMMIT');
    } catch (error) {
        await db.current.execute('ROLLBACK');
        console.error('Failed to delete project:', error);
    } finally {
        await refreshData();
    }
  }, [refreshData]);

  const addReference = useCallback(async (referenceData: Omit<Reference, 'id' | 'createdAt'>) => {
    if (!db.current) return;
    const newReference: Reference = { ...referenceData, id: uuidv4(), createdAt: new Date().toISOString(), status: referenceData.status || "Not Finished", notes: referenceData.notes || "" };
    await db.current.execute(
        "INSERT INTO `references` (id, title, authors, year, journal, doi, abstract, tags, priority, project_id, created_at, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)",
        [
            newReference.id,
            newReference.title,
            JSON.stringify(newReference.authors),
            newReference.year,
            newReference.journal,
            newReference.doi,
            newReference.abstract,
            JSON.stringify(newReference.tags),
            newReference.priority,
            newReference.projectId,
            newReference.createdAt,
            newReference.status,
            newReference.notes,
        ]
    );
    await refreshData();
  }, [refreshData]);

  const updateReference = useCallback(async (reference: Reference) => {
    if (!db.current) return;
    await db.current.execute(
        "UPDATE `references` SET title = $1, authors = $2, year = $3, journal = $4, doi = $5, abstract = $6, tags = $7, priority = $8, project_id = $9, status = $10, notes = $11 WHERE id = $12",
        [
            reference.title,
            JSON.stringify(reference.authors),
            reference.year,
            reference.journal,
            reference.doi,
            reference.abstract,
            JSON.stringify(reference.tags),
            reference.priority,
            reference.projectId,
            reference.status,
            reference.notes,
            reference.id,
        ]
    );
    await refreshData();
  }, [refreshData]);

  const deleteReference = useCallback(async (id: string) => {
    if (!db.current) return;
    await db.current.execute("DELETE FROM `references` WHERE id = $1", [id]);
    await refreshData();
  }, [refreshData]);

  return {
    data,
    loading,
    refreshData,
    addProject,
    updateProject,
    deleteProject,
    addReference,
    updateReference,
    deleteReference,
  };
}
