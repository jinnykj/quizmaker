"use client";

import { useEffect, useRef, useState } from "react";

const W = 1080;
const H = 1350;
const SCALE = 0.31;
const NAVY = "#1d3461";
const CREAM = "#FEF9F3";
const FONT = "var(--font-playfair), 'Playfair Display', Georgia, serif";

type Data = {
  quizNumber: string;
  keyword: string;
  questionType: string;
  question: string;
  optionsText: string;
  bookTitle: string;
  author: string;
  coverUrl: string;
};

type Offsets = Record<string, { x: number; y: number }>;
type StyleOverride = { scale: number; letterSpacing: number; lineHeight: number };
type StyleOverrides = Record<string, StyleOverride>;

// Default letter-spacing per element (em)
const DEFAULT_LS: Record<string, number> = {
  "q-header":   0.13,
  "q-main":     -0.015,
  "q-footer":   0.08,
  "a-header":   0.13,
  "a-answer":   0,
  "a-bookinfo": -0.01,
  "m-header":   0.13,
  "m-bookinfo": -0.01,
  "m-question": 0.01,
  "m-options":  0.01,
};

// Default line-height per element
const DEFAULT_LH: Record<string, number> = {
  "q-header":   1.2,
  "q-main":     0.92,
  "q-footer":   1.2,
  "a-header":   1.2,
  "a-answer":   1,
  "a-bookinfo": 1,
  "m-header":   1.2,
  "m-bookinfo": 1.1,
  "m-question": 1.35,
  "m-options":  1.5,
};

const ELEM_META: Record<string, { label: string; hasFont: boolean }> = {
  "q-header":   { label: "ReadAway 헤더 (질문)", hasFont: true },
  "q-main":     { label: "키워드 + 질문",         hasFont: true },
  "q-footer":   { label: "Swipe →",             hasFont: true },
  "a-header":   { label: "ReadAway 헤더 (답)",   hasFont: true },
  "a-answer":   { label: "Answer",               hasFont: true },
  "a-cover":    { label: "표지 이미지",            hasFont: false },
  "a-bookinfo": { label: "책 제목 + 작가",         hasFont: true },
  "m-header":   { label: "ReadAway 헤더 (MCQ)",  hasFont: true },
  "m-bookinfo": { label: "표지 + 제목 (MCQ)",     hasFont: true },
  "m-question": { label: "문제 텍스트",            hasFont: true },
  "m-options":  { label: "보기 A–D",              hasFont: true },
};

// ──────────────────────────────────────────────
// Slide shell
// ──────────────────────────────────────────────

function SlideShell({
  children, divRef,
}: {
  children: React.ReactNode;
  divRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div
      ref={divRef}
      style={{
        width: W, height: H, backgroundColor: CREAM,
        position: "relative", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "space-between",
        padding: "72px 80px", overflow: "hidden", flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", inset: 36,
        border: "1.5px solid rgba(29,52,97,0.28)",
        pointerEvents: "none", zIndex: 2,
      }} />
      {children}
    </div>
  );
}

// ──────────────────────────────────────────────
// Draggable + selectable wrapper
// ──────────────────────────────────────────────

