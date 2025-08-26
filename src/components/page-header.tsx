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
import { AddReferenceDialog } from "@/components/add-reference-dialog";
import { Project, Reference } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";

interface PageHeaderProps {
  pageTitle: string;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  projects: Project[];
  onAddReference: (reference: Omit<Reference, "id" | "createdAt">) => void;
}

export function PageHeader({
  pageTitle,
  searchTerm,
  onSearchTermChange,
  viewMode,
  onViewModeChange,
  projects,
  onAddReference,
}: PageHeaderProps) {
  const isMobile = useIsMobile();

  const viewModeIcon =
    viewMode === "grid" ? (
      <LayoutGrid className="h-4 w-4" />
    ) : (
      <List className="h-4 w-4" />
    );

  return (
    <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10 h-16">
      <h1 className="text-xl md:text-2xl font-headline font-bold text-primary truncate pr-4">
        {pageTitle}
      </h1>
      <div className="flex items-center gap-2">
        <div className="relative md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search references..."
            className="pl-9 w-full"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
          />
        </div>

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
