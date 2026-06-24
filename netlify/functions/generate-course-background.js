import { completeJob, failJob, getJobSource, updateProcessingJob } from "./course-generation-jobs.js";
import { generateCourse, validateGenerationInput } from "./course-generation-core.js";

const jsonResponse = (body, status) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export default async (req) => {
  let body = {};
  console.log("FUNCTION REACHED", typeof body, Object.keys(body));

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    body = await req.json();
    console.log("FUNCTION BODY PARSED", typeof body, Object.keys(body), {
      contentType: req.headers.get("content-type"),
      fileName: body?.fileName,
      fileMimeType: body?.fileMimeType,
      fileBase64Length: typeof body?.fileBase64 === "string" ? body.fileBase64.length : 0,
      sourceTextLength: typeof body?.sourceText === "string" ? body.sourceText.length : 0,
    });
  } catch {
    console.log("FUNCTION BODY PARSE FAILED", {
      contentType: req.headers.get("content-type"),
    });
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const jobId = typeof body.jobId === "string" ? body.jobId : "";
  if (!jobId) {
    return jsonResponse({ error: "job_id saknas." }, 400);
  }

  try {
    const sourceBody = body.fileBase64 || body.sourceText ? body : await getJobSource(jobId);
    if (!sourceBody) {
      throw new Error("Källfilen saknas i serverlagret för jobbet.");
    }

    const input = validateGenerationInput(sourceBody);
    await updateProcessingJob(jobId, {
      sourceTitle: input.sourceTitle,
      roleCount: input.roleCount,
      fileName: input.fileName,
      resolvedMimeType: input.resolvedMimeType,
      extraction: input.extraction,
      sourceTextLength: input.sourceTextLength,
      fileBase64Length: input.fileBase64Length,
      generationMode: input.isTextSource ? "extracted_text" : "gemini_file_api",
      stage: "background_started",
      message: input.isTextSource
        ? "Background-funktionen har hämtat extraherad dokumenttext från serverlagret."
        : "Background-funktionen använder dokumentfallback eftersom textutvinningen var otillräcklig.",
    });

    const { course, provider, model } = await generateCourse({
      input,
      onProgress: (metadata) => updateProcessingJob(jobId, metadata),
    });

    await updateProcessingJob(jobId, {
      stage: "course_generated",
      message: `Kursutkastet är genererat med ${provider}${model ? ` (${model})` : ""}.`,
      provider,
      model,
    });
    await completeJob(jobId, course);
  } catch (error) {
    console.error("Background course generation failed:", error);
    await failJob(jobId, error instanceof Error ? error.message : "Kunde inte generera kursutkast.");
  }
};
