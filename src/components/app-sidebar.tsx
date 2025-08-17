"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Folder,
  Tag,
  Star,
  Plus,
  ChevronsRight,
  Archive,
} from "lucide-react";
import { RefForgeLogo } from "@/components/icons";
import type { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "./ui/scroll-area";

interface AppSidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  allTags: string[];
  activeTags: string[];
  toggleTag: (tag: string) => void;
  activePriority: number | null;
  setActivePriority: (priority: number | null) => void;
  onAddProject: (name: string) => void;
}

export function AppSidebar({
  projects,
  activeProjectId,
  setActiveProjectId,
  allTags,
  activeTags,
  toggleTag,
  activePriority,
  setActivePriority,
  onAddProject,
}: AppSidebarProps) {
  const [newProjectName, setNewProjectName] = React.useState("");
  const [isAddingProject, setIsAddingProject] = React.useState(false);

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      onAddProject(newProjectName.trim());
      setNewProjectName("");
      setIsAddingProject(false);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <RefForgeLogo className="w-8 h-8 text-primary-foreground" />
          <h1 className="text-xl font-headline font-bold text-primary-foreground">
            RefForge
          </h1>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="h-full">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setActiveProjectId(null)}
                isActive={activeProjectId === null}
                tooltip="All References"
              >
                <Archive />
                <span>All References</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>

          <SidebarGroup>
            <SidebarGroupLabel className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Folder />
                <span>Projects</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsAddingProject(!isAddingProject)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </SidebarGroupLabel>
            {isAddingProject && (
              <div className="p-2 space-y-2">
                <Input
                  placeholder="New project name..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddProject()}
                />
                <Button
                  size="sm"
                  className="w-full"
                  onClick={handleAddProject}
                >
                  Add Project
                </Button>
              </div>
            )}
            <SidebarMenu>
              {projects.map((project) => (
                <SidebarMenuItem key={project.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveProjectId(project.id)}
                    isActive={activeProjectId === project.id}
                    tooltip={project.name}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <span>{project.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <Collapsible>
              <CollapsibleTrigger className="w-full">
                <SidebarGroupLabel className="w-full justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Tag />
                    <span>Tags</span>
                  </div>
                  <ChevronsRight className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-90" />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-2 flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={
                        activeTags.includes(tag) ? "default" : "secondary"
                      }
                      onClick={() => toggleTag(tag)}
                      className="cursor-pointer"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <Collapsible>
              <CollapsibleTrigger className="w-full">
                <SidebarGroupLabel className="w-full justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Star />
                    <span>Priority</span>
                  </div>
                  <ChevronsRight className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-90" />
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenu>
                  {[5, 4, 3, 2, 1].map((p) => (
                    <SidebarMenuItem key={p}>
                      <SidebarMenuButton
                        onClick={() =>
                          setActivePriority(activePriority === p ? null : p)
                        }
                        isActive={activePriority === p}
                      >
                        <div className="flex items-center">
                          {[...Array(p)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          ))}
                           {[...Array(5-p)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-sidebar-foreground/20" />
                          ))}
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>
    </Sidebar>
  );
}
