import { useState, useEffect, useCallback, useRef } from 'react';
import Database from '@tauri-apps/plugin-sql';
import type { AppData, Project, Reference } from '@/types';
import { v4 as uuidv4 } from 'uuid';

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
      console.log("referencesRaw", referencesRaw);

      const references: Reference[] = referencesRaw.map(r => ({
        ...r,
        authors: JSON.parse(r.authors),
        tags: JSON.parse(r.tags),
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
      const database = await Database.load("sqlite:refforge.db");
      db.current = database;
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
    await db.current.execute("DELETE FROM projects WHERE id = $1", [id]);
    await refreshData();
  }, [refreshData]);

  const addReference = useCallback(async (referenceData: Omit<Reference, 'id' | 'createdAt'>) => {
    if (!db.current) return;
    const newReference: Reference = { ...referenceData, id: uuidv4(), createdAt: new Date().toISOString() };
    await db.current.execute(
        "INSERT INTO `references` (id, title, authors, year, journal, doi, abstract, tags, priority, project_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
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
        ]
    );
    await refreshData();
  }, [refreshData]);

  const updateReference = useCallback(async (reference: Reference) => {
    if (!db.current) return;
    await db.current.execute(
        "UPDATE `references` SET title = $1, authors = $2, year = $3, journal = $4, doi = $5, abstract = $6, tags = $7, priority = $8, project_id = $9, created_at = $10 WHERE id = $11",
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
            reference.createdAt,
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
