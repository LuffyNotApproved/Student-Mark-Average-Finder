import { useState, useEffect } from "react";

const YELLOW = "#ffeb3b";
const BG = "#0a0a0a";
const PANEL_BG = "#111111";
const SIDEBAR_BG = "#0d0d0d";
const BORDER = "#2a2a2a";

interface SourceFile {
  label: string;
  content: string;
  error: string;
}

interface SourceGroup {
  category: string;
  files: SourceFile[];
}

function getLanguage(label: string): string {
  if (label.endsWith(".css")) return "css";
  if (label.endsWith(".tsx") || label.endsWith(".ts")) return "typescript";
  return "text";
}

function getFileIcon(label: string): string {
  if (label.endsWith(".css")) return "🎨";
  if (label.endsWith(".tsx")) return "⚛️";
  if (label.endsWith(".ts")) return "📘";
  return "📄";
}

function tokenize(code: string, lang: string): { text: string; color: string }[][] {
  const lines = code.split("\n");

  const keywords = /\b(import|export|from|const|let|var|function|return|if|else|for|while|class|interface|type|extends|implements|new|async|await|try|catch|throw|default|switch|case|break|continue|of|in|typeof|instanceof|void|null|undefined|true|false|this|super)\b/g;
  const types = /\b(string|number|boolean|any|unknown|never|void|object|Array|Promise|Record|Partial|Required|Pick|Omit|Router|Express|Request|Response|NextFunction)\b/g;
  const strings = /(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g;
  const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm;
  const numbers = /\b(\d+\.?\d*)\b/g;
  const cssProps = /([a-zA-Z-]+)\s*(?=:)/g;
  const cssVals = /:\s*([^;{]+)/g;
  const decorators = /(@\w+)/g;

  return lines.map((line) => {
    const tokens: { text: string; color: string }[] = [];

    interface Span { start: number; end: number; color: string }
    const spans: Span[] = [];

    const addSpans = (regex: RegExp, color: string, matchIndex = 0) => {
      regex.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = regex.exec(line)) !== null) {
        const start = m.index + (matchIndex > 0 ? m[0].indexOf(m[matchIndex]) : 0);
        const end = start + m[matchIndex].length;
        spans.push({ start, end, color });
      }
    };

    if (lang === "css") {
      addSpans(comments, "#6a9955");
      addSpans(cssProps, "#9cdcfe", 1);
      addSpans(strings, "#ce9178");
      addSpans(numbers, "#b5cea8");
    } else {
      addSpans(comments, "#6a9955");
      addSpans(strings, "#ce9178");
      addSpans(keywords, "#569cd6");
      addSpans(types, "#4ec9b0");
      addSpans(numbers, "#b5cea8");
      addSpans(decorators, "#dcdcaa");
    }

    spans.sort((a, b) => a.start - b.start);

    const merged: Span[] = [];
    for (const span of spans) {
      if (merged.length === 0 || span.start >= merged[merged.length - 1].end) {
        merged.push(span);
      }
    }

    let pos = 0;
    for (const span of merged) {
      if (pos < span.start) {
        tokens.push({ text: line.slice(pos, span.start), color: "#d4d4d4" });
      }
      tokens.push({ text: line.slice(span.start, span.end), color: span.color });
      pos = span.end;
    }
    if (pos < line.length) {
      tokens.push({ text: line.slice(pos), color: "#d4d4d4" });
    }
    if (tokens.length === 0) {
      tokens.push({ text: "", color: "#d4d4d4" });
    }

    return tokens;
  });
}

interface Props {
  onClose: () => void;
}

