import { getJob } from "./course-generation-jobs.js";

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export default async (req) => {
  const url = new URL(req.url);
  const jobId = url.searchParams.get("job_id") || url.searchParams.get("jobId");

  if (!jobId) {
    return jsonResponse({ error: "job_id saknas." }, 400);
  }

  const job = await getJob(jobId);
  if (!job) {
    return jsonResponse({
      status: "processing",
      message: "Jobbet är köat och väntar på background-funktionen.",
    });
  }

  if (job.status === "complete") {
    return jsonResponse({ status: "complete", course: job.course });
  }

  if (job.status === "failed") {
    return jsonResponse({ status: "failed", error: job.error || "Kunde inte generera kursutkast." });
  }

  return jsonResponse({
    status: "processing",
    metadata: job.metadata,
    updatedAt: job.updatedAt,
  });
};

export const config = {
  path: "/api/get-job-status",
};
