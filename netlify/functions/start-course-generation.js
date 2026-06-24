import { createProcessingJob, saveJobSource } from "./course-generation-jobs.js";
import { validateGenerationInput } from "./course-generation-core.js";
import { ingestUploadedFile, isPdfMimeType, isTextLikeMimeType } from "./document-ingestion.js";

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const normalizeRoleCount = (value) => {
  const count = Number(value);
  if (count === 1 || count === 2 || count === 3 || count === 4) return count;
  return 3;
};

const fileToSourceBody = async ({ jobId, sourceTitle, roleCount, file }) => {
  const fileName = file.name || "source";
  const fileMimeType = file.type || "application/octet-stream";
  const ingestion = await ingestUploadedFile({ file, fileName, fileMimeType });

  const sourceBody = {
    jobId,
    sourceTitle,
    roleCount: normalizeRoleCount(roleCount),
    fileName,
    fileMimeType,
    sourceText: ingestion.sourceText,
    extraction: ingestion.extraction,
  };

  if (!isTextLikeMimeType(fileMimeType, fileName)) {
    const bytes = Buffer.from(await file.arrayBuffer());
    sourceBody.fileBase64 = bytes.toString("base64");
  }

  if (isPdfMimeType(fileMimeType, fileName)) {
    sourceBody.documentFallback = "gemini_file_api";
  }

  return sourceBody;
};

const readRequestBody = async (req) => {
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file.arrayBuffer !== "function") {
      throw new Error("FormData saknar filfältet 'file'.");
    }

    const jobId = typeof form.get("jobId") === "string" && form.get("jobId")
      ? String(form.get("jobId"))
      : crypto.randomUUID();
    const sourceTitle = typeof form.get("sourceTitle") === "string" && form.get("sourceTitle")
      ? String(form.get("sourceTitle"))
      : file.name;
    const roleCount = form.get("roleCount");

    return fileToSourceBody({ jobId, sourceTitle, roleCount, file });
  }

  return req.json();
};

export default async (req) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let body;
  try {
    body = await readRequestBody(req);
  } catch (error) {
    return jsonResponse({
      error: error instanceof Error ? error.message : "Invalid request body",
    }, 400);
  }

  const jobId = typeof body.jobId === "string" ? body.jobId : "";
  if (!jobId) {
    return jsonResponse({ error: "job_id saknas." }, 400);
  }

  try {
    const input = validateGenerationInput(body);
    await saveJobSource(jobId, body);
    await createProcessingJob(jobId, {
      sourceTitle: input.sourceTitle,
      roleCount: input.roleCount,
      fileName: input.fileName,
      resolvedMimeType: input.resolvedMimeType,
      extraction: input.extraction,
      sourceTextLength: input.sourceTextLength,
      fileBase64Length: input.fileBase64Length,
      generationMode: input.isTextSource ? "extracted_text" : "gemini_file_api",
      stage: "source_saved",
      message: input.isTextSource
        ? "Dokumenttexten är extraherad och sparad server-side."
        : "Källfilen är sparad server-side. Textutvinning var otillräcklig, så filtolkning används som fallback.",
    });

    return jsonResponse({ jobId, status: "processing" }, 202);
  } catch (error) {
    return jsonResponse({
      error: error instanceof Error ? error.message : "Kunde inte starta generatorjobbet.",
    }, 400);
  }
};

export const config = {
  path: "/api/start-course-generation",
};
