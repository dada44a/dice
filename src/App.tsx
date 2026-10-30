import { useState } from "react";
import { RollingDice } from "./components/RollingDice";

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Main page content */}
      <div className="page">
        <h1>🎲 Take a Chance, Make a Difference!</h1>
        <p className="subtitle">Click the dice button below to start your over.</p>
      </div>

      {/* Popup chat-style widget */}
      <div className={`popup-widget ${isOpen ? "open" : ""}`}>
        {isOpen && (
          <div className="popup-panel">
            <div className="popup-title-bar">
              <span>🎲 Dice Game</span>
              <button className="close-btn" onClick={() => setIsOpen(false)}>
                ✕
              </button>
            </div>
            <div className="popup-body">
              <RollingDice />
            </div>
          </div>
        )}
        <button
          className={`popup-toggle ${isOpen ? "active" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "✕" : "🎲"}
        </button>
      </div>
    </>
  );
}

export default App;
