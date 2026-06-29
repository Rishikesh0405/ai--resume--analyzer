import type { ResumeAnalysis } from "../../types";

// Save analysis to Puter KV
export async function saveAnalysis(analysis: ResumeAnalysis): Promise<void> {
  if (!window.puter) {
    throw new Error("Puter.js is not loaded.");
  }
  await window.puter.kv.set(`resume:${analysis.id}`, JSON.stringify(analysis));
}

// Get single analysis from Puter KV
export async function getAnalysis(id: string): Promise<ResumeAnalysis | null> {
  if (!window.puter) {
    throw new Error("Puter.js is not loaded.");
  }
  const raw = await window.puter.kv.get(`resume:${id}`);
  return raw ? JSON.parse(raw) : null;
}

// Get all analyses for current user from Puter KV
export async function getAllAnalyses(): Promise<ResumeAnalysis[]> {
  if (!window.puter) {
    throw new Error("Puter.js is not loaded.");
  }
  try {
    const keys = await window.puter.kv.list("resume:*");
    if (!keys || keys.length === 0) return [];
    
    const results = await Promise.all(keys.map(key => window.puter.kv.get(key)));
    return results
      .filter((r): r is string => Boolean(r))
      .map(r => JSON.parse(r) as ResumeAnalysis)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Error fetching analyses from Puter KV:", error);
    return [];
  }
}

// Delete analysis from Puter KV
export async function deleteAnalysis(id: string): Promise<void> {
  if (!window.puter) {
    throw new Error("Puter.js is not loaded.");
  }
  await window.puter.kv.del(`resume:${id}`);
}

// Puter AI resume analyzer function utilizing Claude Sonnet 4.5 vision model
export async function analyzeResume(
  resumeImageBase64: string,
  jobTitle: string,
  companyName: string,
  jobDescription: string
): Promise<Omit<ResumeAnalysis, "id" | "userId" | "resumeFileName" | "resumeFilePath" | "createdAt" | "jobTitle" | "companyName" | "jobDescription">> {
  if (!window.puter) {
    throw new Error("Puter.js is not loaded. Please make sure you are online.");
  }

  const systemPrompt = `You are an expert ATS (Applicant Tracking System) resume analyzer and career coach.
Analyze the provided resume against the job description and return ONLY a valid JSON object with no markdown, no explanation, no preamble.

The JSON must follow this exact schema:
{
  "atsScore": number (0-100),
  "overallFeedback": "string - 2-3 sentence summary of the resume's fit",
  "categories": [
    {
      "name": "Content Quality",
      "score": number (0-100),
      "feedback": "string",
      "improvements": ["string", "string", "string"]
    },
    {
      "name": "ATS Compatibility",
      "score": number (0-100),
      "feedback": "string",
      "improvements": ["string", "string", "string"]
    },
    {
      "name": "Skills Alignment",
      "score": number (0-100),
      "feedback": "string",
      "improvements": ["string", "string", "string"]
    },
    {
      "name": "Structure & Formatting",
      "score": number (0-100),
      "feedback": "string",
      "improvements": ["string", "string", "string"]
    },
    {
      "name": "Tone & Language",
      "score": number (0-100),
      "feedback": "string",
      "improvements": ["string", "string", "string"]
    }
  ],
  "tips": ["string", "string", "string", "string", "string"]
}

Scoring criteria:
- ATS Score should reflect how well ATS software will parse and rank this resume for the job
- Consider: keyword match, standard section headings, no tables/columns/graphics that confuse parsers
- Consider: quantified achievements, action verbs, relevant skills present
- Be strict and realistic — most resumes score 50–75, not 90+`;

  const userContent = [
    {
      type: "image_url",
      image_url: { url: `data:image/png;base64,${resumeImageBase64}` }
    },
    {
      type: "text",
      text: `Analyze this resume for the following job:

Job Title: ${jobTitle}
Company: ${companyName || "Not specified"}

Job Description:
${jobDescription}

Return ONLY the JSON structure specified.`
    }
  ];

  try {
    const response = await window.puter.ai.chat(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent }
      ],
      { model: "claude-sonnet-4-5" }
    );

    const rawText = response.message.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("");

    const clean = rawText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    if (typeof parsed.atsScore !== "number" || !Array.isArray(parsed.categories) || !Array.isArray(parsed.tips)) {
      throw new Error("AI response did not match the expected ResumeAnalysis schema.");
    }

    return parsed;
  } catch (error) {
    console.error("AI Analysis Call failed:", error);
    throw new Error("AI returned an unexpected format. Please try again.");
  }
}