function D({
  id, offsets, onStartDrag, onSelect, isSelected, style, children,
}: {
  id: string;
  offsets?: Offsets;
  onStartDrag?: (id: string, e: React.MouseEvent) => void;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const off = offsets?.[id] ?? { x: 0, y: 0 };
  const [hover, setHover] = useState(false);
  const interactive = !!onStartDrag;
  const hasOffset = off.x !== 0 || off.y !== 0;

  return (
    <div
      onMouseDown={interactive ? (e) => {
        e.stopPropagation();
        onSelect?.(id);
        onStartDrag!(id, e);
      } : undefined}
      onMouseEnter={interactive ? () => setHover(true) : undefined}
      onMouseLeave={interactive ? () => setHover(false) : undefined}
      style={{
        ...style,
        ...(hasOffset ? { transform: `translate(${off.x}px, ${off.y}px)` } : {}),
        ...(interactive ? { cursor: "grab", userSelect: "none" } : {}),
        ...(interactive && isSelected
          ? { outline: "2.5px solid rgba(29,52,97,0.65)", outlineOffset: "8px" }
          : interactive && hover
          ? { outline: "2px dashed rgba(29,52,97,0.35)", outlineOffset: "8px" }
          : {}),
      }}
    >
      {children}
    </div>
  );
}

// ──────────────────────────────────────────────
// Question slide
// ──────────────────────────────────────────────

function QuestionSlide({
  data, divRef, offsets, styleOverrides, onStartDrag, onSelect, selected,
}: {
  data: Data;
  divRef?: React.Ref<HTMLDivElement>;
  offsets?: Offsets;
  styleOverrides?: StyleOverrides;
  onStartDrag?: (id: string, e: React.MouseEvent) => void;
  onSelect?: (id: string) => void;
  selected?: string | null;
}) {
  function sc(id: string) { return styleOverrides?.[id]?.scale ?? 1; }
  function ls(id: string) { return styleOverrides?.[id]?.letterSpacing ?? (DEFAULT_LS[id] ?? 0); }
  function lh(id: string) { return styleOverrides?.[id]?.lineHeight ?? (DEFAULT_LH[id] ?? 1.2); }

  return (
    <SlideShell divRef={divRef}>
      <D id="q-header" offsets={offsets} onStartDrag={onStartDrag} onSelect={onSelect} isSelected={selected === "q-header"} style={{ zIndex: 3 }}>
        <div style={{
          fontFamily: FONT, fontSize: 26 * sc("q-header"),
          letterSpacing: `${ls("q-header")}em`, lineHeight: lh("q-header"),
          color: NAVY, textAlign: "center", fontWeight: 400,
        }}>
          ReadAway POP QUIZ{data.quizNumber ? ` #${data.quizNumber}` : ""}
        </div>
      </D>

      <D id="q-main" offsets={offsets} onStartDrag={onStartDrag} onSelect={onSelect} isSelected={selected === "q-main"} style={{ textAlign: "center", zIndex: 3, padding: "0 20px" }}>
        <div style={{
          fontFamily: FONT, fontSize: 215 * sc("q-main"),
          letterSpacing: `${ls("q-main")}em`,
          fontWeight: 900, color: NAVY, lineHeight: lh("q-main"),
          whiteSpace: "pre-wrap", wordBreak: "break-word",
        }}>
          {data.keyword || "Keyword"}
        </div>
        <div style={{
          fontFamily: FONT, fontSize: 50 * sc("q-main"),
          letterSpacing: `${ls("q-main")}em`,
          fontWeight: 600, color: NAVY, marginTop: 52, lineHeight: lh("q-main"),
        }}>
          {data.questionType || "Which book is this from?"}
        </div>
      </D>

      <D id="q-footer" offsets={offsets} onStartDrag={onStartDrag} onSelect={onSelect} isSelected={selected === "q-footer"} style={{ zIndex: 3 }}>
        <div style={{
          fontFamily: FONT, fontSize: 28 * sc("q-footer"),
          letterSpacing: `${ls("q-footer")}em`, lineHeight: lh("q-footer"),
          color: NAVY, fontWeight: 400,
        }}>
          Swipe →
        </div>
      </D>
    </SlideShell>
  );
}

// ──────────────────────────────────────────────
// Answer slide
// ──────────────────────────────────────────────

function AnswerSlide({
  data, divRef, offsets, styleOverrides, onStartDrag, onSelect, selected,
}: {
  data: Data;
  divRef?: React.Ref<HTMLDivElement>;
  offsets?: Offsets;
  styleOverrides?: StyleOverrides;
  onStartDrag?: (id: string, e: React.MouseEvent) => void;
  onSelect?: (id: string) => void;
  selected?: string | null;
}) {
  function sc(id: string) { return styleOverrides?.[id]?.scale ?? 1; }
  function ls(id: string) { return styleOverrides?.[id]?.letterSpacing ?? (DEFAULT_LS[id] ?? 0); }
  function lh(id: string) { return styleOverrides?.[id]?.lineHeight ?? (DEFAULT_LH[id] ?? 1.2); }

  return (
    // 커스텀 shell: header 고정, 나머지 공간을 middle이 채우고 내부 space-between
    <div
      ref={divRef}
      style={{
        width: W, height: H, backgroundColor: CREAM,
        position: "relative", display: "flex", flexDirection: "column",
        alignItems: "center", padding: "72px 80px",
        overflow: "hidden", flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", inset: 36,
        border: "1.5px solid rgba(29,52,97,0.28)",
        pointerEvents: "none", zIndex: 2,
      }} />

      {/* Header - 상단 고정 */}
      <D id="a-header" offsets={offsets} onStartDrag={onStartDrag} onSelect={onSelect} isSelected={selected === "a-header"} style={{ zIndex: 3, flexShrink: 0 }}>
        <div style={{
          fontFamily: FONT, fontSize: 26 * sc("a-header"),
          letterSpacing: `${ls("a-header")}em`, lineHeight: lh("a-header"),
          color: NAVY, textAlign: "center", fontWeight: 400,
        }}>
          ReadAway POP QUIZ{data.quizNumber ? ` #${data.quizNumber}` : ""}
        </div>
      </D>

      {/* Middle - 남은 공간을 모두 차지하고 Answer/이미지/책제목 space-between */}
      <div style={{
        flex: 1, width: "100%",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "space-between",
        paddingTop: 40, paddingBottom: 16, zIndex: 3,
      }}>
        <D id="a-answer" offsets={offsets} onStartDrag={onStartDrag} onSelect={onSelect} isSelected={selected === "a-answer"}>
          <div style={{
            fontFamily: FONT, fontSize: 110 * sc("a-answer"),
            letterSpacing: `${ls("a-answer")}em`,
            fontWeight: 700, fontStyle: "italic", color: NAVY, lineHeight: lh("a-answer"),
          }}>
            Answer
          </div>
        </D>

        <D id="a-cover" offsets={offsets} onStartDrag={onStartDrag} onSelect={onSelect} isSelected={selected === "a-cover"}>
          {data.coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.coverUrl} alt="Book cover" style={{
              width: 360, height: 490, objectFit: "cover",
              boxShadow: "10px 14px 42px rgba(0,0,0,0.32)", borderRadius: 3,
            }} />
          ) : (
            <div style={{
              width: 360, height: 490, backgroundColor: "#d8ccb5",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "10px 14px 42px rgba(0,0,0,0.32)", borderRadius: 3,
            }}>
              <span style={{ fontFamily: FONT, color: "#8a7a60", fontSize: 32 }}>표지 이미지</span>
            </div>
          )}
        </D>

        <D id="a-bookinfo" offsets={offsets} onStartDrag={onStartDrag} onSelect={onSelect} isSelected={selected === "a-bookinfo"} style={{ textAlign: "center" }}>
          <div style={{
            fontFamily: FONT, fontSize: 96 * sc("a-bookinfo"),
            letterSpacing: `${ls("a-bookinfo")}em`,
            fontWeight: 900, color: NAVY, lineHeight: lh("a-bookinfo"),
            whiteSpace: "pre-wrap", wordBreak: "break-word",
          }}>
            {data.bookTitle || "Book Title"}
          </div>
          <div style={{
            fontFamily: FONT, fontSize: 44 * sc("a-bookinfo"),
            letterSpacing: `${ls("a-bookinfo")}em`,
            fontWeight: 500, color: NAVY, marginTop: 18,
          }}>
            by {data.author || "Author"}
          </div>
        </D>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// MCQ slide
// ──────────────────────────────────────────────

function MCQSlide({
  data, divRef, offsets, styleOverrides, onStartDrag, onSelect, selected,
}: {
  data: Data;
  divRef?: React.Ref<HTMLDivElement>;
  offsets?: Offsets;
  styleOverrides?: StyleOverrides;
  onStartDrag?: (id: string, e: React.MouseEvent) => void;
  onSelect?: (id: string) => void;
  selected?: string | null;
}) {
  function sc(id: string) { return styleOverrides?.[id]?.scale ?? 1; }
  function ls(id: string) { return styleOverrides?.[id]?.letterSpacing ?? (DEFAULT_LS[id] ?? 0); }
  function lh(id: string) { return styleOverrides?.[id]?.lineHeight ?? (DEFAULT_LH[id] ?? 1.2); }

  const optionLines = data.optionsText.split("\n").map((l) => l.trim()).filter(Boolean).slice(0, 4);
  const OPTIONS_LABELS = ["A", "B", "C", "D"];
  const options = OPTIONS_LABELS.map((label, i) => ({
    label,
    text: optionLines[i] ?? `Option ${label}`,
  }));

  const coverW = Math.round(160 * sc("m-bookinfo"));
  const coverH = Math.round(210 * sc("m-bookinfo"));

  return (
    <div
      ref={divRef}
      style={{
        width: W, height: H, backgroundColor: CREAM,
        position: "relative", display: "flex", flexDirection: "column",
        alignItems: "center", padding: "72px 80px",
        overflow: "hidden", flexShrink: 0,
      }}
    >
      <div style={{
        position: "absolute", inset: 36,
        border: "1.5px solid rgba(29,52,97,0.28)",
        pointerEvents: "none", zIndex: 2,
      }} />

      {/* Header */}
      <D id="m-header" offsets={offsets} onStartDrag={onStartDrag} onSelect={onSelect}
        isSelected={selected === "m-header"} style={{ zIndex: 3, flexShrink: 0 }}>
        <div style={{
          fontFamily: FONT, fontSize: 26 * sc("m-header"),
          letterSpacing: `${ls("m-header")}em`, lineHeight: lh("m-header"),
          color: NAVY, textAlign: "center", fontWeight: 400,
        }}>
          ReadAway POP QUIZ{data.quizNumber ? ` #${data.quizNumber}` : ""}
        </div>
      </D>

      {/* Middle — book info / question / options  (space-between) */}
      <div style={{
        flex: 1, width: "100%",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "space-between",
        paddingTop: 32, paddingBottom: 16, zIndex: 3,
      }}>

        {/* Book cover + title row */}
        <D id="m-bookinfo" offsets={offsets} onStartDrag={onStartDrag} onSelect={onSelect}
          isSelected={selected === "m-bookinfo"} style={{ width: "100%" }}>
          <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {/* Cover */}
            {data.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.coverUrl} alt="Book cover" style={{
                width: coverW, height: coverH, objectFit: "cover",
                boxShadow: "8px 10px 32px rgba(0,0,0,0.28)", borderRadius: 3, flexShrink: 0,
              }} />
            ) : (
              <div style={{
                width: coverW, height: coverH, backgroundColor: "#d8ccb5",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "8px 10px 32px rgba(0,0,0,0.28)", borderRadius: 3, flexShrink: 0,
              }}>
                <span style={{ fontFamily: FONT, color: "#8a7a60", fontSize: 22 * sc("m-bookinfo") }}>표지</span>
              </div>
            )}
            {/* Title + author */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: FONT, fontSize: 52 * sc("m-bookinfo"),
                letterSpacing: `${ls("m-bookinfo")}em`, lineHeight: lh("m-bookinfo"),
                fontWeight: 900, color: NAVY,
                wordBreak: "break-word", whiteSpace: "pre-wrap",
              }}>
                {data.bookTitle || "Book Title"}
              </div>
              <div style={{
                fontFamily: FONT, fontSize: 34 * sc("m-bookinfo"),
                letterSpacing: `${ls("m-bookinfo")}em`, lineHeight: lh("m-bookinfo"),
                fontWeight: 500, color: NAVY, marginTop: 10,
              }}>
                by {data.author || "Author"}
              </div>
            </div>
          </div>
        </D>

        {/* Question */}
        <D id="m-question" offsets={offsets} onStartDrag={onStartDrag} onSelect={onSelect}
          isSelected={selected === "m-question"} style={{ width: "100%", textAlign: "center" }}>
          <div style={{
            fontFamily: FONT, fontSize: 38 * sc("m-question"),
            letterSpacing: `${ls("m-question")}em`, lineHeight: lh("m-question"),
            fontWeight: 600, color: NAVY,
            whiteSpace: "pre-wrap", wordBreak: "break-word",
          }}>
            {data.question || "Question text goes here?"}
          </div>
        </D>

        {/* Options A–D */}
        <D id="m-options" offsets={offsets} onStartDrag={onStartDrag} onSelect={onSelect}
          isSelected={selected === "m-options"} style={{ width: "100%", padding: "0 4px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {options.map(({ label, text }) => (
              <div key={label} style={{
                fontFamily: FONT, fontSize: 36 * sc("m-options"),
                letterSpacing: `${ls("m-options")}em`, lineHeight: lh("m-options"),
                fontWeight: 500, color: NAVY,
                display: "flex", gap: 16, alignItems: "flex-start",
              }}>
                <span style={{ fontWeight: 700, flexShrink: 0 }}>{label})</span>
                <span style={{ wordBreak: "break-word" }}>{text}</span>
              </div>
            ))}
          </div>
        </D>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Dashboard
