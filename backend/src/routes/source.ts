import { Router } from "express";
import { readFileSync, existsSync } from "fs";
import { join, resolve } from "path";

const router = Router();

const ROOT = resolve(process.cwd(), "../..");

const SOURCE_FILES = [
  {
    category: "Frontend",
    files: [
      { label: "src/main.tsx", path: "artifacts/student-marks-analyzer/src/main.tsx" },
      { label: "src/App.tsx", path: "artifacts/student-marks-analyzer/src/App.tsx" },
      { label: "src/pages/MarksAnalyzer.tsx", path: "artifacts/student-marks-analyzer/src/pages/MarksAnalyzer.tsx" },
      { label: "src/index.css", path: "artifacts/student-marks-analyzer/src/index.css" },
    ],
  },
  {
    category: "Backend",
    files: [
      { label: "src/index.ts", path: "artifacts/api-server/src/index.ts" },
      { label: "src/app.ts", path: "artifacts/api-server/src/app.ts" },
      { label: "src/routes/index.ts", path: "artifacts/api-server/src/routes/index.ts" },
      { label: "src/routes/review.ts", path: "artifacts/api-server/src/routes/review.ts" },
    ],
  },
];

router.get("/source", (req, res) => {
  const result = SOURCE_FILES.map((group) => ({
    category: group.category,
    files: group.files.map(({ label, path: filePath }) => {
      const fullPath = join(ROOT, filePath);
      let content = "";
      let error = "";
      if (existsSync(fullPath)) {
        content = readFileSync(fullPath, "utf-8");
      } else {
        error = `File not found: ${filePath}`;
      }
      return { label, content, error };
    }),
  }));

  res.json(result);
});

export default router;
