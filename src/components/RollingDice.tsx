import { useState, useRef, useEffect, useCallback, useId } from "react";

interface RollingDiceProps {
  onClose?: () => void;
}

const TOTAL_ROLLS = 6;

// Weighted probabilities so that P(total > 25) ≈ 0.2% and mean ≈ 15
const DICE_WEIGHTS = [320, 250, 200, 125, 75, 30];
const WEIGHT_TOTAL = DICE_WEIGHTS.reduce((a, b) => a + b, 0);

function weightedRoll(): number {
  const rand = Math.random() * WEIGHT_TOTAL;
  let cumulative = 0;
  for (let face = 0; face < DICE_WEIGHTS.length; face++) {
    cumulative += DICE_WEIGHTS[face];
    if (rand < cumulative) return face + 1;
  }
  return 6;
}

// 3x3 dot positions
const DOT_PATTERNS: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [[0, 2], [2, 0]],
  3: [[0, 2], [1, 1], [2, 0]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

// Sleek modern dot styling
const DICE_THEMES: Record<number, { bg: string; dot: string; glow: string }> = {
  1: { bg: "#ffffff", dot: "#0f172a", glow: "rgba(15, 23, 42, 0.12)" },
  2: { bg: "#ffffff", dot: "#d97706", glow: "rgba(217, 119, 6, 0.15)" },
  3: { bg: "#ffffff", dot: "#059669", glow: "rgba(5, 150, 105, 0.15)" },
  4: { bg: "#ffffff", dot: "#2563eb", glow: "rgba(37, 99, 235, 0.15)" },
  5: { bg: "#ffffff", dot: "#e11d48", glow: "rgba(225, 29, 72, 0.15)" },
  6: { bg: "#ffffff", dot: "#7c3aed", glow: "rgba(124, 58, 237, 0.15)" },
};

const AVAILABLE_COURSES = [
  "React JS & Modern Frontend",
  "Full Stack Web Development (MERN / Next.js)",
  "Python, AI & Machine Learning",
  "Data Science & Analytics",
  "UI/UX & Product Design",
  "Cloud Computing & DevOps",
  "Cybersecurity & Ethical Hacking",
];

function ModernDice({ value, size = 76 }: { value: number; size?: number }) {
  const dots = DOT_PATTERNS[value] || DOT_PATTERNS[1];
  const theme = DICE_THEMES[value] || DICE_THEMES[1];
  const dotSize = Math.max(size * 0.18, 5);
  const padding = size * 0.19;
  const cellSize = (size - padding * 2) / 2;

  return (
    <div
      className="relative bg-white border border-slate-900/10 flex items-center justify-center transition-transform"
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.25),
        boxShadow: `0 14px 28px -6px ${theme.glow}, 0 4px 10px -2px rgba(0,0,0,0.06), inset 0 2px 3px rgba(255,255,255,0.95), inset 0 -3px 6px rgba(0,0,0,0.04)`,
      }}
    >
      {dots.map(([row, col], i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: dotSize,
            height: dotSize,
            backgroundColor: theme.dot,
            top: padding + row * cellSize - dotSize / 2,
            left: padding + col * cellSize - dotSize / 2,
            boxShadow: `inset 0 1.5px 2px rgba(0,0,0,0.35), 0 1px 1px rgba(255,255,255,0.6)`,
          }}
        />
      ))}
    </div>
  );
}

