export interface Reference {
  id: string;
  title: string;
  authors: string[];
  year: number;
  journal?: string;
  doi?: string;
  abstract: string;
  tags: string[];
  priority: number; // 0 to 5, 0 is no priority
  projectId: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
}
