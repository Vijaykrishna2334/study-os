"use client";
import { useEffect, useRef, useState } from "react";

// Browser-native Web Speech API wrapper. Falls back gracefully if unsupported.
// STT (recognition) — Chrome/Edge/Safari. Firefox requires flag.
// TTS (synthesis) — all modern browsers.

declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

export function useTTS() {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [rate, setRate] = useState(1.0);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setSupported(true);
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices().filter((x) => x.lang.startsWith("en"));
      setVoices(v);
      if (!voice && v.length) setVoice(v.find((x) => x.name.includes("Google") || x.name.includes("Microsoft")) || v[0]);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => { window.speechSynthesis.onvoiceschanged = null as any; };
  }, []);

  function speak(text: string, onEnd?: () => void) {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.rate = rate;
    u.pitch = 1;
    u.onstart = () => setSpeaking(true);
    u.onend = () => { setSpeaking(false); onEnd?.(); };
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }

  function stop() {
    if (!supported) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }

  return { supported, speaking, speak, stop, rate, setRate, voice, setVoice, voices };
}

export function useSTT(opts?: { lang?: string; continuous?: boolean }) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recogRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const Recog = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recog) return;
    setSupported(true);
    const r = new Recog();
    r.continuous = opts?.continuous ?? true;
    r.interimResults = true;
    r.lang = opts?.lang || "en-US";
    r.onresult = (e: any) => {
      let final = "";
      for (let i = 0; i < e.results.length; i++) {
        final += e.results[i][0].transcript;
      }
      setTranscript(final);
    };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    recogRef.current = r;
    // eslint-disable-next-line
  }, []);

  function start() {
    if (!supported || !recogRef.current) return;
    setTranscript("");
    setListening(true);
    try { recogRef.current.start(); } catch { }
  }
  function stop() {
    if (!supported || !recogRef.current) return;
    try { recogRef.current.stop(); } catch { }
    setListening(false);
  }
  function reset() { setTranscript(""); }

  return { supported, listening, transcript, start, stop, reset };
}

export function VoiceSettings({ ttsRate, setTtsRate, voices, voice, setVoice }: {
  ttsRate: number; setTtsRate: (n: number) => void;
  voices: SpeechSynthesisVoice[]; voice: SpeechSynthesisVoice | null; setVoice: (v: SpeechSynthesisVoice) => void;
}) {
  return (
    <div className="flex items-center gap-3 flex-wrap text-xs">
      <label className="flex items-center gap-2">
        <span className="text-text-muted">Speed</span>
        <input type="range" min="0.7" max="1.5" step="0.1" value={ttsRate}
          onChange={(e) => setTtsRate(parseFloat(e.target.value))}
          className="accent-indigo-500 w-24" />
        <span className="tabular-nums w-8">{ttsRate.toFixed(1)}x</span>
      </label>
      {voices.length > 1 && (
        <select value={voice?.name || ""} onChange={(e) => { const v = voices.find((x) => x.name === e.target.value); if (v) setVoice(v); }}
          className="bg-white/[0.04] border border-white/10 rounded px-2 py-1 text-xs">
          {voices.map((v) => <option key={v.name} value={v.name} className="bg-bg-secondary">{v.name}</option>)}
        </select>
      )}
    </div>
  );
}
