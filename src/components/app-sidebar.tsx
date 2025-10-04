"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Folder,
  Tag,
  Star,
  Plus,
  ChevronsRight,
  Archive,
  X,
  Edit,
} from "lucide-react";
import { RefForgeLogo } from "@/components/icons";
import type { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import { ColorPicker } from "./ui/color-picker";

interface AppSidebarProps {
  projects: Project[];
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  allTags: string[];
  activeTags: string[];
  toggleTag: (tag: string) => void;
  activePriority: number | null;
  setActivePriority: (priority: number | null) => void;
  onAddProject: (project: { name: string; color: string }) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
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
  onUpdateProject,
  onDeleteProject,
}: AppSidebarProps) {
  // Add Project State
  const [newProjectName, setNewProjectName] = React.useState("");
  const [newProjectColor, setNewProjectColor] = React.useState("#ef4444");
  const [isAddProjectDialogOpen, setIsAddProjectDialogOpen] = React.useState(false);

  // Edit Project State
  const [projectToEdit, setProjectToEdit] = React.useState<Project | null>(null);
  const [editingProjectName, setEditingProjectName] = React.useState("");
  const [editingProjectColor, setEditingProjectColor] = React.useState("");

  // Delete Project State
  const [projectToDelete, setProjectToDelete] = React.useState<Project | null>(null);

  // Tag Search State
  const [tagSearch, setTagSearch] = React.useState("");

  const handleAddProject = () => {
    if (newProjectName.trim()) {
      onAddProject({ name: newProjectName.trim(), color: newProjectColor });
      setNewProjectName("");
      setNewProjectColor("#ef4444");
      setIsAddProjectDialogOpen(false);
    }
  };

  const handleOpenEditDialog = (project: Project) => {
    setProjectToEdit(project);
    setEditingProjectName(project.name);
    setEditingProjectColor(project.color);
  };

  const handleUpdateProject = () => {
    if (projectToEdit && editingProjectName.trim()) {
      onUpdateProject({
        ...projectToEdit,
        name: editingProjectName.trim(),
        color: editingProjectColor,
      });
      setProjectToEdit(null);
    }
  };

  return (
    <>
      <Sidebar variant="sidebar" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <RefForgeLogo className="w-8 h-8 text-sidebar-foreground" />
            <h1 className="text-xl font-headline font-bold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              RefForge
            </h1>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <ScrollArea className="h-full px-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveProjectId(null)}
                  isActive={activeProjectId === null}
                  tooltip="All References"
                >
                  <Archive className="h-4 w-4" />
                  <span>All References</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            <SidebarGroup>
              <SidebarGroupLabel className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  <span>Projects</span>
                </div>
                <Dialog
                  open={isAddProjectDialogOpen}
                  onOpenChange={setIsAddProjectDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      aria-label="Add Project"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Project</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        id="new-project-name"
                        placeholder="Enter project name..."
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddProject()}
                      />
                      <ColorPicker
                        value={newProjectColor}
                        onChange={setNewProjectColor}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsAddProjectDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleAddProject}>Add Project</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </SidebarGroupLabel>
              <SidebarMenu>
                {projects.map((project) => (
                  <SidebarMenuItem key={project.id} className="group">
                    <SidebarMenuButton
                      onClick={() => setActiveProjectId(project.id)}
                      isActive={activeProjectId === project.id}
                      tooltip={project.name}
                      className="justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: project.color }}
                        />
                        <span className="truncate">{project.name}</span>
                      </div>
                      <div className="hidden group-hover:flex items-center">
                        <div
                          role="button"
                          aria-label="Edit project"
                          className="p-1 rounded-md hover:bg-sidebar-accent"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditDialog(project);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </div>
                        <div
                          role="button"
                          aria-label="Delete project"
                          className="p-1 rounded-md hover:bg-sidebar-accent"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProjectToDelete(project);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </div>
                      </div>
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
                      <Tag className="h-4 w-4" />
                      <span>Tags</span>
                    </div>
                    <ChevronsRight className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-90" />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent className="p-2 space-y-2">
                  <Input
                    placeholder="Search tags..."
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    className="h-8"
                  />
                  <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                    {allTags
                      .filter((tag) =>
                        tag.toLowerCase().includes(tagSearch.toLowerCase())
                      )
                      .map((tag) => (
                        <Badge
                          key={tag}
                          variant={
                            activeTags.includes(tag) ? "default" : "outline"
                          }
                          onClick={() => toggleTag(tag)}
                          className={cn(
                            "cursor-pointer text-xs",
                            !activeTags.includes(tag) &&
                              "border-sidebar-border text-sidebar-foreground/80 hover:bg-sidebar-accent"
                          )}
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
                      <Star className="h-4 w-4" />
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
                              <Star
                                key={i}
                                className="w-4 h-4 text-yellow-400 fill-yellow-400"
                              />
                            ))}
                            {[...Array(5 - p)].map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 text-sidebar-foreground/20"
                              />
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
        <SidebarRail />
      </Sidebar>

      {/* Edit Project Dialog */}
      <Dialog open={!!projectToEdit} onOpenChange={(open) => !open && setProjectToEdit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              id="editing-project-name"
              placeholder="Enter project name..."
              value={editingProjectName}
              onChange={(e) => setEditingProjectName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUpdateProject()}
            />
            <ColorPicker
              value={editingProjectColor}
              onChange={setEditingProjectColor}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProjectToEdit(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProject}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Dialog */}
      <AlertDialog
        open={!!projectToDelete}
        onOpenChange={(open) => !open && setProjectToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              project &quot;{projectToDelete?.name}&quot; and all of its
              associated references.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (projectToDelete) {
                  onDeleteProject(projectToDelete.id);
                  if (activeProjectId === projectToDelete.id) {
                    setActiveProjectId(null);
                  }
                }
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
