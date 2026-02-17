import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mammoth from "mammoth";
import type { CvKnowledge, CvSection } from "../src/types/cv";

const ROOT = process.cwd();
const SOURCE_PATH = path.join(ROOT, "content/cv/master.docx");
const OUTPUT_PATH = path.join(ROOT, "src/data/cv-knowledge.json");
const PUBLIC_CV_PATH = path.join(ROOT, "public/cv/thabiso-seleke-cv.docx");

const SECTION_TITLES = [
  "Summary",
  "Education",
  "Certifications",
  "Skills",
  "Experience",
  "References"
] as const;

function normalizeLine(line: string): string {
  return line
    .replace(/^\u2022\s*/, "")
    .replace(/^[-*]\s*/, "")
    .replace(/\t+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sectionTitleFor(line: string): { title: (typeof SECTION_TITLES)[number] | null; remainder: string } {
  const cleaned = normalizeLine(line).replace(/:$/, "");
  const lower = cleaned.toLowerCase();

  for (const title of SECTION_TITLES) {
    if (lower === title.toLowerCase()) {
      return { title, remainder: "" };
    }

    const prefix = `${title.toLowerCase()} `;
    if (lower.startsWith(prefix)) {
      return {
        title,
        remainder: cleaned.slice(prefix.length).trim()
      };
    }
  }

  return { title: null, remainder: cleaned };
}

function extractContact(lines: string[]): { email: string; phone: string } {
  const joined = lines.join(" ");
  const emailMatch = joined.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = joined.match(/\+?\d[\d\s-]{7,}\d/);

  return {
    email: emailMatch?.[0] ?? "",
    phone: phoneMatch?.[0]?.replace(/\s+/g, " ").trim() ?? ""
  };
}

export function parseCvText(rawText: string): CvKnowledge {
  const allLines = rawText
    .split(/\r?\n/)
    .map(normalizeLine)
    .filter(Boolean);

  const firstSectionIndex = allLines.findIndex((line) => sectionTitleFor(line).title !== null);
  const headerLines = firstSectionIndex > -1 ? allLines.slice(0, firstSectionIndex) : allLines;
  const bodyLines = firstSectionIndex > -1 ? allLines.slice(firstSectionIndex) : [];

  const sectionMap = new Map<string, string[]>();
  SECTION_TITLES.forEach((title) => sectionMap.set(title, []));

  let currentSection: string | null = null;

  for (const line of bodyLines) {
    const { title, remainder } = sectionTitleFor(line);

    if (title) {
      currentSection = title;
      if (remainder) {
        sectionMap.get(currentSection)?.push(remainder);
      }
      continue;
    }

    if (currentSection) {
      sectionMap.get(currentSection)?.push(line);
    }
  }

  const sections: CvSection[] = SECTION_TITLES.map((title) => ({
    title,
    lines: sectionMap.get(title) ?? []
  }));

  const { email, phone } = extractContact(headerLines);

  return {
    generatedAt: new Date().toISOString(),
    sourceFile: "content/cv/master.docx",
    profile: {
      name: headerLines[0] ?? "",
      location: headerLines[1] ?? "",
      email,
      phone
    },
    sections,
    rawText: rawText.trim()
  };
}

export async function ingestCv(): Promise<CvKnowledge> {
  const extraction = await mammoth.extractRawText({ path: SOURCE_PATH });
  const parsed = parseCvText(extraction.value);

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await mkdir(path.dirname(PUBLIC_CV_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(parsed, null, 2)}\n`, "utf-8");
  await copyFile(SOURCE_PATH, PUBLIC_CV_PATH);

  return parsed;
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  ingestCv()
    .then((result) => {
      console.log(`CV ingested for ${result.profile.name}.`);
    })
    .catch((error) => {
      console.error("Failed to ingest CV:", error);
      process.exitCode = 1;
    });
}