export default function SourceCodeViewer({ onClose }: Props) {
  const [groups, setGroups] = useState<SourceGroup[]>([]);
  const [selected, setSelected] = useState<{ groupIdx: number; fileIdx: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/source`)
      .then((r) => r.json())
      .then((data) => {
        setGroups(data);
        if (data.length > 0 && data[0].files.length > 0) {
          setSelected({ groupIdx: 0, fileIdx: 0 });
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load source files.");
        setLoading(false);
      });
  }, []);

  const activeFile =
    selected !== null ? groups[selected.groupIdx]?.files[selected.fileIdx] : null;

  function handleCopy() {
    if (!activeFile || activeFile.error) return;
    navigator.clipboard.writeText(activeFile.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleSelect(groupIdx: number, fileIdx: number) {
    setSelected({ groupIdx, fileIdx });
    setCopied(false);
  }

  const lang = activeFile ? getLanguage(activeFile.label) : "text";
  const tokenized = activeFile && !activeFile.error ? tokenize(activeFile.content, lang) : [];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        backgroundColor: "rgba(0,0,0,0.92)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 20px",
          borderBottom: `1px solid ${BORDER}`,
          backgroundColor: SIDEBAR_BG,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 18 }}>🗂️</span>
          <span style={{ color: YELLOW, fontWeight: 700, fontSize: 16 }}>
            Source Code — Student Marks Analyzer
          </span>
          <span style={{ color: "#666", fontSize: 13 }}>
            (for teacher assessment)
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "#1e1e1e",
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            color: "#ccc",
            padding: "4px 14px",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          ✕ Close
        </button>
      </div>

      {/* Main area */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <div
          style={{
            width: 240,
            flexShrink: 0,
            backgroundColor: SIDEBAR_BG,
            borderRight: `1px solid ${BORDER}`,
            overflowY: "auto",
            padding: "12px 0",
          }}
        >
          {loading && (
            <p style={{ color: "#666", padding: "0 16px", fontSize: 13 }}>Loading…</p>
          )}
          {groups.map((group, gi) => (
            <div key={gi} style={{ marginBottom: 8 }}>
              <div
                style={{
                  color: "#888",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  padding: "4px 16px 4px",
                  textTransform: "uppercase",
                }}
              >
                📁 {group.category}
              </div>
              {group.files.map((file, fi) => {
                const isActive = selected?.groupIdx === gi && selected?.fileIdx === fi;
                return (
                  <button
                    key={fi}
                    onClick={() => handleSelect(gi, fi)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      width: "100%",
                      textAlign: "left",
                      padding: "6px 16px 6px 24px",
                      background: isActive ? "#1e1e1e" : "transparent",
                      borderLeft: isActive ? `2px solid ${YELLOW}` : "2px solid transparent",
                      border: "none",
                      color: isActive ? YELLOW : "#bbb",
                      fontSize: 13,
                      cursor: "pointer",
                      fontFamily: "'Courier New', monospace",
                      wordBreak: "break-all",
                    }}
                  >
                    <span style={{ flexShrink: 0, fontSize: 12 }}>
                      {getFileIcon(file.label)}
                    </span>
                    <span>{file.label.split("/").pop()}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Code panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", backgroundColor: PANEL_BG }}>
          {activeFile && (
            <>
              {/* File path breadcrumb */}
              <div
                style={{
                  padding: "8px 20px",
                  borderBottom: `1px solid ${BORDER}`,
                  fontSize: 13,
                  color: "#888",
                  fontFamily: "'Courier New', monospace",
                  backgroundColor: "#161616",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  {getFileIcon(activeFile.label)}{" "}
                  <span style={{ color: "#ccc" }}>{activeFile.label}</span>
                  {!activeFile.error && (
                    <span style={{ marginLeft: 12, color: "#555", fontSize: 11 }}>
                      {activeFile.content.split("\n").length} lines
                    </span>
                  )}
                </div>
                {!activeFile.error && (
                  <button
                    onClick={handleCopy}
                    style={{
                      background: copied ? "#1a2e1a" : "#1e1e1e",
                      border: `1px solid ${copied ? "#4caf50" : BORDER}`,
                      borderRadius: 6,
                      color: copied ? "#4caf50" : "#aaa",
                      padding: "3px 12px",
                      cursor: "pointer",
                      fontSize: 12,
                      fontFamily: "sans-serif",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      transition: "all 0.2s",
                    }}
                  >
                    {copied ? "✓ Copied!" : "⎘ Copy"}
                  </button>
                )}
              </div>

              {/* Code content */}
              <div style={{ flex: 1, overflowY: "auto", overflowX: "auto" }}>
                {activeFile.error ? (
                  <p style={{ color: "#f44", padding: 20 }}>{activeFile.error}</p>
                ) : (
                  <table style={{ borderCollapse: "collapse", minWidth: "100%", fontFamily: "'Courier New', monospace", fontSize: 13 }}>
                    <tbody>
                      {tokenized.map((lineTokens, i) => (
                        <tr
                          key={i}
                          style={{ lineHeight: 1.6 }}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = "#1a1a1a")
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLTableRowElement).style.backgroundColor = "transparent")
                          }
                        >
                          <td
                            style={{
                              width: 50,
                              minWidth: 50,
                              textAlign: "right",
                              paddingRight: 16,
                              paddingLeft: 8,
                              color: "#3e3e3e",
                              userSelect: "none",
                              borderRight: `1px solid ${BORDER}`,
                              verticalAlign: "top",
                              position: "sticky",
                              left: 0,
                              backgroundColor: "#0d0d0d",
                            }}
                          >
                            {i + 1}
                          </td>
                          <td style={{ paddingLeft: 16, paddingRight: 16, whiteSpace: "pre", verticalAlign: "top" }}>
                            {lineTokens.map((tok, ti) => (
                              <span key={ti} style={{ color: tok.color }}>
                                {tok.text}
                              </span>
                            ))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {!activeFile && !loading && (
            <p style={{ color: "#555", padding: 20 }}>Select a file from the sidebar.</p>
          )}

          {error && (
            <p style={{ color: "#f44", padding: 20 }}>{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
