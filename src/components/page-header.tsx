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

interface PageHeaderProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  projects: Project[];
  onAddReference: (reference: Omit<Reference, "id" | "createdAt">) => void;
}

export function PageHeader({
  searchTerm,
  onSearchTermChange,
  viewMode,
  onViewModeChange,
  projects,
  onAddReference,
}: PageHeaderProps) {
  const isMobile = useIsMobile();
  const searchInputRef = React.useRef<HTMLInputElement>(null);

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

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm">
      <div className="flex items-center gap-2 flex-1">
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