export function RollingDice({ onClose }: RollingDiceProps) {
  // Navigation / view state: "game" | "form" | "submitted"
  const [currentView, setCurrentView] = useState<"game" | "form" | "submitted">("game");

  // Form states
  const [userName, setUserName] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(AVAILABLE_COURSES[0]);
  const [userEmail, setUserEmail] = useState("");
  const [formError, setFormError] = useState("");

  const nameInputId = useId();
  const emailInputId = useId();
  const courseInputId = useId();

  // Game state
  const [rolls, setRolls] = useState<number[]>([]);
  const [currentRoll, setCurrentRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [dicePos, setDicePos] = useState({ x: 0, y: 0, rotation: 0 });

  const animFrameRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const rollsCount = rolls.length;
  const isOverComplete = rollsCount === TOTAL_ROLLS;
  const total = rolls.reduce((sum, r) => sum + r, 0);

  // Clean, fast bouncing animation (bouncing off boundaries without squash or distortion)
  const startBounce = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const diceSize = 76;
    const bounds = {
      w: Math.max(container.clientWidth - diceSize, 80),
      h: Math.max(container.clientHeight - diceSize, 80),
    };

    let x = bounds.w / 2;
    let y = bounds.h / 2;

    const speed = 25;
    const angle = Math.random() * Math.PI * 2;
    let vx = Math.cos(angle) * speed;
    let vy = Math.sin(angle) * speed;
    if (Math.abs(vx) < 12) vx = Math.sign(vx || 1) * 16;
    if (Math.abs(vy) < 12) vy = Math.sign(vy || 1) * 16;
    const mag = Math.hypot(vx, vy);
    vx = (vx / mag) * speed;
    vy = (vy / mag) * speed;

    let rotation = 0;

    function animate() {
      x += vx;
      y += vy;
      rotation += 20;

      let bounced = false;
      if (x <= 0) {
        x = 0;
        vx = Math.abs(vx);
        bounced = true;
      } else if (x >= bounds.w) {
        x = bounds.w;
        vx = -Math.abs(vx);
        bounced = true;
      }

      if (y <= 0) {
        y = 0;
        vy = Math.abs(vy);
        bounced = true;
      } else if (y >= bounds.h) {
        y = bounds.h;
        vy = -Math.abs(vy);
        bounced = true;
      }

      if (bounced) {
        vx += (Math.random() - 0.5) * 6;
        vy += (Math.random() - 0.5) * 6;
        const currentMag = Math.hypot(vx, vy);
        if (currentMag > 0) {
          vx = (vx / currentMag) * speed;
          vy = (vy / currentMag) * speed;
        }
      }

      setDicePos({ x, y, rotation });
      animFrameRef.current = requestAnimationFrame(animate);
    }

    animFrameRef.current = requestAnimationFrame(animate);
  }, []);

  const stopBounce = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
    const container = containerRef.current;
    if (container) {
      setDicePos({
        x: (container.clientWidth - 76) / 2,
        y: (container.clientHeight - 76) / 2,
        rotation: 0,
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  useEffect(() => {
    function centerDice() {
      const container = containerRef.current;
      if (container && !isRolling) {
        setDicePos({
          x: (container.clientWidth - 76) / 2,
          y: (container.clientHeight - 76) / 2,
          rotation: 0,
        });
      }
    }
    centerDice();
    window.addEventListener("resize", centerDice);
    return () => window.removeEventListener("resize", centerDice);
  }, [isRolling]);

  function rollDice() {
    if (isOverComplete || isRolling) return;

    setIsRolling(true);
    setCurrentRoll(null);
    startBounce();

    let count = 0;
    const interval = setInterval(() => {
      setCurrentRoll(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count >= 18) {
        clearInterval(interval);
        stopBounce();
        const finalValue = weightedRoll();
        setCurrentRoll(finalValue);
        setRolls((prev) => [...prev, finalValue]);
        setIsRolling(false);
      }
    }, 55);
  }

  function resetGame() {
    setRolls([]);
    setCurrentRoll(null);
    setIsRolling(false);
    stopBounce();
    setCurrentView("game");
  }

  function handleFinalizeClick() {
    setFormError("");
    setCurrentView("form");
  }

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userName.trim()) {
      setFormError("Please enter your name.");
      return;
    }
    setFormError("");
    setCurrentView("submitted");
  }

  const displayValue = currentRoll ?? (rolls.length > 0 ? rolls[rolls.length - 1] : 1);

  // -------------------------------------------------------------
  // VIEW 1: FINALIZED APPLICATION SUCCESS SCREEN
  // -------------------------------------------------------------
  if (currentView === "submitted") {
    return (
      <div className="h-full flex flex-col p-6 sm:p-8 items-center justify-center text-center select-none overflow-y-auto">
        <div className="w-16 h-16 rounded-full bg-[#e8f5ee] text-[#0d7c4a] flex items-center justify-center text-3xl mb-4 shadow-md shadow-[#0d7c4a]/10">
          🎉
        </div>

        <span className="text-xs font-extrabold uppercase tracking-widest text-[#0d7c4a] mb-1">
          Submission Successful
        </span>

        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-2">
          Score Finalized, {userName}!
        </h3>

        <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
          Your score of <strong className="text-slate-900 font-bold text-base">{total}</strong> has been locked in for <strong className="text-[#0d7c4a] font-bold">{selectedCourse}</strong>. Our academic team will be in touch with your customized discount.
        </p>

        <div className="w-full max-w-sm bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 flex flex-col gap-2 text-left">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/80">
            <span className="text-slate-500 font-medium">Applicant Name</span>
            <span className="font-bold text-slate-900">{userName}</span>
          </div>
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/80">
            <span className="text-slate-500 font-medium">Final Over Score</span>
            <span className="font-extrabold text-base text-[#0d7c4a]">{total} / 36</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Selected Course</span>
            <span className="font-semibold text-slate-900 max-w-[180px] truncate text-right">{selectedCourse}</span>
          </div>
        </div>

        <div className="flex gap-3 w-full max-w-sm">
          <button
            className="flex-1 h-12 rounded-xl bg-[#0d7c4a] hover:bg-[#0a6b3f] text-white text-sm font-bold shadow-md shadow-[#0d7c4a]/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            onClick={resetGame}
          >
            <span>Play Again 🎲</span>
          </button>
          {onClose && (
            <button
              className="h-12 px-5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-bold transition-all cursor-pointer"
              onClick={onClose}
            >
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: FINALIZE SCORE FORM VIEW
  // -------------------------------------------------------------
  if (currentView === "form") {
    return (
      <div className="h-full flex flex-col p-6 sm:p-7 select-none overflow-y-auto">
        {/* Header with Back button */}
        <div className="flex items-center justify-between shrink-0 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              onClick={() => setCurrentView("game")}
              aria-label="Back to game"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Finalize Your Score
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Claim your scholarship or course perk based on your rolls
              </p>
            </div>
          </div>

          {onClose && (
            <button
              className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-400 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col justify-between gap-4">
          <div className="flex flex-col gap-4">
            {/* Auto-filled Score Card */}
            <div className="bg-[#e8f5ee] border border-[#0d7c4a]/30 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#0d7c4a] text-white flex items-center justify-center text-xl shadow-md shadow-[#0d7c4a]/20">
                  🏆
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0d7c4a] block">
                    Locked Score (1 Over)
                  </span>
                  <span className="text-xs text-slate-600 font-medium">
                    Calculated from all {rollsCount} rolls
                  </span>
                </div>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-[#0d7c4a]">{total}</span>
                <span className="text-xs font-bold text-slate-400">/ 36</span>
              </div>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <span>⚠️</span>
                <span>{formError}</span>
              </div>
            )}

            {/* Name Input */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor={nameInputId} className="text-xs font-bold text-slate-700">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id={nameInputId}
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#0d7c4a] focus:ring-2 focus:ring-[#0d7c4a]/20 transition-all"
                autoFocus
              />
            </div>

            {/* Email / Contact Input (Optional) */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor={emailInputId} className="text-xs font-bold text-slate-700">
                Email Address or Phone <span className="text-slate-400 font-normal">(for offer details)</span>
              </label>
              <input
                id={emailInputId}
                type="text"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="you@example.com or phone number"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#0d7c4a] focus:ring-2 focus:ring-[#0d7c4a]/20 transition-all"
              />
            </div>

            {/* Course Dropdown */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor={courseInputId} className="text-xs font-bold text-slate-700">
                Course You Want to Choose <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  id={courseInputId}
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-medium focus:outline-none focus:border-[#0d7c4a] focus:ring-2 focus:ring-[#0d7c4a]/20 transition-all appearance-none cursor-pointer"
                >
                  {AVAILABLE_COURSES.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              className="h-12 px-5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-bold transition-all cursor-pointer"
              onClick={() => setCurrentView("game")}
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 h-12 rounded-xl bg-[#0d7c4a] hover:bg-[#0a6b3f] text-white text-sm font-bold shadow-lg shadow-[#0d7c4a]/30 hover:shadow-xl hover:shadow-[#0d7c4a]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Submit & Finalize Application</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>
        </form>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 3: MAIN DICE GAME VIEW (Clean 2D Bounce Animation)
  // -------------------------------------------------------------
  return (
    <div className="h-full flex flex-col p-6 sm:p-7 gap-3 sm:gap-4 select-none">
      {/* Modern Top Navigation Bar */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex flex-col gap-1">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold tracking-wider text-[#0d7c4a] uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            1 OVER MATCH
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Six Rolls Challenge
          </h2>
        </div>

        <div className="flex items-center gap-2.5">
          <div
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
              isOverComplete ? "bg-[#e8f5ee] text-[#0d7c4a]" : "bg-slate-100 text-slate-600"
            }`}
          >
            {isOverComplete ? (
              <>🎉 Over Complete</>
            ) : (
              <>
                <span className="uppercase text-[10px] tracking-wider text-slate-400">Ball</span>
                <span className="text-slate-900 font-extrabold text-sm">
                  {rollsCount + 1}
                  <span className="text-slate-400 font-semibold text-xs">/6</span>
                </span>
              </>
            )}
          </div>

          {onClose && (
            <button
              className="w-9 h-9 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-slate-900 hover:bg-slate-50 flex items-center justify-center transition-all cursor-pointer"
              onClick={onClose}
              aria-label="Close modal"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Ball Progress Dots */}
      <div className="grid grid-cols-6 gap-2 shrink-0">
        {Array.from({ length: TOTAL_ROLLS }).map((_, i) => {
          const isDone = i < rolls.length;
          const isCurrent = i === rolls.length && !isOverComplete;
          return (
            <div key={i} className="flex flex-col gap-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  isDone
                    ? "bg-[#0d7c4a]"
                    : isCurrent
                    ? "bg-emerald-500 shadow-sm shadow-emerald-400"
                    : "bg-slate-200"
                }`}
              />
              <span
                className={`text-[10px] font-bold text-center tracking-tight transition-colors ${
                  isDone ? "text-[#0d7c4a]" : isCurrent ? "text-slate-900 font-extrabold" : "text-slate-400"
                }`}
              >
                {isDone ? `+${rolls[i]}` : `Ball ${i + 1}`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Clean 2D Bouncing Arena */}
      <div className="relative flex-1 min-h-[180px] rounded-2xl overflow-hidden bg-transparent" ref={containerRef}>
        <div
          className="absolute top-0 left-0 will-change-transform drop-shadow-xl"
          style={{
            transform: `translate(${dicePos.x}px, ${dicePos.y}px) rotate(${dicePos.rotation}deg)`,
            transition: isRolling ? "none" : "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        >
          <ModernDice value={displayValue} size={76} />
        </div>
      </div>

      {/* History Slots (Sleek minimalist cards) */}
      <div className="grid grid-cols-6 gap-2 sm:gap-2.5 shrink-0">
        {Array.from({ length: TOTAL_ROLLS }).map((_, i) => {
          const val = rolls[i];
          const hasRoll = val !== undefined;
          const isNext = i === rolls.length && !isOverComplete;
          return (
            <div
              key={i}
              className={`rounded-2xl p-2 flex flex-col items-center gap-1.5 transition-all duration-200 ${
                hasRoll
                  ? "bg-white border border-slate-200 shadow-sm"
                  : isNext
                  ? "bg-white border-2 border-[#0d7c4a] shadow-md shadow-[#0d7c4a]/10"
                  : "bg-slate-50 border border-slate-200/80"
              }`}
            >
              <span className={`text-[10px] font-extrabold uppercase ${hasRoll ? "text-[#0d7c4a]" : "text-slate-400"}`}>
                #{i + 1}
              </span>
              <div className="w-8 h-8 flex items-center justify-center">
                {hasRoll ? (
                  <ModernDice value={val} size={28} />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-dashed border-slate-300" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modern Bottom Dock */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.3fr] gap-3 sm:gap-4 items-center shrink-0 pt-1">
        {/* Score Card */}
        <div
          className={`rounded-2xl p-3 sm:px-4 flex items-center justify-between border transition-all duration-300 ${
            isOverComplete ? "bg-[#e8f5ee] border-[#0d7c4a]" : "bg-slate-50 border-slate-200"
          }`}
        >
          <div className="flex flex-col gap-0.5">
            <span
              className={`text-[10px] font-extrabold tracking-wider uppercase ${
                isOverComplete ? "text-[#0d7c4a]" : "text-slate-500"
              }`}
            >
              {isOverComplete ? "🏆 FINAL SCORE" : "CURRENT SCORE"}
            </span>
            <span className={`text-xs font-semibold ${isOverComplete ? "text-[#0a6b3f]" : "text-slate-400"}`}>
              {isOverComplete
                ? total > 20
                  ? "Incredible score!"
                  : "Solid performance!"
                : `${TOTAL_ROLLS - rollsCount} rolls remaining`}
            </span>
          </div>
          <div className="flex items-baseline">
            <span
              className={`text-3xl font-extrabold tracking-tight ${
                isOverComplete ? "text-[#0d7c4a]" : "text-slate-900"
              }`}
            >
              {rollsCount === 0 ? "0" : total}
            </span>
          </div>
        </div>

        {/* Action Buttons: Roll OR (Finalize + Play Again) */}
        <div className="flex w-full gap-2">
          {!isOverComplete ? (
            <button
              className={`w-full h-14 rounded-2xl border-none text-white text-base font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-[#0d7c4a]/30 hover:shadow-xl hover:shadow-[#0d7c4a]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer ${
                isRolling ? "bg-slate-900 cursor-wait opacity-80" : "bg-[#0d7c4a] hover:bg-[#0a6b3f]"
              }`}
              onClick={rollDice}
              disabled={isRolling}
            >
              {isRolling ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span>Rolling Ball {rollsCount + 1}...</span>
                </>
              ) : (
                <>
                  <span>Roll Ball {rollsCount + 1} of 6</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </>
              )}
            </button>
          ) : (
            <>
              {/* Secondary Play Again Button */}
              <button
                className="w-14 h-14 rounded-2xl border-2 border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center transition-all cursor-pointer shrink-0"
                onClick={resetGame}
                title="Play Again"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10"></polyline>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                </svg>
              </button>

              {/* Primary Finalize Score Button */}
              <button
                className="flex-1 h-14 rounded-2xl bg-[#0d7c4a] hover:bg-[#0a6b3f] text-white text-base font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#0d7c4a]/30 hover:shadow-xl hover:shadow-[#0d7c4a]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                onClick={handleFinalizeClick}
              >
                <span>Finalize Score ✨</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
