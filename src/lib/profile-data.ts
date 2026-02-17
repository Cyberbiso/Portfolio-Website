import cvKnowledgeRaw from "@/data/cv-knowledge.json";
import siteFactsRaw from "@/data/site-facts.json";
import type { CvKnowledge, SiteFacts } from "@/types/cv";

export const cvKnowledge = cvKnowledgeRaw as CvKnowledge;
export const siteFacts = siteFactsRaw as SiteFacts;

export function getSectionLines(title: string): string[] {
  return cvKnowledge.sections.find((section) => section.title === title)?.lines ?? [];
}
