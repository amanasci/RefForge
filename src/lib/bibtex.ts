import { Reference } from "@/types";

function toBibTeX(references: Reference[]): string {
  let bibtexString = "";

  for (const ref of references) {
    const bibKey = `${ref.authors[0].split(" ").pop()}${ref.year}${ref.title
      .split(" ")[0]
      .replace(/[^a-zA-Z]/g, "")}`;

    let entry = `@article{${bibKey},\n`;
    entry += `  title = {${ref.title}},\n`;
    entry += `  author = {${ref.authors.join(" and ")}},\n`;
    entry += `  year = {${ref.year}},\n`;
    if (ref.journal) {
      entry += `  journal = {${ref.journal}},\n`;
    }
    if (ref.doi) {
      entry += `  doi = {${ref.doi}},\n`;
    }
    if (ref.abstract) {
      entry += `  abstract = {${ref.abstract}},\n`;
    }
    entry += `}\n\n`;
    bibtexString += entry;
  }

  return bibtexString;
}

export { toBibTeX };
