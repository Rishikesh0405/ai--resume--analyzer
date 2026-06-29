import type { ResumeAnalysis } from "../../types";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function analyzeResumeWithBackend(
  resumeText: string,
  jobTitle: string,
  companyName: string,
): Promise<
  Pick<
    ResumeAnalysis,
    "atsScore" | "overallFeedback" | "categories" | "tips"
  >
> {
  const response = await fetch(`${API_URL}/api/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      resumeText,
      jobTitle,
      companyName,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to analyze resume.");
  }

  return await response.json();
}