"use client";
import type { Project, Reference } from "@/types";
import { ReferenceCard } from "@/components/reference-card";
import { cn } from "@/lib/utils";
import { FolderSearch } from "lucide-react";

interface ReferenceListProps {
  references: Reference[];
  viewMode: "grid" | "list";
  onDelete: (id: string) => void;
  onUpdate: (reference: Reference) => void;
  projects: Project[];
  selectedReferences: string[];
  onToggleSelection: (id: string) => void;
}

export function ReferenceList({
  references,
  viewMode,
  onDelete,
  onUpdate,
  projects,
  selectedReferences,
  onToggleSelection,
}: ReferenceListProps) {
  if (references.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-muted-foreground h-full py-20">
        <FolderSearch className="w-16 h-16 mb-4" />
        <h2 className="text-xl font-semibold">No References Found</h2>
        <p className="mt-2 max-w-sm">
          Try adjusting your search or filters. Or, add a new reference to get started!
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "transition-all duration-300",
        viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "flex flex-col gap-4"
      )}
    >
      {references.map((ref) => (
        <ReferenceCard
          key={ref.id}
          reference={ref}
          viewMode={viewMode}
          onDelete={onDelete}
          onUpdate={onUpdate}
          projects={projects}
          isSelected={selectedReferences.includes(ref.id)}
          onToggleSelection={() => onToggleSelection(ref.id)}
        />
      ))}
    </div>
  );
}
