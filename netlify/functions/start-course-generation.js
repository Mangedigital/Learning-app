import { createProcessingJob, saveJobSource } from "./course-generation-jobs.js";
import { validateGenerationInput } from "./course-generation-core.js";

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const fileToSourceBody = async ({ jobId, sourceTitle, file }) => {
  const fileName = file.name || "source";
  const fileMimeType = file.type || "application/octet-stream";
  const lowerName = fileName.toLowerCase();
  const isText = fileMimeType.startsWith("text/") || lowerName.endsWith(".txt") || lowerName.endsWith(".md");

  if (isText) {
    return {
      jobId,
      sourceTitle,
      fileName,
      fileMimeType,
      sourceText: await file.text(),
    };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  return {
    jobId,
    sourceTitle,
    fileName,
    fileMimeType,
    fileBase64: bytes.toString("base64"),
  };
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

    return fileToSourceBody({ jobId, sourceTitle, file });
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
      fileName: input.fileName,
      resolvedMimeType: input.resolvedMimeType,
      sourceTextLength: input.sourceTextLength,
      fileBase64Length: input.fileBase64Length,
      generationMode: input.isTextSource ? "text" : "gemini_file_api",
      stage: "source_saved",
      message: "Källfilen är mottagen och sparad server-side.",
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
