import { copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ingestCv } from "./ingest-cv";

const ROOT = process.cwd();
const DESTINATION = path.join(ROOT, "content/cv/master.docx");
const DEFAULT_SOURCE = "/Users/thabisoseleke/Downloads/Thabiso Seleke CV 1.docx";

export async function syncCv(sourcePath: string = DEFAULT_SOURCE): Promise<void> {
  await copyFile(sourcePath, DESTINATION);
  await ingestCv();
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
