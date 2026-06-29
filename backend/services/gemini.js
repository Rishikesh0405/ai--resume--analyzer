import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function analyzeResume(
  resumeText,
  jobTitle,
  companyName
) {
  // Prevent huge prompts
  resumeText = (resumeText || "").substring(0, 12000);
 
  console.log("Resume Length:", resumeText.length);
  
  const prompt = `
You are an ATS Resume Analyzer.

Analyze the resume for the selected Job Role and Target Company.
Evaluate it according to current industry hiring standards.
Be strict while scoring.
Only give high ATS scores to resumes that are genuinely strong.

Return ONLY valid JSON.

{
  "atsScore": 0,
  "overallFeedback": "",
  "categories": [
    {
      "name": "ATS Compatibility",
      "score": 0,
      "feedback": "",
      "improvements": ["", "", ""]
    },
    {
      "name": "Content Quality",
      "score": 0,
      "feedback": "",
      "improvements": ["", "", ""]
    },
    {
      "name": "Skills Match",
      "score": 0,
      "feedback": "",
      "improvements": ["", "", ""]
    },
    {
      "name": "Experience",
      "score": 0,
      "feedback": "",
      "improvements": ["", "", ""]
    },
    {
      "name": "Formatting",
      "score": 0,
      "feedback": "",
      "improvements": ["", "", ""]
    }
  ],
  "tips": [
    "",
    "",
    "",
    "",
    ""
  ]
}

Rules:
While evaluating, consider:

• Contact Information
• Professional Summary
• Skills
• Projects
• Experience
• Education
• ATS Formatting
• Technical Keywords
• Action Verbs
• Quantified Achievements
• Resume Readability

A resume with:

- proper contact information
- education
- skills
- 2 or more relevant projects
- ATS-friendly formatting

should generally receive at least 70 unless there are major weaknesses.

Do not give above 85 unless the resume demonstrates strong project quality, measurable achievements, and excellent relevance to the selected role.
- Return only JSON.
- No markdown.
- No explanation.
- Exactly 5 categories.
- Every category must contain:
  - name
  - score
  - feedback
  - improvements (minimum 3)
- Exactly 5 tips.
- ATS score between 0-100.
Scoring Guidelines:

- 90-100: Outstanding resume with excellent ATS compatibility, strong projects, quantified achievements, clean formatting, and highly relevant skills.

- 80-89: Very good resume with only minor improvements needed.

- 70-79: Good resume with relevant skills, good projects, proper formatting, but missing some keywords or measurable achievements.

- 60-69: Average resume with basic skills and projects but needs better optimization.

- 40-59: Weak resume missing important sections, relevant skills, or project quality.

- Below 40: Poor resume requiring major improvements.

Important Rules:

- Do NOT give less than 70 if the resume contains:
  • Proper Contact Information
  • Education Section
  • Skills Section
  • At least 2 relevant projects
  • ATS-friendly formatting

- Do NOT give more than 85 unless the resume has:
  • Excellent formatting
  • Quantified achievements
  • Strong impact
  • Highly relevant skills
  • Professional projects

Analyze this resume for the role of:

${jobTitle}

Target Company:
${companyName || "General"}


Assume this is a standard ${jobTitle} hiring process.

Evaluate:

1. ATS Compatibility
2. Resume Content
3. Skills Match
4. Projects & Experience
5. Resume Formatting

Be strict.
Return JSON only.

Resume:

${resumeText}
`;

  let response;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      break;
    } catch (err) {
      console.log(`Attempt ${attempt} failed`);

      if (
        (err.status === 429 || err.status === 503) &&
        attempt < 3
      ) {
        console.log("Retrying in 5 seconds...");
        await sleep(5000);
      } else {
        throw err;
      }
    }
  }

  let text = response.text;

  text = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  console.log("========== GEMINI RESPONSE ==========");
  console.log(text);
  console.log("=====================================");

  const result = JSON.parse(text);

const weights = {
  "ATS Compatibility": 0.25,
  "Content Quality": 0.20,
  "Skills Match": 0.25,
  "Experience": 0.15,
  "Formatting": 0.15,
};

let score = 0;

for (const category of result.categories) {
  score += (weights[category.name] || 0) * category.score;
}

result.atsScore = Math.round(score);

return result;
}