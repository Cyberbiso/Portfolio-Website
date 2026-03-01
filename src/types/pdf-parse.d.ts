declare module "pdf-parse/lib/pdf-parse.js" {
  interface PdfParseResult {
    text: string;
    [key: string]: unknown;
  }

  function pdfParse(dataBuffer: Buffer | Uint8Array): Promise<PdfParseResult>;

  export default pdfParse;
}
