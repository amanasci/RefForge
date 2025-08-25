"use client";

import * as React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { XMLParser } from "fast-xml-parser";
import type { Project, Reference } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StarRating } from "./star-rating";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const referenceSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  authors: z.string().min(1, "At least one author is required"),
  year: z.coerce.number().min(1800).max(new Date().getFullYear() + 1),
  journal: z.string().optional(),
  doi: z.string().optional(),
  abstract: z.string().min(10, "Abstract must be at least 10 characters"),
  tags: z.string().optional(),
  priority: z.number().min(0).max(5),
  projectId: z.string().min(1, "Please select a project"),
  status: z.enum(["Finished", "Not Finished"]),
});

type ReferenceFormValues = z.infer<typeof referenceSchema>;

interface AddReferenceDialogProps {
  children: React.ReactNode;
  projects: Project[];
  onAddReference?: (data: Omit<Reference, "id" | "createdAt">) => void;
  onUpdateReference?: (data: Reference) => void;
  referenceToEdit?: Reference;
}

export function AddReferenceDialog({
  children,
  projects,
  onAddReference,
  onUpdateReference,
  referenceToEdit,
}: AddReferenceDialogProps) {
  const [open, setOpen] = React.useState(false);

  const defaultValues: Partial<ReferenceFormValues> = React.useMemo(() => {
    return referenceToEdit ? {
      title: referenceToEdit.title,
      authors: referenceToEdit.authors.join(', '),
      year: referenceToEdit.year,
      journal: referenceToEdit.journal || "",
      doi: referenceToEdit.doi || "",
      abstract: referenceToEdit.abstract,
      tags: referenceToEdit.tags.join(', '),
      priority: referenceToEdit.priority,
      projectId: referenceToEdit.projectId,
      status: referenceToEdit.status,
    } : {
      title: "",
      authors: "",
      year: new Date().getFullYear(),
      journal: "",
      doi: "",
      abstract: "",
      tags: "",
      priority: 0,
      projectId: "",
      status: "Not Finished",
    }
  }, [referenceToEdit])

  const form = useForm<ReferenceFormValues>({
    resolver: zodResolver(referenceSchema),
    defaultValues,
  });

  React.useEffect(() => {
    form.reset(defaultValues);
  }, [open, form, defaultValues]);
  
  const onSubmit = (data: ReferenceFormValues) => {
    const processedData = {
      ...data,
      authors: data.authors.split(",").map((a) => a.trim()),
      tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : [],
    };
    if (referenceToEdit && onUpdateReference) {
      onUpdateReference({ ...referenceToEdit, ...processedData });
    } else if (onAddReference) {
      onAddReference(processedData as Omit<Reference, "id" | "createdAt">);
    }
    setOpen(false);
  };

  const handleFetchMetadata = async () => {
    const doi = form.getValues("doi");
    if (!doi) return;

    try {
      let metadata;
      if (doi.toLowerCase().includes("arxiv")) {
        metadata = await fetchArxivMetadata(doi);
      } else {
        metadata = await fetchCrossRefMetadata(doi);
      }

      if (metadata) {
        form.setValue("title", metadata.title ?? "");
        form.setValue("authors", (metadata.authors ?? []).join(", "));
        form.setValue("year", metadata.year ?? new Date().getFullYear());
        form.setValue("journal", metadata.journal || "");
        form.setValue("abstract", metadata.abstract ?? "");
      }
    } catch (error) {
      console.error("Failed to fetch metadata:", error);
      // Here you could use the useToast hook to show an error message
    }
  };

  const fetchCrossRefMetadata = async (
    doi: string
  ): Promise<Partial<Reference>> => {
    const response = await fetch(`https://api.crossref.org/works/${doi}`);
    if (!response.ok) {
      throw new Error("Failed to fetch from CrossRef");
    }
    const data = await response.json();
    const item = data.message;

    const year =
      item["published-print"]?.["date-parts"]?.[0]?.[0] ||
      item["published-online"]?.["date-parts"]?.[0]?.[0] ||
      new Date().getFullYear();

    return {
      title: item.title?.[0] || "No title found",
      authors:
        item.author?.map(
          (a: { given: string; family: string }) => `${a.given} ${a.family}`
        ) || [],
      year: year,
      journal: item["container-title"]?.[0] || "",
      doi: item.DOI,
      abstract: item.abstract
        ? // TODO: this is ugly, abstracts in crossref are behind a paywall and returned as html
          new DOMParser().parseFromString(item.abstract, "text/html")
            .documentElement.textContent || ""
        : "",
    };
  };

  const fetchArxivMetadata = async (
    doi: string
  ): Promise<Partial<Reference>> => {
    const arxivId = doi.substring(doi.toLowerCase().indexOf("arxiv.") + 6);
    const response = await fetch(
      `https://export.arxiv.org/api/query?id_list=${arxivId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch from arXiv");
    }
    const xmlData = await response.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
    });
    const jsonData = parser.parse(xmlData);
    const entry = jsonData.feed.entry;

    return {
      title: entry.title.replace(/\s+/g, " "),
      authors: Array.isArray(entry.author)
        ? entry.author.map((a: { name: string }) => a.name)
        : [entry.author.name],
      year: new Date(entry.published).getFullYear(),
      journal: entry["arxiv:journal_ref"] || "",
      doi: doi,
      abstract: entry.summary.replace(/\s+/g, " "),
    };
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-headline">{referenceToEdit ? "Edit Reference" : "Add New Reference"}</DialogTitle>
          <DialogDescription>
            {referenceToEdit ? "Update the details of your reference." : "Fill in the details of your new reference to add it to your library."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="The Art of Computer Programming" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="authors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Authors</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Donald E. Knuth, John Doe"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="2023" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="journal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Journal / Publication</FormLabel>
                    <FormControl>
                      <Input placeholder="Nature" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="abstract"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Abstract</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief summary of the paper..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (comma-separated)</FormLabel>
                    <FormControl>
                      <Input placeholder="AI, Ethics, Survey" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="doi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DOI</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          placeholder="10.1000/xyz123"
                          {...field}
                          className="flex-1"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleFetchMetadata}
                        disabled={!form.watch("doi")}
                      >
                        Fetch Metadata
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <StarRating rating={field.value} setRating={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm col-span-2">
                  <div className="space-y-0.5">
                    <FormLabel>Status</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Mark this reference as finished or not.
                    </p>
                  </div>
                  <FormControl>
                    <div className="flex items-center gap-2">
                    <Label htmlFor="status-switch" className={field.value === 'Not Finished' ? 'text-muted-foreground' : ''}>Not Finished</Label>
                    <Switch
                      id="status-switch"
                      checked={field.value === "Finished"}
                      onCheckedChange={(checked) => field.onChange(checked ? "Finished" : "Not Finished")}
                    />
                    <Label htmlFor="status-switch" className={field.value === 'Finished' ? '' : 'text-muted-foreground'}>Finished</Label>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">{referenceToEdit ? "Save Changes" : "Add Reference"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
