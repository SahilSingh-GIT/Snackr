import axios from "axios";

export const analyzeReviewsWithAI = async (reviews) => {
  const reviewTexts = (reviews || [])
    .map((r) => r.Comment || r.comment)
    .filter(Boolean);

  if (reviewTexts.length === 0) {
    return {
      sentiment: "neutral",
      summaryBullets: [
        "No reviews available yet",
      ],
      topMentions: [],
    };
  }


  // Fallback if Ollama bypass is enabled
  if (process.env.OLLAMA_BYPASS === "true") {
    return {
      sentiment: "neutral",
      summaryBullets: [
        "AI Analysis unavailable (Ollama bypass)",
      ],
      topMentions: [],
    };
  }

  const prompt = `
You are a food critic review analyst for Snackr food delivery.
Analyze the following customer reviews for a restaurant:

Reviews:
${reviewTexts.join("\n")}

Respond ONLY with a valid JSON object matching this schema:
{
  "sentiment": "positive" | "mixed" | "negative",
  "summaryBullets": [
    "1-2 concise highlight points summarizing customer sentiment"
  ],
  "topMentions": [
    "3-5 top recurring keywords or phrases (without hashtags) that capture the essence of the reviews"
  ]
}
`;

  try {
    const url = `http://127.0.0.1:11434/api/generate`;
    const response = await axios.post(
      url,
      {
        model: "llama3.2:1b",
        prompt: prompt,
        stream: false,
        format: "json",
        options: {
          temperature: 0.3,
          num_predict: 400,
        },
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 60000, // 60 seconds timeout for CPU inference
      }
    );

    const textContent = response.data?.response;

    if (!textContent) {
      throw new Error("Empty response from Ollama API");
    }

    const cleanJson = textContent.replace(/```json\n?|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Ollama AI Review Analysis Error:", error.message);
    return {
      sentiment: "neutral",
      summaryBullets: [
        "Unable to generate AI summary at this time.",
      ],
      topMentions: [],
    };
  }
};

export default {
  analyzeReviewsWithAI,
};