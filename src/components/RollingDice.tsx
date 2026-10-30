import { useState } from "react";

const TOTAL_ROLLS = 6;

// Unicode dice faces
const diceFaces: Record<number, string> = {
  1: "⚀",
  2: "⚁",
  3: "⚂",
  4: "⚃",
  5: "⚄",
  6: "⚅",
};

export function RollingDice() {
  const [rolls, setRolls] = useState<number[]>([]);
  const [currentRoll, setCurrentRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const rollsLeft = TOTAL_ROLLS - rolls.length;
  const isOverComplete = rolls.length === TOTAL_ROLLS;
  const total = rolls.reduce((sum, r) => sum + r, 0);

  function rollDice() {
    if (isOverComplete || isRolling) return;

    setIsRolling(true);
    setCurrentRoll(null);

    // Animate through random faces quickly
    let count = 0;
    const interval = setInterval(() => {
      setCurrentRoll(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count >= 10) {
        clearInterval(interval);
        const finalValue = Math.floor(Math.random() * 6) + 1;
        setCurrentRoll(finalValue);
        setRolls((prev) => [...prev, finalValue]);
        setIsRolling(false);
      }
    }, 80);
  }

  function resetGame() {
    setRolls([]);
    setCurrentRoll(null);
    setIsRolling(false);
  }

  return (
    <div className="dice-game">
      {/* Header */}
      <div className="dice-header">
        <span>🎲 Dice Over</span>
        <span className="rolls-badge">
          {isOverComplete ? "Complete!" : `${rollsLeft} roll${rollsLeft !== 1 ? "s" : ""} left`}
        </span>
      </div>

      {/* Dice display */}
      <div className="dice-display">
        <div className={`dice-face ${isRolling ? "rolling" : ""} ${currentRoll ? "visible" : ""}`}>
          {currentRoll ? diceFaces[currentRoll] : "🎲"}
        </div>
      </div>

      {/* Roll history */}
      {rolls.length > 0 && (
        <div className="roll-history">
          {rolls.map((roll, i) => (
            <div key={i} className="roll-chip">
              <span className="roll-number">#{i + 1}</span>
              <span className="roll-value">{diceFaces[roll]} {roll}</span>
            </div>
          ))}
        </div>
      )}

      {/* Total */}
      {rolls.length > 0 && (
        <div className={`dice-total ${isOverComplete ? "final" : ""}`}>
          <span>{isOverComplete ? "Final Total" : "Running Total"}</span>
          <span className="total-value">{total}</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="dice-actions">
        {!isOverComplete ? (
          <button className="roll-btn" onClick={rollDice} disabled={isRolling}>
            {isRolling ? "Rolling..." : rolls.length === 0 ? "Roll Dice 🎲" : "Roll Again 🎲"}
          </button>
        ) : (
          <button className="reset-btn" onClick={resetGame}>
            Play Again 🔄
          </button>
        )}
      </div>
    </div>
  );
}
