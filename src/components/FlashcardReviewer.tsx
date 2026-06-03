"use client";
import { useState } from "react";
import Link from "next/link";

type Card = { id: string; q: string; a: string; topicCode: string; topicTitle: string; topicId: string };

export default function FlashcardReviewer({ cards }: { cards: Card[] }) {
  const [i, setI] = useState(0);
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);

  if (done || i >= cards.length) {
    return (
      <div className="glass p-10 text-center space-y-3">
        <div className="text-2xl font-bold gradient-text">Session complete</div>
        <div className="text-text-secondary text-sm">Reviewed {i} cards. They'll resurface per SM-2 schedule.</div>
      </div>
    );
  }

  const card = cards[i];

  async function rate(quality: number) {
    await fetch("/api/flashcards", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: card.id, quality }),
    });
    setShow(false);
    if (i + 1 >= cards.length) setDone(true);
    else setI(i + 1);
  }

  return (
    <div className="space-y-4">
      <div className="text-xs text-text-muted flex justify-between">
        <span>Card {i + 1} / {cards.length}</span>
        <Link href={`/topics/${card.topicId}`} className="hover:text-accent-light">{card.topicCode} · {card.topicTitle}</Link>
      </div>
      <div className="glass p-8 min-h-[260px] flex flex-col justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Question</div>
          <div className="text-lg font-semibold leading-relaxed">{card.q}</div>
        </div>
        {show && (
          <div className="mt-6 pt-6 border-t border-white/8 animate-[fadeInUp_0.3s]">
            <div className="text-[10px] uppercase tracking-widest text-accent-light mb-2">Answer</div>
            <div className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">{card.a}</div>
          </div>
        )}
      </div>

      {!show ? (
        <button onClick={() => setShow(true)} className="btn-primary w-full">Reveal answer</button>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {[
            { q: 0, l: "Forgot", color: "bg-rose-500/20 text-rose-200 border-rose-500/30" },
            { q: 2, l: "Hard",   color: "bg-amber-500/20 text-amber-200 border-amber-500/30" },
            { q: 4, l: "Good",   color: "bg-indigo-500/20 text-indigo-200 border-indigo-500/30" },
            { q: 5, l: "Easy",   color: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30" },
          ].map((b) => (
            <button key={b.q} onClick={() => rate(b.q)} className={`px-3 py-3 rounded-lg border text-sm font-medium hover:opacity-90 transition ${b.color}`}>
              {b.l}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
