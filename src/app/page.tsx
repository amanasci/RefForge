"use client";

import * as React from "react";
import { useTauriStorage } from "@/hooks/use-tauri-storage";
import { AppSidebar } from "@/components/app-sidebar";
import { ReferenceList } from "@/components/reference-list";
import { Project, Reference } from "@/types";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/page-header";
import { useFilteredReferences } from "@/hooks/use-filtered-references";
import { LoadingSkeleton } from "@/components/loading-skeleton";

export default function RefForgeApp() {
  const {
    data,
    loading,
    addProject,
    deleteProject,
    updateProject,
    addReference,
    deleteReference,
    updateReference,
  } = useTauriStorage();

  const { projects, references } = data || { projects: [], references: [] };

  const [activeProjectId, setActiveProjectId] = React.useState<string | null>(null);
  const [activeTags, setActiveTags] = React.useState<string[]>([]);
  const [activePriority, setActivePriority] = React.useState<number | null>(null);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  const allTags = React.useMemo(() => {
    if (!references) return [];
    const tags = new Set<string>();
    references.forEach((ref: Reference) => ref.tags.forEach((tag: string) => tags.add(tag)));
    return Array.from(tags);
  }, [references]);

  const toggleTag = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const filteredReferences = useFilteredReferences(
    references,
    activeProjectId,
    activePriority,
    activeTags,
    searchTerm
  );

  const activeProject = projects?.find((p: Project) => p.id === activeProjectId);
  const pageTitle = activeProject ? activeProject.name : "All References";

  if (loading) {
    return <LoadingSkeleton />;
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
        onAddProject={addProject}
        onUpdateProject={updateProject}
        onDeleteProject={deleteProject}
      />
      <SidebarInset className="flex flex-col min-h-screen">
        <PageHeader
          pageTitle={pageTitle}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          projects={projects}
          onAddReference={addReference}
        />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <ReferenceList
            references={filteredReferences}
            viewMode={viewMode}
            onDelete={deleteReference}
            onUpdate={updateReference}
            projects={projects}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
