"use client";

import * as React from "react";
import { useTauriStorage } from "@/hooks/use-tauri-storage";
import { AppSidebar } from "@/components/app-sidebar";
import { ReferenceList } from "@/components/reference-list";
import { Preferences } from "@/components/Preferences";
import { Project, Reference } from "@/types";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/page-header";
import { useFilteredReferences } from "@/hooks/use-filtered-references";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

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
  const [selectedReferences, setSelectedReferences] = React.useState<string[]>([]);
  const [preferencesOpen, setPreferencesOpen] = React.useState(false);

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

  const toggleReferenceSelection = (id: string) => {
    setSelectedReferences((prev) =>
      prev.includes(id) ? prev.filter((refId) => refId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (selectAll: boolean) => {
    if (selectAll) {
      setSelectedReferences(filteredReferences.map((ref) => ref.id));
    } else {
      setSelectedReferences([]);
    }
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
    <SidebarProvider defaultOpen={true}>
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
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background/95 backdrop-blur-sm">
          <SidebarTrigger className="-ml-1 transition-colors hover:bg-accent hover:text-accent-foreground" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h1 className="text-xl md:text-2xl font-headline font-bold text-primary truncate flex-1">
            {pageTitle}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPreferencesOpen(true)}
            aria-label="Open Preferences"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </header>
        <div className="flex flex-1 flex-col">
          <PageHeader
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            projects={projects}
            onAddReference={addReference}
            selectedReferences={selectedReferences}
            onSelectAll={handleSelectAll}
            allReferencesCount={filteredReferences.length}
          />
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            <ReferenceList
              references={filteredReferences}
              viewMode={viewMode}
              onDelete={deleteReference}
              onUpdate={updateReference}
              projects={projects}
              selectedReferences={selectedReferences}
              onToggleSelection={toggleReferenceSelection}
            />
          </main>
        </div>
        
        <Preferences
          open={preferencesOpen}
          onOpenChange={setPreferencesOpen}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
