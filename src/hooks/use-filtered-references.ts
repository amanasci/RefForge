import * as React from "react";
import { Reference } from "@/types";

export function useFilteredReferences(
  references: Reference[],
  activeProjectId: string | null,
  activePriority: number | null,
  activeTags: string[],
  searchTerm: string
) {
  return React.useMemo(() => {
    if (!references) return [];
    return references.filter((ref: Reference) => {
      const projectMatch =
        !activeProjectId || ref.projectId === activeProjectId;
      const priorityMatch = !activePriority || ref.priority === activePriority;
      const tagMatch =
        activeTags.length === 0 ||
        activeTags.every((tag) => ref.tags.includes(tag));
      const searchMatch =
        searchTerm === "" ||
        ref.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ref.authors.some((author: string) =>
          author.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        ref.abstract.toLowerCase().includes(searchTerm.toLowerCase());

      return projectMatch && priorityMatch && tagMatch && searchMatch;
    });
  }, [references, activeProjectId, activePriority, activeTags, searchTerm]);
}
