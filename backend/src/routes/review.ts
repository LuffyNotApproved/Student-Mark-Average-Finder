import { Router, type IRouter } from "express";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

router.post("/ai/review", async (req, res) => {
  const { subjects, total, average, grade } = req.body as {
    subjects: { name: string; marks: number }[];
    total: number;
    average: number;
    grade: string;
  };

  if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }

  const subjectList = subjects.map((s) => `${s.name}: ${s.marks}/100`).join(", ");
  const prompt = `You are a supportive academic coach. A student has the following subject marks: ${subjectList}. Total: ${total}, Average: ${average.toFixed(1)}, Grade: ${grade}. Write a personalized, motivational study review in 3-4 sentences. Highlight their strengths, point out where they can improve, and encourage them with specific, actionable advice. Be warm, constructive, and energetic.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.choices[0]?.message?.content || "No review generated.";
    res.json({ review: text.trim() });
  } catch (err: unknown) {
    req.log.error({ err }, "AI review generation failed");
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

export default router;
