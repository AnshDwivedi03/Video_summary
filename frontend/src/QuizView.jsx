import { useState } from "react";
import { ChevronLeft, CheckCircle2, Award, ArrowRight } from "lucide-react";

function QuizView({ summary, questions, onBack }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto my-5 p-5">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-emerald-500 font-bold mb-4 transition-colors"
        >
          <ChevronLeft size={20} /> Back
        </button>
        <p className="text-text-primary">No quiz questions available.</p>
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
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-text-secondary hover:text-emerald-600 font-bold mb-6 transition-colors"
      >
        <ChevronLeft size={20} /> Back to dashboard
      </button>

      <h2 className="text-2xl font-bold mt-3 text-text-primary">Quiz from Summary</h2>

      <div className="p-4 my-4 rounded-xl bg-bg-secondary border border-border-primary text-text-primary shadow-sm">
        <strong className="text-sm uppercase tracking-wider text-text-secondary font-bold">Summary used:</strong>
        <p className="whitespace-pre-wrap mt-2 text-sm leading-relaxed">{summary}</p>
      </div>

      {showResult ? (
        <div className="text-center py-10 space-y-6 bg-bg-secondary border border-border-primary rounded-3xl mt-6 shadow-sm">
          <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
            <Award size={40} />
          </div>
          <div>
            <h3 className="text-3xl font-black text-text-primary">Assessment Complete</h3>
            <p className="text-4xl font-black text-emerald-600 mt-2">
               {score} <span className="text-text-secondary text-2xl">/ {questions.length}</span>
            </p>
          </div>
          <button 
            onClick={handleRestart}
            className="px-8 py-3 bg-bg-primary border border-border-primary rounded-2xl font-bold hover:border-emerald-500/30 hover:text-emerald-500 shadow-sm transition-all text-text-primary"
          >
            Retry Assessment
          </button>
        </div>
      ) : (
        <div className="bg-bg-secondary border border-border-primary p-6 rounded-3xl shadow-sm mt-6">
          <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
            Question {currentIdx + 1} of {questions.length}
          </h3>
          <p className="my-4 text-lg font-medium text-text-primary">{currentQuestion.question}</p>

          <div className="flex flex-col gap-3">
            {currentQuestion.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`
                  text-left p-4 rounded-2xl border transition-all duration-200
                  ${selectedIndex === idx 
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)] text-emerald-700 dark:text-emerald-400 font-bold' 
                    : 'border-border-primary bg-bg-primary text-text-primary hover:border-text-secondary'
                  }
                `}
              >
                {opt}
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={selectedIndex === null}
            className={`
              mt-6 w-full py-4 rounded-full font-black uppercase tracking-widest transition-all duration-300
              ${selectedIndex === null 
                ? 'bg-border-primary text-text-secondary cursor-not-allowed hidden'
                : 'bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:scale-[1.02]'
              }
            `}
          >
            {currentIdx + 1 === questions.length ? "Finish" : "Next"}
          </button>
        </div>
      )}
    </div>
  );
}

export default QuizView;