// ──────────────────────────────────────────────

const QUESTION_PRESETS = [
  "Which book is this place from?",
  "Which book is this character from?",
  "Which book is this thing from?",
  "Which book is this quote from?",
];

export default function Dashboard() {
  const [dropActive, setDropActive] = useState(false);
  const [offsets, setOffsets] = useState<Offsets>({});
  const [styleOverrides, setStyleOverrides] = useState<StyleOverrides>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [quizMode, setQuizMode] = useState<"keyword" | "mcq">("keyword");
  const [data, setData] = useState<Data>({
    quizNumber: "", keyword: "", questionType: "Which book is this place from?",
    question: "", optionsText: "",
    bookTitle: "", author: "", coverUrl: "",
  });

  const questionRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ id: string; lastX: number; lastY: number } | null>(null);

  function set(field: keyof Data, value: string) {
    setData((d) => ({ ...d, [field]: value }));
  }

  function setStyleProp(id: string, key: keyof StyleOverride, value: number) {
    setStyleOverrides((prev) => ({
      ...prev,
      [id]: { ...{ scale: 1, letterSpacing: DEFAULT_LS[id] ?? 0, lineHeight: DEFAULT_LH[id] ?? 1.2 }, ...prev[id], [key]: value },
    }));
  }

  function loadImageFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => set("coverUrl", ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) loadImageFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDropActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) loadImageFile(file);
  }

  // Paste image
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const item = Array.from(e.clipboardData?.items ?? []).find(
        (i) => i.type.startsWith("image/")
      );
      if (!item) return;
      const file = item.getAsFile();
      if (file) loadImageFile(file);
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Arrow key movement
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!selected) return;
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      const step = e.shiftKey ? 50 : 10;
      const dx = e.key === "ArrowLeft" ? -step : e.key === "ArrowRight" ? step : 0;
      const dy = e.key === "ArrowUp" ? -step : e.key === "ArrowDown" ? step : 0;
      setOffsets((prev) => ({
        ...prev,
        [selected]: { x: (prev[selected]?.x ?? 0) + dx, y: (prev[selected]?.y ?? 0) + dy },
      }));
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selected]);

  function startDrag(id: string, e: React.MouseEvent) {
    dragState.current = { id, lastX: e.clientX, lastY: e.clientY };
  }

  function onPreviewMouseMove(e: React.MouseEvent) {
    if (!dragState.current) return;
    const dx = (e.clientX - dragState.current.lastX) / SCALE;
    const dy = (e.clientY - dragState.current.lastY) / SCALE;
    dragState.current.lastX = e.clientX;
    dragState.current.lastY = e.clientY;
    const id = dragState.current.id;
    setOffsets((prev) => ({
      ...prev,
      [id]: { x: (prev[id]?.x ?? 0) + dx, y: (prev[id]?.y ?? 0) + dy },
    }));
  }

  function stopDrag() { dragState.current = null; }

  async function downloadSlide(ref: React.RefObject<HTMLDivElement | null>, filename: string) {
    if (!ref.current) return;
    setSelected(null);
    await new Promise<void>((r) => setTimeout(r, 50));
    await document.fonts.ready;
    const clone = ref.current.cloneNode(true) as HTMLElement;
    clone.style.position = "fixed";
    clone.style.top = "0";
    clone.style.left = "0";
    clone.style.zIndex = "99999";
    clone.style.pointerEvents = "none";
    document.body.appendChild(clone);
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(clone, {
      scale: 1, useCORS: true, allowTaint: true, backgroundColor: null, logging: false,
    });
    document.body.removeChild(clone);
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  const suffix = data.quizNumber ? `-${data.quizNumber}` : "";
  const selMeta = selected ? ELEM_META[selected] : null;
  const selScale = selected ? (styleOverrides[selected]?.scale ?? 1) : 1;
  const selLS = selected ? (styleOverrides[selected]?.letterSpacing ?? (DEFAULT_LS[selected] ?? 0)) : 0;
  const selLH = selected ? (styleOverrides[selected]?.lineHeight ?? (DEFAULT_LH[selected] ?? 1.2)) : 1.2;

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* ── Left panel ── */}
      <div style={{
        width: 380, minHeight: "100vh", background: "#fff",
        padding: "40px 28px", borderRight: "1px solid #e8e0d5",
        overflowY: "auto", flexShrink: 0,
      }}>
        <h1 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, color: NAVY, marginBottom: 4 }}>
          ReadAway Quiz Maker
        </h1>
        <p style={{ fontSize: 13, color: "#999", marginBottom: 16 }}>팝퀴즈 이미지 생성기</p>

        {/* ── Mode toggle ── */}
        <div style={{
          display: "flex", marginBottom: 24,
          border: "1.5px solid #e0d8ce", borderRadius: 6, overflow: "hidden",
        }}>
          {(["keyword", "mcq"] as const).map((mode) => (
            <button key={mode} onClick={() => { setQuizMode(mode); setSelected(null); }} style={{
              flex: 1, padding: "9px 0", fontSize: 12, fontWeight: 600,
              background: quizMode === mode ? NAVY : "#fff",
              color: quizMode === mode ? "#fff" : "#888",
              border: "none", cursor: "pointer", fontFamily: "inherit",
              letterSpacing: "0.03em",
            }}>
              {mode === "keyword" ? "키워드 퀴즈" : "객관식 퀴즈"}
            </button>
          ))}
        </div>

        {/* ── Selected element controls ── */}
        {selected && selMeta && (
          <div style={{
            marginBottom: 24, padding: "16px 18px",
            background: "#f8f6f2", borderRadius: 8,
            border: "1.5px solid #ddd8ce",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: NAVY, letterSpacing: "0.04em" }}>
                {selMeta.label}
              </span>
              <button onClick={() => setSelected(null)} style={{
                fontSize: 11, color: "#aaa", background: "none",
                border: "none", cursor: "pointer", padding: 0,
              }}>닫기 ✕</button>
            </div>

            {selMeta.hasFont && (
              <>
                <SliderRow
                  label="크기"
                  display={`${Math.round(selScale * 100)}%`}
                  min={40} max={200} step={1}
                  value={Math.round(selScale * 100)}
                  onChange={(v) => setStyleProp(selected, "scale", v / 100)}
                />
                <SliderRow
                  label="자간"
                  display={`${selLS.toFixed(2)}em`}
                  min={-10} max={50} step={1}
                  value={Math.round(selLS * 100)}
                  onChange={(v) => setStyleProp(selected, "letterSpacing", v / 100)}
                />
                <SliderRow
                  label="행간"
                  display={selLH.toFixed(2)}
                  min={50} max={300} step={1}
                  value={Math.round(selLH * 100)}
                  onChange={(v) => setStyleProp(selected, "lineHeight", v / 100)}
                />
              </>
            )}

            <div style={{ fontSize: 11, color: "#bbb", marginTop: selMeta.hasFont ? 10 : 0 }}>
              방향키로 이동 &nbsp;·&nbsp; Shift+방향키로 큰 이동
            </div>

            {(styleOverrides[selected] || offsets[selected]) && (
              <button
                onClick={() => {
                  setStyleOverrides((p) => { const n = { ...p }; delete n[selected]; return n; });
                  setOffsets((p) => { const n = { ...p }; delete n[selected]; return n; });
                }}
                style={{
                  marginTop: 10, fontSize: 11, color: "#aaa",
                  background: "none", border: "none", cursor: "pointer",
                  textDecoration: "underline", padding: 0,
                }}
              >
                이 요소 초기화
              </button>
            )}
          </div>
        )}

        {/* ── Form ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Field label="퀴즈 번호 (선택)">
            <input type="number" value={data.quizNumber}
              onChange={(e) => set("quizNumber", e.target.value)}
              placeholder="예: 21" style={inputCss} />
          </Field>

          {quizMode === "keyword" ? (
            <>
              <Field label="키워드 *" hint="Enter로 줄바꿈">
                <textarea value={data.keyword}
                  onChange={(e) => set("keyword", e.target.value)}
                  placeholder={"예: Tupelo\nLanding"}
                  rows={2} style={{ ...inputCss, resize: "vertical" }} />
              </Field>

              <Field label="질문 유형 *">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                  {QUESTION_PRESETS.map((q) => (
                    <button key={q} onClick={() => set("questionType", q)} style={{
                      padding: "4px 10px", fontSize: 12,
                      border: `1.5px solid ${data.questionType === q ? NAVY : "#ddd"}`,
                      borderRadius: 20,
                      background: data.questionType === q ? NAVY : "#fff",
                      color: data.questionType === q ? "#fff" : "#555",
                      cursor: "pointer", fontFamily: "inherit",
                    }}>
                      {q.replace("Which book is this ", "").replace("?", "")}
                    </button>
                  ))}
                </div>
                <input type="text" value={data.questionType}
                  onChange={(e) => set("questionType", e.target.value)}
                  placeholder="직접 입력..." style={inputCss} />
              </Field>
            </>
          ) : (
            <>
              <Field label="문제 *" hint="Enter로 줄바꿈">
                <textarea value={data.question}
                  onChange={(e) => set("question", e.target.value)}
                  placeholder="예: On Halloween, Auggie changes his mind..."
                  rows={4} style={{ ...inputCss, resize: "vertical" }} />
              </Field>

              <Field label="보기 (한 줄에 하나씩)" hint="A B C D 자동 추가">
                <textarea
                  value={data.optionsText}
                  onChange={(e) => set("optionsText", e.target.value)}
                  placeholder={"Darth Vader\nBleeding Scream\nThe Mummy\nSkeleton"}
                  rows={4}
                  style={{ ...inputCss, resize: "vertical" }}
                />
              </Field>
            </>
          )}

          <div style={{
            borderTop: "1px solid #f0ebe4", paddingTop: 18,
            fontSize: 12, fontWeight: 600, color: "#aaa",
            letterSpacing: "0.06em", textTransform: "uppercase",
          }}>
            답 슬라이드
          </div>

          <Field label="책 제목 *" hint="Enter로 줄바꿈">
            <textarea value={data.bookTitle}
              onChange={(e) => set("bookTitle", e.target.value)}
              placeholder={"예: The\nUnderneath"}
              rows={2} style={{ ...inputCss, resize: "vertical" }} />
          </Field>

          <Field label="작가 *">
            <input type="text" value={data.author}
              onChange={(e) => set("author", e.target.value)}
              placeholder="예: Kathi Appelt" style={inputCss} />
          </Field>

          <Field label="표지 이미지">
            <label
              onDragOver={(e) => { e.preventDefault(); setDropActive(true); }}
              onDragLeave={() => setDropActive(false)}
              onDrop={handleDrop}
              style={{
                display: "block",
                border: `2px dashed ${dropActive ? NAVY : "#d4c5a9"}`,
                borderRadius: 8, padding: "16px", textAlign: "center",
                cursor: "pointer", fontSize: 13,
                color: dropActive ? NAVY : "#8a7a60",
                background: dropActive ? "#eef0f5" : data.coverUrl ? "#faf6f0" : "transparent",
                transition: "all 0.15s",
              }}
            >
              {data.coverUrl
                ? "✓ 업로드됨 — 클릭·드래그·붙여넣기로 변경"
                : "클릭, 드래그, 또는 Ctrl+V로 붙여넣기"}
              <input type="file" accept="image/*" onChange={handleCoverUpload} style={{ display: "none" }} />
            </label>
            {data.coverUrl && (
              <img src={data.coverUrl} alt="Cover preview" style={{
                marginTop: 8, width: "100%", height: 100,
                objectFit: "cover", borderRadius: 4,
              }} />
            )}
          </Field>

          <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
            <button onClick={() => downloadSlide(questionRef, `quiz-question${suffix}.png`)} style={btnCss(NAVY)}>
              질문 저장
            </button>
            <button onClick={() => downloadSlide(answerRef, `quiz-answer${suffix}.png`)} style={btnCss("#4a6741")}>
              답 저장
            </button>
          </div>

          {(Object.keys(offsets).length > 0 || Object.keys(styleOverrides).length > 0) && (
            <button onClick={() => { setOffsets({}); setStyleOverrides({}); }} style={{
              padding: "8px 0", background: "transparent",
              border: "1.5px solid #e0d8ce", borderRadius: 6,
              fontSize: 12, color: "#aaa", cursor: "pointer", fontFamily: "inherit",
            }}>
              전체 초기화
            </button>
          )}
        </div>
      </div>

      {/* ── Preview panel ── */}
      <div style={{
        flex: 1, padding: "40px 32px", overflowY: "auto",
        display: "flex", flexDirection: "column", gap: 32, alignItems: "center",
      }}>
        <p style={{ fontSize: 12, color: "#bbb", margin: 0 }}>
          요소 클릭으로 선택 · 드래그 또는 방향키로 이동 · 크기·자간은 왼쪽 패널에서 조정
        </p>

        <SlidePreview
          label={quizMode === "keyword" ? "질문 슬라이드" : "객관식 슬라이드"}
          onMouseMove={onPreviewMouseMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          onMouseDown={() => setSelected(null)}
        >
          {quizMode === "keyword" ? (
            <QuestionSlide
              data={data} divRef={questionRef} offsets={offsets} styleOverrides={styleOverrides}
              onStartDrag={startDrag} onSelect={setSelected} selected={selected}
            />
          ) : (
            <MCQSlide
              data={data} divRef={questionRef} offsets={offsets} styleOverrides={styleOverrides}
              onStartDrag={startDrag} onSelect={setSelected} selected={selected}
            />
          )}
        </SlidePreview>

        <SlidePreview
          label="답 슬라이드"
          onMouseMove={onPreviewMouseMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
          onMouseDown={() => setSelected(null)}
        >
          <AnswerSlide
            data={data} divRef={answerRef} offsets={offsets} styleOverrides={styleOverrides}
            onStartDrag={startDrag} onSelect={setSelected} selected={selected}
          />
        </SlidePreview>
      </div>

    </div>
  );
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function SliderRow({
  label, display, min, max, step, value, onChange,
}: {
  label: string;
  display: string;
  min: number; max: number; step: number; value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: "#666", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 12, color: NAVY, fontWeight: 600, fontFamily: "monospace" }}>{display}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: NAVY }}
      />
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#444" }}>{label}</label>
        {hint && <span style={{ fontSize: 11, color: "#bbb" }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function SlidePreview({
  label, children, onMouseMove, onMouseUp, onMouseLeave, onMouseDown,
}: {
  label: string;
  children: React.ReactNode;
  onMouseMove?: (e: React.MouseEvent) => void;
  onMouseUp?: () => void;
  onMouseLeave?: () => void;
  onMouseDown?: () => void;
}) {
  return (
    <div>
      <p style={{
        fontSize: 12, color: "#aaa", textAlign: "center",
        letterSpacing: "0.07em", textTransform: "uppercase",
        marginBottom: 12, fontWeight: 600,
      }}>
        {label}
      </p>
      <div
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onMouseDown={onMouseDown}
        style={{
          width: W * SCALE, height: H * SCALE,
          overflow: "hidden", boxShadow: "0 8px 36px rgba(0,0,0,0.14)",
          borderRadius: 4, flexShrink: 0,
        }}
      >
        <div style={{ transform: `scale(${SCALE})`, transformOrigin: "top left" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

const inputCss: React.CSSProperties = {
  width: "100%", padding: "9px 12px", border: "1.5px solid #e0d8ce",
  borderRadius: 6, fontSize: 14, color: "#333", background: "#fafaf8",
  boxSizing: "border-box", fontFamily: "inherit", outline: "none",
};

function btnCss(bg: string): React.CSSProperties {
  return {
    flex: 1, padding: "11px 0", background: bg, color: "#fff",
    border: "none", borderRadius: 6, fontSize: 13, fontWeight: 600,
    cursor: "pointer", letterSpacing: "0.02em", fontFamily: "inherit",
  };
}
