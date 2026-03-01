import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mammoth from "mammoth";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import type { CvKnowledge, CvSection } from "../src/types/cv";

const ROOT = process.cwd();
const CV_DIRECTORY = path.join(ROOT, "content/cv");
const SOURCE_DOCX_PATH = path.join(CV_DIRECTORY, "master.docx");
const SOURCE_PDF_PATH = path.join(CV_DIRECTORY, "master.pdf");
const OUTPUT_PATH = path.join(ROOT, "src/data/cv-knowledge.json");
const PUBLIC_CV_BASENAME = path.join(ROOT, "public/cv/thabiso-seleke-cv");

const SECTION_TITLES = [
  "Summary",
  "Education",
  "Certifications",
  "Skills",
  "Experience",
  "References"
] as const;
type SectionTitle = (typeof SECTION_TITLES)[number];

const SECTION_ALIASES: Record<SectionTitle, string[]> = {
  Summary: ["Summary", "Professional Profile", "Professional Summary", "Profile"],
  Education: ["Education"],
  Certifications: ["Certifications", "Certification"],
  Skills: ["Skills", "Technical Skills", "Core Skills"],
  Experience: ["Experience", "Professional Experience", "Projects", "Leadership Experience", "Work Experience"],
  References: ["References"]
};

function normalizeLine(line: string): string {
  return line
    .replace(/\f/g, " ")
    .replace(/^\s*\u2022\s*/, "")
    .replace(/^\s*[-*]\s*/, "")
    .replace(/\t+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sectionTitleFor(line: string): { title: SectionTitle | null; remainder: string } {
  const cleaned = normalizeLine(line).replace(/[:\-–—]+$/, "");
  const lower = cleaned.toLowerCase();

  for (const title of SECTION_TITLES) {
    for (const alias of SECTION_ALIASES[title]) {
      const aliasLower = alias.toLowerCase();

      if (lower === aliasLower) {
        return { title, remainder: "" };
      }

      const inlinePrefixes = [`${aliasLower}:`, `${aliasLower} -`, `${aliasLower} –`, `${aliasLower} —`];
      for (const prefix of inlinePrefixes) {
        if (lower.startsWith(prefix)) {
          return {
            title,
            remainder: cleaned.slice(prefix.length).trim()
          };
        }
      }
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

function relativeFromRoot(targetPath: string): string {
  return path.relative(ROOT, targetPath).replace(/\\/g, "/");
}

async function resolveSourcePath(sourcePath?: string): Promise<string> {
  if (sourcePath) {
    return sourcePath;
  }

  const candidates = [SOURCE_PDF_PATH, SOURCE_DOCX_PATH];

  for (const candidate of candidates) {
    try {
      const candidateStat = await stat(candidate);
      if (candidateStat.isFile()) {
        return candidate;
      }
    } catch {
      // Ignore missing source files and continue checking alternatives.
    }
  }

  throw new Error(`No canonical CV found in ${relativeFromRoot(CV_DIRECTORY)} (expected master.docx or master.pdf).`);
}

async function extractRawText(sourcePath: string): Promise<string> {
  const extension = path.extname(sourcePath).toLowerCase();

  if (extension === ".docx") {
    const extraction = await mammoth.extractRawText({ path: sourcePath });
    return extraction.value;
  }

  if (extension === ".pdf") {
    const pdfBuffer = await readFile(sourcePath);
    const extraction = await pdfParse(pdfBuffer);
    return extraction.text;
  }

  throw new Error(`Unsupported CV format: ${extension || "unknown"}. Use .docx or .pdf.`);
}

export function parseCvText(rawText: string, sourceFile = "content/cv/master.docx"): CvKnowledge {
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
    sourceFile,
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

export async function ingestCv(sourcePath?: string): Promise<CvKnowledge> {
  const resolvedSourcePath = await resolveSourcePath(sourcePath);
  const rawText = await extractRawText(resolvedSourcePath);
  const parsed = parseCvText(rawText, relativeFromRoot(resolvedSourcePath));
  const publicCvPath = `${PUBLIC_CV_BASENAME}${path.extname(resolvedSourcePath).toLowerCase()}`;

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await mkdir(path.dirname(publicCvPath), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(parsed, null, 2)}\n`, "utf-8");
  await copyFile(resolvedSourcePath, publicCvPath);

  return parsed;
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  const sourcePath = process.argv[2];

  ingestCv(sourcePath)
    .then((result) => {
      console.log(`CV ingested for ${result.profile.name} from ${result.sourceFile}.`);
    })
    .catch((error) => {
      console.error("Failed to ingest CV:", error);
      process.exitCode = 1;
    });
}
