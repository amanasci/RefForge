"use client";

import * as React from "react";
import { Search, PlusCircle, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { AddReferenceDialog } from "@/components/add-reference-dialog";
import { Project, Reference } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";
import { Checkbox } from "@/components/ui/checkbox";
import { toBibTeX } from "@/lib/bibtex";
import { useTauriStorage } from "@/hooks/use-tauri-storage";

interface PageHeaderProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  projects: Project[];
  onAddReference: (reference: Omit<Reference, "id" | "createdAt">) => void;
  selectedReferences: string[];
  onSelectAll: (selectAll: boolean) => void;
  allReferencesCount: number;
}

export function PageHeader({
  searchTerm,
  onSearchTermChange,
  viewMode,
  onViewModeChange,
  projects,
  onAddReference,
  selectedReferences,
  onSelectAll,
  allReferencesCount,
}: PageHeaderProps) {
  const isMobile = useIsMobile();
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const { data } = useTauriStorage();

  const handleExport = () => {
    if (!data) return;
    const selected = data.references.filter((ref: Reference) =>
      selectedReferences.includes(ref.id)
    );
    const bibtex = toBibTeX(selected);
    const blob = new Blob([bibtex], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "references.bib";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Add keyboard shortcut for search focus (Ctrl/Cmd + K)
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const viewModeIcon =
    viewMode === "grid" ? (
      <LayoutGrid className="h-4 w-4" />
    ) : (
      <List className="h-4 w-4" />
    );

  const numSelected = selectedReferences.length;
  const allSelected = numSelected > 0 && numSelected === allReferencesCount;
  const someSelected = numSelected > 0 && !allSelected;

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-2">
          <Checkbox
            id="select-all"
            checked={allSelected}
            onCheckedChange={(checked) => onSelectAll(!!checked)}
            aria-label="Select all"
          />
          <label htmlFor="select-all" className="text-sm font-medium">
            {numSelected > 0 ? `${numSelected} selected` : "Select All"}
          </label>
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Search references... (⌘K)"
            className="pl-9 w-full focus-visible:ring-2 focus-visible:ring-primary"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          disabled={numSelected === 0}
          onClick={handleExport}
        >
          Export
        </Button>
        <AddReferenceDialog
          projects={projects}
          onAddReference={onAddReference}
        >
          <Button
            size={isMobile ? "icon" : "default"}
            aria-label="Add Reference"
          >
            <PlusCircle className={isMobile ? "h-4 w-4" : "mr-2 h-4 w-4"} />
            {!isMobile && <span>Add New</span>}
          </Button>
        </AddReferenceDialog>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label={`Current view: ${viewMode}`}
            >
              {viewModeIcon}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewModeChange("grid")}>
              <LayoutGrid className="mr-2 h-4 w-4" />
              <span>Grid</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onViewModeChange("list")}>
              <List className="mr-2 h-4 w-4" />
              <span>List</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
