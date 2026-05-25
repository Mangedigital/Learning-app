import { getStore } from "@netlify/blobs";

const STORE_NAME = "course-generation-jobs";
const SOURCE_PREFIX = "source:";

const getJobStore = () => getStore(STORE_NAME);

export const saveJob = async (jobId, job) => {
  const store = getJobStore();
  await store.setJSON(jobId, {
    ...job,
    updatedAt: new Date().toISOString(),
  });
};

export const getJob = async (jobId) => {
  const store = getJobStore();
  return store.get(jobId, { type: "json" });
};

export const saveJobSource = async (jobId, source) => {
  const store = getJobStore();
  await store.setJSON(`${SOURCE_PREFIX}${jobId}`, source);
};

export const getJobSource = async (jobId) => {
  const store = getJobStore();
  return store.get(`${SOURCE_PREFIX}${jobId}`, { type: "json" });
};

export const createProcessingJob = async (jobId, metadata) => {
  await saveJob(jobId, {
    jobId,
    status: "processing",
    createdAt: new Date().toISOString(),
    metadata,
  });
};

export const updateProcessingJob = async (jobId, metadata) => {
  const existing = await getJob(jobId);
  if (existing?.status === "complete" || existing?.status === "failed") return;

  await saveJob(jobId, {
    ...existing,
    jobId,
    status: "processing",
    metadata: {
      ...(existing?.metadata || {}),
      ...metadata,
    },
  });
};

export const completeJob = async (jobId, course) => {
  await saveJob(jobId, {
    jobId,
    status: "complete",
    course,
    completedAt: new Date().toISOString(),
  });
};

export const failJob = async (jobId, error) => {
  await saveJob(jobId, {
    jobId,
    status: "failed",
    error,
    failedAt: new Date().toISOString(),
  });
};
