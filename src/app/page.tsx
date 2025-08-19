"use client";

import * as React from "react";
import { v4 as uuidv4 } from "uuid";
import { useTauriStorage } from "@/hooks/use-tauri-storage";
import type { Project, Reference } from "@/types";
import { AppSidebar } from "@/components/app-sidebar";
import { ReferenceList } from "@/components/reference-list";
import { AddReferenceDialog } from "@/components/add-reference-dialog";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle, LayoutGrid, List } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function RefForgeApp() {
  const [data, setData, loading] = useTauriStorage();
  const { projects, references } = data || { projects: [], references: [] };

  const [activeProjectId, setActiveProjectId] = React.useState<string | null>(
    null
  );
  const [activeTags, setActiveTags] = React.useState<string[]>([]);
  const [activePriority, setActivePriority] = React.useState<number | null>(
    null
  );
  const [searchTerm, setSearchTerm] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  const handleAddProject = (name: string) => {
    const newProject: Project = {
      id: uuidv4(),
      name,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
    };
    setData({ ...data, projects: [...projects, newProject] });
  };

  const handleAddReference = (
    newReferenceData: Omit<Reference, "id" | "createdAt">
  ) => {
    const newReference: Reference = {
      ...newReferenceData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setData({ ...data, references: [newReference, ...references] });
  };

  const handleDeleteReference = (id: string) => {
    setData({
      ...data,
      references: references.filter((ref) => ref.id !== id),
    });
  };

  const handleUpdateReference = (updatedReference: Reference) => {
    setData({
      ...data,
      references: references.map((ref) =>
        ref.id === updatedReference.id ? updatedReference : ref
      ),
    });
  };

  const allTags = React.useMemo(() => {
    if (!references) return [];
    const tags = new Set<string>();
    references.forEach((ref) => ref.tags.forEach((tag) => tags.add(tag)));
    return Array.from(tags);
  }, [references]);

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredReferences = React.useMemo(() => {
    if (!references) return [];
    return references.filter((ref) => {
      const projectMatch = !activeProjectId || ref.projectId === activeProjectId;
      const priorityMatch = !activePriority || ref.priority === activePriority;
      const tagMatch =
        activeTags.length === 0 ||
        activeTags.every((tag) => ref.tags.includes(tag));
      const searchMatch =
        searchTerm === "" ||
        ref.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ref.authors.some((author) =>
          author.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        ref.abstract.toLowerCase().includes(searchTerm.toLowerCase());

      return projectMatch && priorityMatch && tagMatch && searchMatch;
    });
  }, [references, activeProjectId, activePriority, activeTags, searchTerm]);

  const activeProject = projects?.find((p) => p.id === activeProjectId);
  const pageTitle = activeProject ? activeProject.name : "All References";

  if (loading) {
    return (
      <div className="flex h-screen w-full">
        <div className="w-64 border-r p-4">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-8 w-1/4 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar
        projects={projects}
        activeProjectId={activeProjectId}
        setActiveProjectId={setActiveProjectId}
        allTags={allTags}
        activeTags={activeTags}
        toggleTag={toggleTag}
        activePriority={activePriority}
        setActivePriority={setActivePriority}
        onAddProject={handleAddProject}
      />
      <SidebarInset className="flex flex-col min-h-screen">
        <header className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <h1 className="text-2xl font-headline font-bold text-primary">
            {pageTitle}
          </h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search references..."
                className="pl-9 w-48 md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1 p-1 rounded-md bg-muted">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <AddReferenceDialog
              projects={projects}
              onAddReference={handleAddReference}
            >
              <Button>
                <PlusCircle />
                <span>Add Reference</span>
              </Button>
            </AddReferenceDialog>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <ReferenceList
            references={filteredReferences}
            viewMode={viewMode}
            onDelete={handleDeleteReference}
            onUpdate={handleUpdateReference}
            projects={projects}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
