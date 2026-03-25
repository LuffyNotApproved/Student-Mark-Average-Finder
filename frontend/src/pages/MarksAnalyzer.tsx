import { useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const YELLOW = "#ffeb3b";
const CHART_COLORS = [
  "#ffeb3b",
  "#ff9800",
  "#4caf50",
  "#2196f3",
  "#e91e63",
  "#9c27b0",
  "#00bcd4",
  "#ff5722",
  "#8bc34a",
  "#795548",
];

interface Subject {
  name: string;
  marks: string;
}

function getGrade(avg: number): string {
  if (avg >= 90) return "A+";
  if (avg >= 80) return "A";
  if (avg >= 70) return "B+";
  if (avg >= 60) return "B";
  if (avg >= 50) return "C";
  if (avg >= 40) return "D";
  return "F";
}

function getPerformanceMessage(avg: number): string {
  if (avg >= 90) return "Outstanding performance! You're at the top of your class!";
  if (avg >= 75) return "Great work! You're performing well above average.";
  if (avg >= 60) return "Good effort! There's room to push even higher.";
  if (avg >= 45) return "You're getting there. A bit more focus will make a big difference.";
  return "Don't give up! With dedicated study you can turn this around.";
}

export default function MarksAnalyzer() {
  const [numSubjects, setNumSubjects] = useState<string>("3");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showSubjectInputs, setShowSubjectInputs] = useState(false);

  const [results, setResults] = useState<{
    total: number;
    average: number;
    grade: string;
    message: string;
    chartData: { name: string; marks: number }[];
  } | null>(null);

  const [aiReview, setAiReview] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string>("");

  const handleSetSubjects = () => {
    const n = parseInt(numSubjects, 10);
    if (isNaN(n) || n < 1 || n > 20) return;
    const initial: Subject[] = Array.from({ length: n }, (_, i) => ({
      name: subjects[i]?.name || "",
      marks: subjects[i]?.marks || "",
    }));
    setSubjects(initial);
    setShowSubjectInputs(true);
    setResults(null);
    setAiReview("");
    setAiError("");
  };

  const updateSubject = (index: number, field: keyof Subject, value: string) => {
    setSubjects((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const fetchAiReview = useCallback(
    async (subjectData: { name: string; marks: number }[], total: number, average: number, grade: string) => {
      setAiLoading(true);
      setAiReview("");
      setAiError("");
      try {
        const response = await fetch("/api/ai/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subjects: subjectData, total, average, grade }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.error || `Server error: ${response.status}`);
        }

        const data = await response.json();
        setAiReview(data.review ?? "No review generated.");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error occurred";
        setAiError(`AI review failed: ${message}`);
      } finally {
        setAiLoading(false);
      }
    },
    []
  );

  const handleCalculate = async () => {
    const validSubjects = subjects.filter((s) => s.name.trim() !== "");
    if (validSubjects.length === 0) return;

    const marksArr = validSubjects.map((s) => {
      const m = parseFloat(s.marks);
      return isNaN(m) ? 0 : Math.max(0, Math.min(100, m));
    });

    const total = marksArr.reduce((a, b) => a + b, 0);
    const average = total / marksArr.length;
    const grade = getGrade(average);
    const message = getPerformanceMessage(average);

    const chartData = validSubjects.map((s, i) => ({
      name: s.name.trim() || `Subject ${i + 1}`,
      marks: marksArr[i],
    }));

    setResults({ total, average, grade, message, chartData });
    setAiReview("");
    setAiError("");

    await fetchAiReview(chartData, total, average, grade);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0a0a0a", color: "#f9f6e0" }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <h1 className="text-4xl font-bold" style={{ color: YELLOW }}>
              Student Marks Analyzer
            </h1>
          </div>
          <p className="text-sm mb-4" style={{ color: "#a89f6a" }}>
            Enter your subject marks, get charts &amp; an AI-powered study review
          </p>
          {/* Polish Cow GIF */}
          <div className="flex flex-col items-center gap-1">
            <img
              src="/polish-cow.gif"
              alt="Polish Cow meme"
              title="Gdzie jest biały węgorz? 🇵🇱"
              style={{
                width: 160,
                height: "auto",
                borderRadius: 12,
                border: `2px solid ${YELLOW}55`,
                boxShadow: `0 0 16px ${YELLOW}33`,
              }}
            />
            <span className="text-xs font-semibold" style={{ color: "#ffeb3b99", letterSpacing: "0.1em" }}>
              🇵🇱 POLSKA KROWA 🇵🇱
            </span>
          </div>
        </div>

        {/* Number of Subjects */}
        <div
          className="rounded-xl p-5 mb-6"
          style={{ backgroundColor: "#131313", border: "1px solid #2a2a1a" }}
        >
          <label className="block text-sm font-semibold mb-3" style={{ color: YELLOW }}>
            How many subjects?
          </label>
          <div className="flex gap-2 flex-wrap">
            <input
              type="number"
              min={1}
              max={20}
              value={numSubjects}
              onChange={(e) => setNumSubjects(e.target.value)}
              className="w-24 rounded-lg px-3 py-2 text-sm outline-none"
              style={{
                backgroundColor: "#1a1a0e",
                border: "1px solid #3a3a1a",
                color: "#f9f6e0",
              }}
            />
            <button
              onClick={handleSetSubjects}
              className="rounded-lg px-4 py-2 text-sm font-bold transition-opacity hover:opacity-80"
              style={{ backgroundColor: YELLOW, color: "#0a0a0a" }}
            >
              Set Subjects
            </button>
          </div>
        </div>

        {/* Subject Inputs */}
        {showSubjectInputs && subjects.length > 0 && (
          <div
            className="rounded-xl p-5 mb-6"
            style={{ backgroundColor: "#131313", border: "1px solid #2a2a1a" }}
          >
            <h2 className="text-sm font-semibold mb-4" style={{ color: YELLOW }}>
              Enter Subject Names &amp; Marks (out of 100)
            </h2>

            <div className="flex gap-3 mb-2 px-1">
              <span className="flex-1 text-xs font-medium" style={{ color: "#a89f6a" }}>
                Subject Name
              </span>
              <span className="w-28 text-xs font-medium" style={{ color: "#a89f6a" }}>
                Marks /100
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {subjects.map((subject, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <input
                    type="text"
                    placeholder={`Subject ${index + 1}`}
                    value={subject.name}
                    onChange={(e) => updateSubject(index, "name", e.target.value)}
                    className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                    style={{
                      backgroundColor: "#1a1a0e",
                      border: "1px solid #3a3a1a",
                      color: "#f9f6e0",
                    }}
                  />
                  <input
                    type="number"
                    placeholder="0"
                    min={0}
                    max={100}
                    value={subject.marks}
                    onChange={(e) => updateSubject(index, "marks", e.target.value)}
                    className="w-28 rounded-lg px-3 py-2 text-sm outline-none text-center"
                    style={{
                      backgroundColor: "#1a1a0e",
                      border: "1px solid #3a3a1a",
                      color: YELLOW,
                      fontWeight: "bold",
                    }}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleCalculate}
              className="mt-5 w-full rounded-lg px-4 py-3 font-bold text-base transition-opacity hover:opacity-80"
              style={{ backgroundColor: YELLOW, color: "#0a0a0a" }}
            >
              Calculate Results
            </button>
          </div>
        )}

        {/* Results */}
        {results && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "Total", value: results.total.toFixed(1) },
                { label: "Average", value: results.average.toFixed(1) + "%" },
                { label: "Grade", value: results.grade },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-xl p-4 text-center"
                  style={{ backgroundColor: "#131313", border: "1px solid #2a2a1a" }}
                >
                  <div className="text-xs mb-1" style={{ color: "#a89f6a" }}>
                    {label}
                  </div>
                  <div className="text-2xl font-bold" style={{ color: YELLOW }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            {/* Performance message */}
            <div
              className="rounded-xl px-5 py-3 mb-6 text-sm font-medium"
              style={{
                backgroundColor: "#1a1a06",
                border: `1px solid ${YELLOW}44`,
                color: "#f9f6e0",
              }}
            >
              {results.message}
            </div>

            {/* Bar Chart */}
            <div
              className="rounded-xl p-5 mb-5"
              style={{ backgroundColor: "#131313", border: "1px solid #2a2a1a" }}
            >
              <h2 className="text-sm font-semibold mb-4" style={{ color: YELLOW }}>
                Marks by Subject (Bar Chart)
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={results.chartData} margin={{ top: 5, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a1a" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#a89f6a", fontSize: 11 }}
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis domain={[0, 100]} tick={{ fill: "#a89f6a", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a0e",
                      border: "1px solid #3a3a1a",
                      borderRadius: "8px",
                      color: "#f9f6e0",
                    }}
                    labelStyle={{ color: YELLOW }}
                  />
                  <Bar dataKey="marks" radius={[4, 4, 0, 0]}>
                    {results.chartData.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart */}
            <div
              className="rounded-xl p-5 mb-5"
              style={{ backgroundColor: "#131313", border: "1px solid #2a2a1a" }}
            >
              <h2 className="text-sm font-semibold mb-4" style={{ color: YELLOW }}>
                Marks Distribution (Pie Chart)
              </h2>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={results.chartData}
                    dataKey="marks"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {results.chartData.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a0e",
                      border: "1px solid #3a3a1a",
                      borderRadius: "8px",
                      color: "#f9f6e0",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ color: "#a89f6a", fontSize: 12 }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* AI Review Box */}
            <div
              className="rounded-xl p-5 mb-6"
              style={{
                backgroundColor: "#141008",
                border: `2px solid ${YELLOW}`,
                boxShadow: `0 0 24px ${YELLOW}22`,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span style={{ fontSize: 20 }}>✨</span>
                <h2 className="text-sm font-bold" style={{ color: YELLOW }}>
                  AI Study Review
                </h2>
              </div>

              {aiLoading && (
                <div className="flex items-center gap-2 py-2">
                  <div
                    className="w-4 h-4 rounded-full border-2 animate-spin"
                    style={{ borderColor: `${YELLOW} transparent transparent transparent` }}
                  />
                  <span className="text-sm" style={{ color: "#a89f6a" }}>
                    Generating your personalized review...
                  </span>
                </div>
              )}

              {!aiLoading && aiError && (
                <p className="text-sm" style={{ color: "#f44336" }}>
                  {aiError}
                </p>
              )}

              {!aiLoading && aiReview && (
                <p className="text-sm leading-relaxed" style={{ color: "#f9f6e0" }}>
                  {aiReview}
                </p>
              )}

              {!aiLoading && !aiReview && !aiError && (
                <p className="text-sm" style={{ color: "#a89f6a" }}>
                  Your AI review will appear here after calculating.
                </p>
              )}
            </div>
          </>
        )}
    </div>
  );
}
