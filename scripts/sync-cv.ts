import { copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ingestCv } from "./ingest-cv";

const ROOT = process.cwd();
const DESTINATION_DOCX = path.join(ROOT, "content/cv/master.docx");
const DESTINATION_PDF = path.join(ROOT, "content/cv/master.pdf");
const DEFAULT_SOURCE = "/Users/thabisoseleke/Downloads/THABISO NATHANIEL SELEKE.pdf";

function destinationFor(sourcePath: string): string {
  const extension = path.extname(sourcePath).toLowerCase();

  if (extension === ".docx") {
    return DESTINATION_DOCX;
  }

  if (extension === ".pdf") {
    return DESTINATION_PDF;
  }

  throw new Error(`Unsupported CV format: ${extension || "unknown"}. Use .docx or .pdf.`);
}

export async function syncCv(sourcePath: string = DEFAULT_SOURCE): Promise<void> {
  const destinationPath = destinationFor(sourcePath);
  await copyFile(sourcePath, destinationPath);
  await ingestCv(destinationPath);
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  const sourcePath = process.argv[2] ?? DEFAULT_SOURCE;

  syncCv(sourcePath)
    .then(() => {
      console.log(`CV synced from: ${sourcePath}`);
    })
    .catch((error) => {
      console.error("Failed to sync CV:", error);
      process.exitCode = 1;
    });
}
