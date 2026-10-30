import { useState } from "react";
import { RollingDice } from "./components/RollingDice";

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Background landing view */}
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#fafbfb] text-slate-900">
        <div className="max-w-xl flex flex-col items-center text-center gap-4">
          <div className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#e8f5ee] text-[#0d7c4a] tracking-wide uppercase">
            🔥 Test Your Luck
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Level Up Your <span className="text-[#0d7c4a]">Game.</span>
          </h1>
          <p className="text-slate-500 text-base sm:text-lg font-medium leading-relaxed max-w-md">
            Roll 1 over (6 balls) with a single dice. Can you beat the odds?
          </p>
          <button
            className="mt-2 px-7 py-3.5 rounded-2xl bg-[#0d7c4a] hover:bg-[#0a6b3f] text-white text-base font-bold shadow-lg shadow-[#0d7c4a]/30 hover:shadow-xl hover:shadow-[#0d7c4a]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            <span>🎲 Start 1 Over Challenge</span>
          </button>
        </div>
      </div>

      {/* Modern Centered Modal Dialog */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div className="w-full max-w-[720px] max-h-[90vh] h-[580px] bg-white rounded-3xl shadow-2xl ring-1 ring-slate-900/5 overflow-hidden flex flex-col">
            <RollingDice onClose={() => setIsOpen(false)} />
          </div>
        </div>
      )}

      {/* Floating launcher widget */}
      <div className="fixed bottom-7 right-7 z-50">
        <button
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white cursor-pointer transition-all duration-200 shadow-xl hover:scale-105 hover:-translate-y-0.5 ${
            isOpen
              ? "bg-slate-800 shadow-slate-900/30"
              : "bg-[#0d7c4a] shadow-[#0d7c4a]/40"
          }`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle game"
        >
          {isOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <span className="text-2xl leading-none select-none">🎲</span>
          )}
        </button>
      </div>
    </>
  );
}

export default App;
