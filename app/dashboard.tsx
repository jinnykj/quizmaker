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
  bookTitle: string;
  author: string;
  coverUrl: string;
};

type Offsets = Record<string, { x: number; y: number }>;

// ──────────────────────────────────────────────
// Slide shell
// ──────────────────────────────────────────────

function SlideShell({
  children,
  divRef,
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
// Draggable wrapper — only active when onStartDrag is provided
// ──────────────────────────────────────────────

function D({
  id, offsets, onStartDrag, style, children,
}: {
  id: string;
  offsets?: Offsets;
  onStartDrag?: (id: string, e: React.MouseEvent) => void;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const off = offsets?.[id] ?? { x: 0, y: 0 };
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseDown={onStartDrag ? (e) => { e.stopPropagation(); onStartDrag(id, e); } : undefined}
      onMouseEnter={onStartDrag ? () => setHover(true) : undefined}
      onMouseLeave={onStartDrag ? () => setHover(false) : undefined}
      style={{
        ...style,
        transform: `translate(${off.x}px, ${off.y}px)`,
        cursor: onStartDrag ? "grab" : undefined,
        userSelect: "none",
        outline: hover && onStartDrag ? "2px dashed rgba(29,52,97,0.35)" : undefined,
        outlineOffset: "8px",
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
  data, divRef, offsets, onStartDrag,
}: {
  data: Data;
  divRef?: React.Ref<HTMLDivElement>;
  offsets?: Offsets;
  onStartDrag?: (id: string, e: React.MouseEvent) => void;
}) {
  return (
    <SlideShell divRef={divRef}>
      <D id="q-header" offsets={offsets} onStartDrag={onStartDrag} style={{ zIndex: 3 }}>
        <div style={{
          fontFamily: FONT, fontSize: 26, letterSpacing: "0.13em",
          color: NAVY, textAlign: "center", fontWeight: 400,
        }}>
          ReadAway POP QUIZ{data.quizNumber ? ` #${data.quizNumber}` : ""}
        </div>
      </D>

      <D id="q-main" offsets={offsets} onStartDrag={onStartDrag} style={{ textAlign: "center", zIndex: 3, padding: "0 20px" }}>
        <div style={{
          fontFamily: FONT, fontSize: 215, fontWeight: 900,
          color: NAVY, lineHeight: 0.92, letterSpacing: "-0.015em",
          whiteSpace: "pre-wrap", wordBreak: "break-word",
        }}>
          {data.keyword || "Keyword"}
        </div>
        <div style={{
          fontFamily: FONT, fontSize: 50, fontWeight: 600,
          color: NAVY, marginTop: 52, lineHeight: 1.35,
        }}>
          {data.questionType || "Which book is this from?"}
        </div>
      </D>

      <D id="q-footer" offsets={offsets} onStartDrag={onStartDrag} style={{ zIndex: 3 }}>
        <div style={{
          fontFamily: FONT, fontSize: 28, color: NAVY,
          letterSpacing: "0.08em", fontWeight: 400,
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
  data, divRef, offsets, onStartDrag,
}: {
  data: Data;
  divRef?: React.Ref<HTMLDivElement>;
  offsets?: Offsets;
  onStartDrag?: (id: string, e: React.MouseEvent) => void;
}) {
  return (
    <SlideShell divRef={divRef}>
      <D id="a-header" offsets={offsets} onStartDrag={onStartDrag} style={{ zIndex: 3 }}>
        <div style={{
          fontFamily: FONT, fontSize: 26, letterSpacing: "0.13em",
          color: NAVY, textAlign: "center", fontWeight: 400,
        }}>
          ReadAway POP QUIZ{data.quizNumber ? ` #${data.quizNumber}` : ""}
        </div>
      </D>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36, zIndex: 3 }}>
        <D id="a-answer" offsets={offsets} onStartDrag={onStartDrag}>
          <div style={{
            fontFamily: FONT, fontSize: 110, fontWeight: 700,
            fontStyle: "italic", color: NAVY, lineHeight: 1,
          }}>
            Answer
          </div>
        </D>

        <D id="a-cover" offsets={offsets} onStartDrag={onStartDrag}>
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

        <D id="a-bookinfo" offsets={offsets} onStartDrag={onStartDrag} style={{ textAlign: "center" }}>
          <div style={{
            fontFamily: FONT, fontSize: 96, fontWeight: 900,
            color: NAVY, lineHeight: 1, letterSpacing: "-0.01em",
            whiteSpace: "pre-wrap", wordBreak: "break-word",
          }}>
            {data.bookTitle || "Book Title"}
          </div>
          <div style={{
            fontFamily: FONT, fontSize: 44, fontWeight: 500,
            color: NAVY, marginTop: 18,
          }}>
            by {data.author || "Author"}
          </div>
        </D>
      </div>

      <div style={{ height: 28 }} />
    </SlideShell>
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
  const [data, setData] = useState<Data>({
    quizNumber: "",
    keyword: "",
    questionType: "Which book is this place from?",
    bookTitle: "",
    author: "",
    coverUrl: "",
  });

  const questionRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ id: string; lastX: number; lastY: number } | null>(null);

  function set(field: keyof Data, value: string) {
    setData((d) => ({ ...d, [field]: value }));
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

  function stopDrag() {
    dragState.current = null;
  }

  async function downloadSlide(
    ref: React.RefObject<HTMLDivElement | null>,
    filename: string
  ) {
    if (!ref.current) return;
    await document.fonts.ready;
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(ref.current, {
      scale: 1, useCORS: true, allowTaint: true,
      backgroundColor: null, logging: false,
    });
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  const suffix = data.quizNumber ? `-${data.quizNumber}` : "";

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* ── Left form panel ── */}
      <div style={{
        width: 380, minHeight: "100vh", background: "#fff",
        padding: "40px 28px", borderRight: "1px solid #e8e0d5",
        overflowY: "auto", flexShrink: 0,
      }}>
        <h1 style={{ fontFamily: FONT, fontSize: 22, fontWeight: 700, color: NAVY, marginBottom: 4 }}>
          ReadAway Quiz Maker
        </h1>
        <p style={{ fontSize: 13, color: "#999", marginBottom: 32 }}>팝퀴즈 이미지 생성기</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Field label="퀴즈 번호 (선택)">
            <input type="number" value={data.quizNumber}
              onChange={(e) => set("quizNumber", e.target.value)}
              placeholder="예: 21" style={inputCss} />
          </Field>

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

          {Object.keys(offsets).length > 0 && (
            <button onClick={() => setOffsets({})} style={{
              padding: "8px 0", background: "transparent",
              border: "1.5px solid #e0d8ce", borderRadius: 6,
              fontSize: 12, color: "#aaa", cursor: "pointer", fontFamily: "inherit",
            }}>
              위치 초기화
            </button>
          )}
        </div>
      </div>

      {/* ── Right preview panel ── */}
      <div style={{
        flex: 1, padding: "40px 32px", overflowY: "auto",
        display: "flex", flexDirection: "column", gap: 32, alignItems: "center",
      }}>
        <p style={{ fontSize: 12, color: "#bbb", margin: 0 }}>
          미리보기에서 요소를 드래그해 위치를 조정할 수 있습니다
        </p>

        <SlidePreview
          label="질문 슬라이드"
          onMouseMove={onPreviewMouseMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
        >
          <QuestionSlide data={data} offsets={offsets} onStartDrag={startDrag} />
        </SlidePreview>

        <SlidePreview
          label="답 슬라이드"
          onMouseMove={onPreviewMouseMove}
          onMouseUp={stopDrag}
          onMouseLeave={stopDrag}
        >
          <AnswerSlide data={data} offsets={offsets} onStartDrag={startDrag} />
        </SlidePreview>
      </div>

      {/* ── Hidden full-size slides for export ── */}
      <div style={{ position: "fixed", left: -W - 100, top: 0, zIndex: -1 }} aria-hidden>
        <QuestionSlide data={data} divRef={questionRef} offsets={offsets} />
      </div>
      <div style={{ position: "fixed", left: -W - 100, top: 0, zIndex: -1 }} aria-hidden>
        <AnswerSlide data={data} divRef={answerRef} offsets={offsets} />
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function Field({
  label, hint, children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
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
  label, children, onMouseMove, onMouseUp, onMouseLeave,
}: {
  label: string;
  children: React.ReactNode;
  onMouseMove?: (e: React.MouseEvent) => void;
  onMouseUp?: () => void;
  onMouseLeave?: () => void;
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
        style={{
          width: W * SCALE, height: H * SCALE,
          overflow: "hidden",
          boxShadow: "0 8px 36px rgba(0,0,0,0.14)",
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
