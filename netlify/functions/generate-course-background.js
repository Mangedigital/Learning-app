import { completeJob, createProcessingJob, failJob } from "./course-generation-jobs.js";
import { generateCourseWithGemini, validateGenerationInput } from "./course-generation-core.js";

const jsonResponse = (body, status) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export default async (req) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const jobId = typeof body.jobId === "string" ? body.jobId : "";
  if (!jobId) {
    return jsonResponse({ error: "job_id saknas." }, 400);
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    await failJob(jobId, "API key not configured on server");
    return;
  }

  try {
    const input = validateGenerationInput(body);
    await createProcessingJob(jobId, {
      sourceTitle: input.sourceTitle,
      fileName: input.fileName,
      resolvedMimeType: input.resolvedMimeType,
      sourceTextLength: input.sourceTextLength,
      fileBase64Length: input.fileBase64Length,
      generationMode: input.isTextSource ? "text" : "gemini_file_api",
    });

    const { course } = await generateCourseWithGemini({
      apiKey,
      input,
      useFileApi: !input.isTextSource,
    });

    await completeJob(jobId, course);
  } catch (error) {
    console.error("Background course generation failed:", error);
    await failJob(jobId, error instanceof Error ? error.message : "Kunde inte generera kursutkast.");
  }
};
