"use client";
import { useState } from "react";

type Q = { q: string; options: string[]; correctIndex: number; explain: string };
type ReviewItem = { q: string; picked: number; correctIndex: number; correct: boolean; explain: string };

export default function QuizPlayer({ topicId, quiz, bestScore }: { topicId: string; quiz: Q[]; bestScore: number }) {
  const [answers, setAnswers] = useState<number[]>(Array(quiz.length).fill(-1));
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [passed, setPassed] = useState(false);
  const [review, setReview] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(false);

  function pick(i: number, opt: number) {
    if (submitted) return;
    const a = [...answers]; a[i] = opt; setAnswers(a);
  }

  async function submit() {
    if (answers.some((a) => a < 0)) return;
    setLoading(true);
    const r = await fetch("/api/quiz/grade", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId, answers }),
    });
    const d = await r.json();
    setLoading(false);
    if (!r.ok) return;
    setScore(d.score); setPassed(d.passed); setReview(d.review); setSubmitted(true);
  }

  function reset() {
    setAnswers(Array(quiz.length).fill(-1));
    setSubmitted(false); setScore(null); setReview([]); setPassed(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-xs text-text-muted">Pass mark 80%. Best score so far: <b className="text-accent-light">{bestScore}%</b></div>
        {submitted && (
          <button onClick={reset} className="btn-ghost text-xs">Try again</button>
        )}
      </div>

      <div className="space-y-4">
        {quiz.map((q, i) => {
          const r = submitted ? review[i] : null;
          return (
            <div key={i} className="bg-white/[0.03] border border-white/8 rounded-lg p-4 space-y-3">
              <div className="text-sm font-medium leading-relaxed">
                <span className="text-text-muted mr-2">Q{i + 1}.</span>{q.q}
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {q.options.map((opt, oi) => {
                  const selected = answers[i] === oi;
                  let cls = "border-white/10 hover:bg-white/5";
                  if (submitted && r) {
                    if (oi === r.correctIndex) cls = "bg-emerald-500/15 border-emerald-500/40 text-emerald-200";
                    else if (selected && !r.correct) cls = "bg-rose-500/15 border-rose-500/40 text-rose-200";
                    else cls = "border-white/8 opacity-60";
                  } else if (selected) {
                    cls = "bg-accent/15 border-accent/40 text-accent-light";
                  }
                  return (
                    <button
                      key={oi}
                      onClick={() => pick(i, oi)}
                      disabled={submitted}
                      className={`text-left text-xs px-3 py-2 rounded-lg border transition ${cls}`}
                    >
                      <span className="font-mono text-text-muted mr-2">{String.fromCharCode(65 + oi)}.</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {submitted && r && (
                <div className="text-xs text-text-secondary border-t border-white/8 pt-2 mt-2">
                  <span className={r.correct ? "text-emerald-300" : "text-rose-300"}>
                    {r.correct ? "✓ Correct." : "✗ Incorrect."}
                  </span>{" "}
                  {q.explain}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!submitted && (
        <button onClick={submit} disabled={loading || answers.some((a) => a < 0)} className="btn-primary disabled:opacity-40">
          {loading ? "Grading…" : "Submit answers"}
        </button>
      )}
      {submitted && score !== null && (
        <div className={`p-4 rounded-lg border ${passed ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200" : "bg-amber-500/10 border-amber-500/30 text-amber-200"}`}>
          <div className="text-2xl font-extrabold">{score}%</div>
          <div className="text-sm">{passed ? "Passed. Topic quiz cleared." : "Below 80%. Review and try again."}</div>
        </div>
      )}
    </div>
  );
}
