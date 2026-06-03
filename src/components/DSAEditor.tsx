"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { DSAProblem } from "@/lib/dsa-problems";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

declare global {
  interface Window { loadPyodide?: (opts?: any) => Promise<any>; __pyodide?: any; }
}

const PYV = "0.26.4";

async function ensurePy(setStatus: (s: string) => void) {
  if (window.__pyodide) return window.__pyodide;
  setStatus("Loading Pyodide runtime (~10 MB, first time only)…");
  if (!window.loadPyodide) {
    await new Promise<void>((res, rej) => {
      const s = document.createElement("script");
      s.src = `https://cdn.jsdelivr.net/pyodide/v${PYV}/full/pyodide.js`;
      s.onload = () => res(); s.onerror = () => rej(new Error("pyodide load failed"));
      document.head.appendChild(s);
    });
  }
  setStatus("Initialising Python…");
  const py = await window.loadPyodide!({ indexURL: `https://cdn.jsdelivr.net/pyodide/v${PYV}/full/` });
  window.__pyodide = py;
  setStatus("");
  return py;
}

type Result = { input: string; expected: string; got: string; pass: boolean; error?: string };

export default function DSAEditor({ problem }: { problem: DSAProblem }) {
  const [code, setCode] = useState(problem.starter);
  const [results, setResults] = useState<Result[]>([]);
  const [status, setStatus] = useState("");
  const [running, setRunning] = useState(false);
  const [saved, setSaved] = useState<string>("");
  const printsRef = useRef<string[]>([]);

  useEffect(() => {
    // Restore last submission if any
    fetch(`/api/dsa/attempts?slug=${encodeURIComponent(problem.slug)}`)
      .then((r) => r.json())
      .then((d) => { if (d.attempt?.code) setCode(d.attempt.code); })
      .catch(() => {});
  }, [problem.slug]);

  async function runTests() {
    setRunning(true); setStatus(""); setResults([]); printsRef.current = [];
    const t0 = performance.now();
    try {
      const py = await ensurePy(setStatus);
      py.setStdout({ batched: (s: string) => printsRef.current.push(s) });
      py.setStderr({ batched: (s: string) => printsRef.current.push(s) });
      // Load packages if user imported them
      await py.loadPackagesFromImports(code);
      // Define user function
      await py.runPythonAsync(code);

      const out: Result[] = [];
      for (const t of problem.tests) {
        try {
          const got = await py.runPythonAsync(`repr(${t.input})`);
          const gotStr = String(got);
          const expStr = String(t.expected);
          out.push({ input: t.input, expected: expStr, got: gotStr, pass: gotStr === expStr });
        } catch (e: any) {
          out.push({ input: t.input, expected: t.expected, got: "", pass: false, error: String(e?.message || e) });
        }
      }
      setResults(out);
      const ms = Math.round(performance.now() - t0);
      const passed = out.filter((r) => r.pass).length;
      const allPass = passed === out.length;

      // Persist attempt
      await fetch("/api/dsa/attempts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: problem.slug, passed: allPass, passedTests: passed, totalTests: out.length, code, ms }),
      });
      setSaved(allPass ? "🎉 All tests passed!" : `${passed}/${out.length} tests passed`);
    } catch (e: any) {
      setStatus("[Exception] " + (e?.message || String(e)));
    } finally { setRunning(false); }
  }

  return (
    <div className="glass p-4 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="text-xs uppercase tracking-widest text-text-muted">Editor · Python (Pyodide)</div>
          <div className="text-sm text-text-secondary">Write your solution and hit Run.</div>
        </div>
        <button onClick={runTests} disabled={running} className="btn-primary disabled:opacity-40">
          {running ? "Running…" : "▶ Run Tests"}
        </button>
      </div>

      <div className="rounded-lg overflow-hidden border border-white/10">
        <MonacoEditor
          height="380px"
          language="python"
          theme="vs-dark"
          value={code}
          onChange={(v) => setCode(v || "")}
          options={{
            fontSize: 13,
            fontFamily: "JetBrains Mono, ui-monospace, monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            tabSize: 4,
            automaticLayout: true,
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>

      {status && <div className="text-xs text-amber-300">{status}</div>}
      {saved && <div className={`text-sm font-semibold ${results.every((r) => r.pass) && results.length ? "text-emerald-300" : "text-amber-300"}`}>{saved}</div>}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((r, i) => (
            <div key={i} className={`text-xs border rounded-lg p-3 ${r.pass ? "bg-emerald-500/10 border-emerald-500/30" : "bg-rose-500/10 border-rose-500/30"}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={r.pass ? "text-emerald-300" : "text-rose-300"}>{r.pass ? "✓ PASS" : "✗ FAIL"}</span>
                <span className="text-text-muted font-mono">{r.input}</span>
              </div>
              {!r.pass && (
                <div className="font-mono">
                  <div className="text-text-secondary">expected: <span className="text-emerald-300">{r.expected}</span></div>
                  <div className="text-text-secondary">     got: <span className="text-rose-300">{r.got || "—"}</span></div>
                  {r.error && <div className="text-rose-300 mt-1">{r.error}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
