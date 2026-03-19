import { useState } from "react";

function QuizView({ summary, questions, onBack }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <div style={{ maxWidth: 700, margin: "20px auto", padding: 20 }}>
        <button onClick={onBack}>← Back</button>
        <p>No quiz questions available.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];

  const handleNext = () => {
    if (selectedIndex === null) return;

    if (selectedIndex === currentQuestion.correctIndex) {
      setScore((s) => s + 1);
    }

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((i) => i + 1);
      setSelectedIndex(null);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setScore(0);
    setCurrentIdx(0);
    setSelectedIndex(null);
    setShowResult(false);
  };

  return (
    <div style={{ maxWidth: 700, margin: "20px auto", padding: 20 }}>
      <button onClick={onBack}>← Back</button>

      <h2 style={{ marginTop: 12 }}>Quiz from Summary</h2>

      <div
        style={{
          padding: 12,
          margin: "12px 0 20px",
          borderRadius: 8,
          backgroundColor: "#181818",
          color: "#ddd",
        }}
      >
        <strong>Summary used:</strong>
        <p style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>{summary}</p>
      </div>

      {showResult ? (
        <div>
          <h3>Your Score</h3>
          <p>
            {score} / {questions.length}
          </p>
          <button onClick={handleRestart}>Restart quiz</button>
        </div>
      ) : (
        <div>
          <h3>
            Question {currentIdx + 1} of {questions.length}
          </h3>
          <p style={{ margin: "12px 0" }}>{currentQuestion.question}</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {currentQuestion.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                style={{
                  textAlign: "left",
                  padding: "8px 12px",
                  borderRadius: 8,
                  border:
                    selectedIndex === idx
                      ? "2px solid #3ea6ff"
                      : "1px solid #444",
                  backgroundColor: "#222",
                  color: "#eee",
                  cursor: "pointer",
                }}
              >
                {opt}
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            style={{
              marginTop: 16,
              padding: "8px 16px",
              borderRadius: 999,
              border: "none",
              background:
                "linear-gradient(135deg, #3ea6ff, #65b7ff)",
              color: "#000",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {currentIdx + 1 === questions.length ? "Finish" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}

export default QuizView;
