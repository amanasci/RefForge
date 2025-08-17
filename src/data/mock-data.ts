import type { Project, Reference } from "@/types";

export const mockProjects: Project[] = [
  {
    id: "proj-1",
    name: "AI in Healthcare",
    color: "hsl(210, 80%, 60%)",
  },
  {
    id: "proj-2",
    name: "Quantum Computing",
    color: "hsl(280, 80%, 60%)",
  },
  {
    id: "proj-3",
    name: "General Reading",
    color: "hsl(30, 80%, 60%)",
  },
];

export const mockReferences: Reference[] = [
  {
    id: "ref-1",
    title: "Deep Learning for Health Informatics",
    authors: ["John Doe", "Jane Smith"],
    year: 2021,
    journal: "Journal of Medical Internet Research",
    doi: "10.2196/18429",
    abstract:
      "This paper provides a comprehensive overview of deep learning techniques applied to various health informatics challenges, including electronic health records, medical imaging, and genomics.",
    tags: ["AI", "Deep Learning", "Healthcare"],
    priority: 5,
    projectId: "proj-1",
    createdAt: new Date("2023-01-15T09:30:00Z").toISOString(),
  },
  {
    id: "ref-2",
    title: "A Quantum-Inspired Classical Algorithm for Recommendation Systems",
    authors: ["Alice Johnson", "Bob Williams"],
    year: 2022,
    journal: "Nature Quantum Information",
    doi: "10.1038/s41534-022-00522-3",
    abstract:
      "We introduce a novel classical algorithm inspired by quantum mechanics for collaborative filtering, showing significant improvements over existing recommendation system models.",
    tags: ["Quantum", "Algorithm", "Machine Learning"],
    priority: 4,
    projectId: "proj-2",
    createdAt: new Date("2023-02-20T14:00:00Z").toISOString(),
  },
  {
    id: "ref-3",
    title: "The Ethical Landscape of Generative AI",
    authors: ["Carol White"],
    year: 2023,
    journal: "AI and Ethics",
    doi: "10.1007/s43681-023-00253-1",
    abstract:
      "This article explores the ethical considerations and societal impacts of large-scale generative artificial intelligence models, proposing a framework for responsible development.",
    tags: ["AI", "Ethics", "Generative AI"],
    priority: 3,
    projectId: "proj-3",
    createdAt: new Date("2023-03-10T11:45:00Z").toISOString(),
  },
  {
    id: "ref-4",
    title: "Predictive Modeling for Patient Outcomes using EHR Data",
    authors: ["David Green", "Emily Brown"],
    year: 2020,
    journal: "JAMIA",
    doi: "10.1093/jamia/ocaa028",
    abstract:
      "This study develops and validates a predictive model for patient mortality using structured electronic health record data. The model achieves high accuracy and interpretability.",
    tags: ["Healthcare", "Predictive Modeling", "EHR"],
    priority: 5,
    projectId: "proj-1",
    createdAt: new Date("2023-04-05T16:20:00Z").toISOString(),
  },
  {
    id: "ref-5",
    title: "Shor's Algorithm and its Implications for Cryptography",
    authors: ["Peter Shor"],
    year: 1994,
    journal: "Proceedings of the 35th Annual Symposium on Foundations of Computer Science",
    doi: "10.1109/SFCS.1994.365700",
    abstract:
      "A landmark paper describing a quantum algorithm for integer factorization, which has profound implications for the security of classical public-key cryptography systems.",
    tags: ["Quantum", "Cryptography", "Algorithm"],
    priority: 2,
    projectId: "proj-2",
    createdAt: new Date("2023-05-01T10:10:00Z").toISOString(),
  },
];
