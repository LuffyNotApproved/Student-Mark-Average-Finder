import { Router } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router = Router();

/**
 * POST /ai/review
 * Generates motivational AI review for student marks
 */
router.post("/ai/review", async (req, res) => {
  const { subjects, total, average, grade } = req.body as {
    subjects: { name: string; marks: number }[];
    total: number;
    average: number;
    grade: string;
  };

  if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
    res.status(400).json({ error: "subjects must be a non-empty array" });
    return;
  }

  if (typeof total !== "number" || typeof average !== "number" || typeof grade !== "string") {
    res.status(400).json({ error: "total, average, and grade are required" });
    return;
  }

  const subjectList = subjects
    .map((s) => `${s.name}: ${s.marks}/100`)
    .join(", ");

  const prompt = `You are a supportive academic coach. 
A student has the following subject marks: ${subjectList}. 
Total: ${total}, Average: ${average.toFixed(1)}, Grade: ${grade}.

Write a personalized, motivational study review in 3-4 sentences. 
Highlight strengths, areas to improve, and give specific actionable advice. 
Be warm, constructive, energetic, and encouraging.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    const reviewText = completion.choices[0]?.message?.content?.trim();

    if (!reviewText) {
      res.status(500).json({ error: "Failed to generate review" });
      return;
    }

    res.json({ review: reviewText });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ error: message });
  }
});

export default router;
