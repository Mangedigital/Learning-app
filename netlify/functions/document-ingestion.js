const MIN_SOURCE_TEXT_LENGTH = 50;
const WEAK_PDF_CHARS_PER_PAGE = 80;

const normalizeText = (text) =>
  text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();

const countWords = (text) => {
  const matches = normalizeText(text).match(/\S+/g);
  return matches ? matches.length : 0;
};

const getExtension = (fileName) => {
  const match = fileName.toLowerCase().match(/\.[^.]+$/);
  return match ? match[0] : "";
};

export const isDocMimeType = (mimeType, fileName = "") =>
  mimeType === "application/msword" || getExtension(fileName) === ".doc";

export const isDocxMimeType = (mimeType, fileName = "") =>
  mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
  getExtension(fileName) === ".docx";

export const isPdfMimeType = (mimeType, fileName = "") =>
  mimeType === "application/pdf" || getExtension(fileName) === ".pdf";

export const isTextLikeMimeType = (mimeType, fileName = "") => {
  const extension = getExtension(fileName);
  return mimeType.startsWith("text/") || extension === ".txt" || extension === ".md";
};

const ingestText = async (file) => {
  const sourceText = normalizeText(await file.text());
  return {
    sourceText,
    extraction: {
      extractionMethod: "browser_text",
      wordCount: countWords(sourceText),
      warnings: [],
      diagnostics: {
        textLength: sourceText.length,
      },
    },
  };
};

const ingestPdf = async (bytes) => {
  const warnings = [];
  try {
    const pdfModule = await import("pdf-parse");
    const pdfParse = pdfModule.default || pdfModule;
    const parsed = await pdfParse(bytes);
    const sourceText = normalizeText(parsed.text || "");
    const pageCount = Number(parsed.numpages) || undefined;
    const wordCount = countWords(sourceText);

    if (!sourceText) {
      warnings.push("PDF:en gav ingen extraherbar text.");
    } else if (pageCount && sourceText.length / pageCount < WEAK_PDF_CHARS_PER_PAGE) {
      warnings.push("PDF:en verkar innehålla väldigt lite text per sida och kan vara skannad eller bildbaserad.");
    }

    return {
      sourceText,
      extraction: {
        extractionMethod: "pdf_text",
        pageCount,
        wordCount,
        warnings,
        diagnostics: {
          textLength: sourceText.length,
          info: parsed.info || null,
        },
      },
    };
  } catch (error) {
    return {
      sourceText: "",
      extraction: {
        extractionMethod: "pdf_text_failed",
        wordCount: 0,
        warnings: ["PDF-text kunde inte extraheras server-side."],
        diagnostics: {
          textLength: 0,
          error: error instanceof Error ? error.message : "Okänt PDF-fel.",
        },
      },
    };
  }
};

const ingestDocx = async (bytes) => {
  try {
    const mammothModule = await import("mammoth");
    const mammoth = mammothModule.default || mammothModule;
    const result = await mammoth.extractRawText({ buffer: bytes });
    const sourceText = normalizeText(result.value || "");
    const warnings = (result.messages || []).map((message) => message.message).filter(Boolean);

    return {
      sourceText,
      extraction: {
        extractionMethod: "docx_text",
        wordCount: countWords(sourceText),
        warnings,
        diagnostics: {
          textLength: sourceText.length,
          mammothMessageCount: result.messages?.length || 0,
        },
      },
    };
  } catch (error) {
    throw new Error(`Word-dokumentet kunde inte läsas. Spara om som .docx eller PDF och försök igen. (${error instanceof Error ? error.message : "Okänt Word-fel"})`);
  }
};

export const ingestUploadedFile = async ({ file, fileName, fileMimeType }) => {
  if (isDocMimeType(fileMimeType, fileName)) {
    throw new Error("Äldre Word-format (.doc) stöds inte i v1. Spara dokumentet som .docx eller PDF.");
  }

  if (isTextLikeMimeType(fileMimeType, fileName)) {
    return ingestText(file);
  }

  const bytes = Buffer.from(await file.arrayBuffer());

  if (isDocxMimeType(fileMimeType, fileName)) {
    return ingestDocx(bytes);
  }

  if (isPdfMimeType(fileMimeType, fileName)) {
    return ingestPdf(bytes);
  }

  return {
    sourceText: "",
    extraction: {
      extractionMethod: "unsupported",
      wordCount: 0,
      warnings: [],
      diagnostics: {
        textLength: 0,
        fileMimeType,
        fileName,
      },
    },
  };
};

export const isStrongExtractedText = (sourceText, extraction) => {
  const text = normalizeText(sourceText || "");
  if (text.length < MIN_SOURCE_TEXT_LENGTH) return false;
  if (extraction?.pageCount && text.length / extraction.pageCount < WEAK_PDF_CHARS_PER_PAGE) return false;
  return true;
};
