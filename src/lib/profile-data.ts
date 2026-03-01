import cvKnowledgeRaw from "@/data/cv-knowledge.json";
import siteFactsRaw from "@/data/site-facts.json";
import type { CvKnowledge, SiteFacts } from "@/types/cv";

export const cvKnowledge = cvKnowledgeRaw as CvKnowledge;
export const siteFacts = siteFactsRaw as SiteFacts;
const cvExtension = cvKnowledge.sourceFile.toLowerCase().endsWith(".pdf") ? "pdf" : "docx";
export const cvDownloadHref = `/cv/thabiso-seleke-cv.${cvExtension}`;

export function getSectionLines(title: string): string[] {
  return cvKnowledge.sections.find((section) => section.title === title)?.lines ?? [];
}
