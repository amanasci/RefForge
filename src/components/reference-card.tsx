"use client";

import type { Project, Reference } from "@/types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/star-rating";
import { formatDistanceToNow } from "date-fns";
import { Button } from "./ui/button";
import {
  MoreVertical,
  Trash2,
  Edit,
  CheckCircle2,
  Circle,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddReferenceDialog } from "./add-reference-dialog";

interface ReferenceCardProps {
  reference: Reference;
  viewMode: "grid" | "list";
  onDelete: (id: string) => void;
  onUpdate: (reference: Reference) => void;
  projects: Project[];
}

export function ReferenceCard({
  reference,
  viewMode,
  onDelete,
  onUpdate,
  projects,
}: ReferenceCardProps) {
  const project = projects.find((p) => p.id === reference.projectId);

  const StatusBadge = () => (
    <Badge
      variant={reference.status === "Finished" ? "default" : "secondary"}
      className="flex items-center gap-1 text-xs"
    >
      {reference.status === "Finished" ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <Circle className="h-3 w-3" />
      )}
      <span>{reference.status}</span>
    </Badge>
  );

  const ActionMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <AddReferenceDialog
          projects={projects}
          referenceToEdit={reference}
          onUpdateReference={onUpdate}
        >
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItem>
        </AddReferenceDialog>
        <DropdownMenuItem
          onClick={() =>
            onUpdate({
              ...reference,
              status:
                reference.status === "Finished" ? "Not Finished" : "Finished",
            })
          }
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          <span>Toggle Status</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete(reference.id)}
          className="text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  if (viewMode === "list") {
    return (
      <Card className="w-full transition-all hover:shadow-md">
        <div className="flex flex-col sm:flex-row">
          <div className="flex-1 p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-base font-headline mb-1">
                  {reference.title}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {reference.authors.join(", ")} ({reference.year})
                </CardDescription>
              </div>
              <ActionMenu />
            </div>
            <CardContent className="p-0 mt-3 text-sm text-muted-foreground">
              <p className="line-clamp-2">{reference.abstract}</p>
            </CardContent>
          </div>

          <div className="p-4 sm:p-6 flex flex-col justify-start gap-4 border-t sm:border-t-0 sm:border-l w-full sm:w-auto sm:min-w-[200px] sm:max-w-[250px]">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge />
              {reference.priority > 0 && (
                <StarRating rating={reference.priority} />
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {reference.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            {project && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <span className="truncate">{project.name}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full transition-all hover:shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
          {reference.priority > 0 ? (
            <StarRating rating={reference.priority} />
          ) : (
            <div /> // Placeholder for alignment
          )}
          <div className="-mr-2 -mt-2">
            <ActionMenu />
          </div>
        </div>
        <CardTitle className="text-lg font-headline pt-2 leading-tight">
          {reference.title}
        </CardTitle>
        <CardDescription className="text-sm">
          {reference.authors.join(", ")} ({reference.year})
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow text-sm text-muted-foreground">
        <p className="line-clamp-4">{reference.abstract}</p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3 pt-4">
        <div className="flex flex-wrap gap-2">
          <StatusBadge />
          {reference.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex justify-between items-center w-full text-xs text-muted-foreground pt-2">
          {project ? (
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              <span className="truncate">{project.name}</span>
            </div>
          ) : (
            <div />
          )}
          <span className="flex-shrink-0">
            {formatDistanceToNow(new Date(reference.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
