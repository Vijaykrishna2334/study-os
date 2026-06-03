"use client";
import { useEffect, useState } from "react";
import { useTTS, useSTT, VoiceSettings } from "./VoiceControls";

type T = { id: string; code: string; title: string; phase: number; tier: string };
type Turn = { role: "interviewer" | "you"; text: string };

function wpm(text: string, durationMs: number): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return durationMs > 0 ? Math.round((words / (durationMs / 60000))) : 0;
}
const FILLERS = ["um","uh","like","you know","basically","actually","kind of","sort of","i mean","right"];
function fillerCount(text: string): number {
  const t = text.toLowerCase();
  return FILLERS.reduce((n, f) => n + (t.match(new RegExp(`\\b${f}\\b`, "g")) || []).length, 0);
}

export default function MockInterviewer({ topics }: { topics: T[] }) {
  const [topicId, setTopicId] = useState<string>(topics[0]?.id || "");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [recordStart, setRecordStart] = useState<number | null>(null);

  const tts = useTTS();
  const stt = useSTT({ continuous: true });

  // Auto-speak interviewer turns when voice mode on
  useEffect(() => {
    if (!voiceMode || !autoSpeak || !tts.supported) return;
    const last = turns[turns.length - 1];
    if (last?.role === "interviewer") tts.speak(last.text);
    // eslint-disable-next-line
  }, [turns, voiceMode, autoSpeak]);

  useEffect(() => {
    if (stt.transcript) setAnswer(stt.transcript);
  }, [stt.transcript]);

  async function start() {
    if (!topicId) return;
    setLoading(true); setTurns([]); tts.stop();
    try {
      const r = await fetch("/api/mock", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, history: [] }),
      });
      const d = await r.json();
      setTurns([{ role: "interviewer", text: d.text }]);
    } finally { setLoading(false); }
  }

  async function submit() {
    if (!answer.trim()) return;
    const myTurn: Turn = { role: "you", text: answer.trim() };
    const next = [...turns, myTurn];
    setTurns(next); setAnswer(""); stt.reset(); setLoading(true);
    try {
      const r = await fetch("/api/mock", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, history: next }),
      });
      const d = await r.json();
      setTurns([...next, { role: "interviewer", text: d.text }]);
    } finally { setLoading(false); }
  }

  function startRecording() {
    setAnswer(""); stt.reset(); setRecordStart(Date.now()); stt.start();
  }
  function stopRecording() {
    stt.stop();
  }

  const t = topics.find((x) => x.id === topicId);
  const lastUserTurn = [...turns].reverse().find((x) => x.role === "you");
  const recordDurMs = recordStart && stt.transcript ? Date.now() - recordStart : 0;

  return (
    <div className="grid lg:grid-cols-[320px_1fr] gap-6">
      <aside className="glass p-4 h-fit sticky top-6 space-y-3">
        <div>
          <div className="text-xs uppercase tracking-widest text-text-muted mb-2">Pick a topic</div>
          <select value={topicId} onChange={(e) => setTopicId(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent/60">
            {topics.map((x) => (
              <option key={x.id} value={x.id} className="bg-bg-secondary">[{x.tier}] {x.code} · {x.title}</option>
            ))}
          </select>
        </div>

        <button onClick={start} disabled={loading || !topicId} className="btn-primary w-full disabled:opacity-40">
          {turns.length ? "Restart" : "Begin interview"}
        </button>

        <div className="pt-2 border-t border-white/8 space-y-2">
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={voiceMode} onChange={(e) => setVoiceMode(e.target.checked)} className="accent-indigo-500" />
            <span>🎤 Voice mode</span>
            {voiceMode && (!tts.supported || !stt.supported) && (
              <span className="text-rose-300 text-[10px]">(unsupported browser)</span>
            )}
          </label>
          {voiceMode && (
            <>
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={autoSpeak} onChange={(e) => setAutoSpeak(e.target.checked)} className="accent-indigo-500" />
                <span>Auto-speak interviewer</span>
              </label>
              {tts.supported && <VoiceSettings ttsRate={tts.rate} setTtsRate={tts.setRate} voices={tts.voices} voice={tts.voice} setVoice={tts.setVoice} />}
            </>
          )}
        </div>

        {t && (
          <div className="pt-2 border-t border-white/8 text-xs text-text-secondary">
            <div><span className="text-text-muted">Phase:</span> {t.phase}</div>
            <div><span className="text-text-muted">Tier:</span> {t.tier}</div>
          </div>
        )}

        {/* Speaking-pace stats for last user answer */}
        {voiceMode && lastUserTurn && (
          <div className="pt-2 border-t border-white/8">
            <div className="text-[10px] uppercase tracking-widest text-text-muted mb-1">Last answer stats</div>
            <div className="text-xs grid grid-cols-2 gap-1">
              <span className="text-text-muted">Words:</span><span className="tabular-nums">{lastUserTurn.text.trim().split(/\s+/).filter(Boolean).length}</span>
              <span className="text-text-muted">Fillers:</span><span className={`tabular-nums ${fillerCount(lastUserTurn.text) > 3 ? "text-rose-300" : "text-emerald-300"}`}>{fillerCount(lastUserTurn.text)}</span>
            </div>
          </div>
        )}
      </aside>

      <div className="space-y-4 min-w-0">
        <div className="glass p-5 space-y-4 min-h-[300px] max-h-[60vh] overflow-y-auto">
          {turns.length === 0 && <div className="text-text-muted text-sm italic">Begin interview to receive the first question.</div>}
          {turns.map((tt, i) => (
            <div key={i} className={`flex ${tt.role === "you" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                tt.role === "interviewer"
                  ? "bg-accent/10 border border-accent/20 text-text-primary"
                  : "bg-white/[0.06] border border-white/10 text-text-secondary"
              }`}>
                <div className="text-[10px] uppercase tracking-widest mb-1 opacity-60 flex items-center justify-between gap-2">
                  <span>{tt.role === "interviewer" ? "Gemini" : "You"}</span>
                  {tt.role === "interviewer" && voiceMode && tts.supported && (
                    <button onClick={() => tts.speaking ? tts.stop() : tts.speak(tt.text)} className="text-accent-light hover:underline">
                      {tts.speaking ? "■ stop" : "🔊 replay"}
                    </button>
                  )}
                </div>
                {tt.text}
              </div>
            </div>
          ))}
          {loading && <div className="text-xs text-text-muted italic">Gemini thinking…</div>}
        </div>

        {turns.length > 0 && (
          <div className="glass p-4 space-y-2">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={voiceMode ? "Hit 🎤 Record and speak. Live transcript appears here." : "Type your answer like you would speak it…"}
              className="w-full h-28 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm resize-y focus:outline-none focus:border-accent/60"
            />
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex gap-2">
                {voiceMode && stt.supported && (
                  stt.listening ? (
                    <button onClick={stopRecording} className="btn-primary text-xs bg-rose-500 animate-[pulseGlow_1.5s_ease-in-out_infinite]">■ Stop recording</button>
                  ) : (
                    <button onClick={startRecording} className="btn-primary text-xs">🎤 Record answer</button>
                  )
                )}
                {voiceMode && stt.listening && (
                  <span className="text-xs text-text-muted self-center">Listening… {answer.trim().split(/\s+/).filter(Boolean).length} words</span>
                )}
                {voiceMode && !stt.listening && recordDurMs > 0 && (
                  <span className="text-xs text-text-muted self-center">
                    Pace: <b className={`${wpm(answer, recordDurMs) > 180 ? "text-rose-300" : wpm(answer, recordDurMs) < 120 ? "text-amber-300" : "text-emerald-300"}`}>{wpm(answer, recordDurMs)} wpm</b>
                  </span>
                )}
              </div>
              <button onClick={submit} disabled={loading || !answer.trim() || stt.listening} className="btn-primary disabled:opacity-40">
                Submit answer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
