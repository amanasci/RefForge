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
import { MoreVertical, Trash2, Edit, CheckCircle2, Circle, RefreshCw } from "lucide-react";
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
  projects
}: ReferenceCardProps) {
  const project = projects.find((p) => p.id === reference.projectId);

  if (viewMode === 'list') {
    return (
      <Card className="flex flex-col md:flex-row items-start w-full transition-all hover:shadow-md">
        <div className="flex-1 p-4">
          <CardHeader className="p-0">
            <CardTitle className="text-base font-headline mb-1">{reference.title}</CardTitle>
            <CardDescription className="text-xs">
              {reference.authors.join(", ")} ({reference.year})
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-2 text-xs text-muted-foreground">
             <p className="line-clamp-2">{reference.abstract}</p>
          </CardContent>
        </div>
        <div className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4 border-t md:border-t-0 md:border-l w-full md:w-auto">
          <div className="flex flex-wrap gap-2">
            <Badge variant={reference.status === 'Finished' ? 'default' : 'secondary'} className="flex items-center gap-1">
                {reference.status === 'Finished' ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                <span>{reference.status}</span>
            </Badge>
            {reference.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          {reference.priority > 0 && <StarRating rating={reference.priority} />}
          <div className="self-end md:self-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <AddReferenceDialog projects={projects} referenceToEdit={reference} onUpdateReference={onUpdate}>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                </AddReferenceDialog>
                <DropdownMenuItem onClick={() => onUpdate({ ...reference, status: reference.status === 'Finished' ? 'Not Finished' : 'Finished' })}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  <span>Toggle Status</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(reference.id)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full transition-all hover:shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
          <StarRating rating={reference.priority} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 -mt-2">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <AddReferenceDialog projects={projects} referenceToEdit={reference} onUpdateReference={onUpdate}>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                </AddReferenceDialog>
                <DropdownMenuItem onClick={() => onUpdate({ ...reference, status: reference.status === 'Finished' ? 'Not Finished' : 'Finished' })}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  <span>Toggle Status</span>
                </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(reference.id)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardTitle className="text-lg font-headline pt-2">
          {reference.title}
        </CardTitle>
        <CardDescription>
          {reference.authors.join(", ")} ({reference.year})
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-4">
          {reference.abstract}
        </p>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant={reference.status === 'Finished' ? 'default' : 'secondary'} className="flex items-center gap-1">
              {reference.status === 'Finished' ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
              <span>{reference.status}</span>
          </Badge>
          {reference.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex justify-between items-center w-full text-xs text-muted-foreground">
          {project && (
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: project.color }}
              />
              <span>{project.name}</span>
            </div>
          )}
          <span>
            Added {formatDistanceToNow(new Date(reference.createdAt), { addSuffix: true })}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
