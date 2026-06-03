"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

declare global {
  interface Window {
    loadPyodide?: (opts?: any) => Promise<any>;
    __pyodide?: any;
  }
}

type Lang = "python" | "javascript";

const TEMPLATES: Record<Lang, (title: string) => string> = {
  python: (title) => `# ${title}\n# Tip: numpy, pandas, scikit-learn, matplotlib are available.\nimport numpy as np\n\nx = np.array([1, 2, 3, 4, 5])\nprint("mean:", x.mean())\nprint("std :", x.std())\n`,
  javascript: (title) => `// ${title}\nconst arr = [1, 2, 3, 4, 5];\nconst mean = arr.reduce((a,b)=>a+b,0) / arr.length;\nconsole.log("mean:", mean);\n`,
};

const PYODIDE_VERSION = "0.26.4";
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/pyodide.js`;
const PYODIDE_INDEX = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

async function ensurePyodide(setStatus: (s: string) => void) {
  if (window.__pyodide) return window.__pyodide;
  if (!window.loadPyodide) {
    setStatus("Loading Pyodide runtime (~10 MB, first time only)…");
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = PYODIDE_URL;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("Failed to load Pyodide script"));
      document.head.appendChild(s);
    });
  }
  setStatus("Initialising Python…");
  const py = await window.loadPyodide!({ indexURL: PYODIDE_INDEX });
  window.__pyodide = py;
  return py;
}

export default function CodePlayground({ title, initialLang = "python" }: { title: string; initialLang?: Lang }) {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [code, setCode] = useState<string>(TEMPLATES[initialLang](title));
  const [output, setOutput] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [pkgInput, setPkgInput] = useState("");
  const printsRef = useRef<string[]>([]);

  useEffect(() => { setCode(TEMPLATES[lang](title)); /* eslint-disable-next-line */ }, [lang]);

  async function run() {
    setRunning(true);
    setOutput("");
    setStatus("");
    printsRef.current = [];
    try {
      if (lang === "javascript") {
        const log = (...args: any[]) => printsRef.current.push(args.map(formatVal).join(" "));
        const err = (...args: any[]) => printsRef.current.push("[error] " + args.map(formatVal).join(" "));
        const fn = new Function("console", `"use strict";\n${code}`);
        await fn({ log, error: err, warn: log, info: log });
        setOutput(printsRef.current.join("\n") || "(no output)");
      } else {
        const py = await ensurePyodide(setStatus);
        setStatus("Running…");
        py.setStdout({ batched: (s: string) => printsRef.current.push(s) });
        py.setStderr({ batched: (s: string) => printsRef.current.push(s) });
        // Auto-load common packages on first use of common imports
        await py.loadPackagesFromImports(code);
        await py.runPythonAsync(code);
        setStatus("");
        setOutput(printsRef.current.join("\n") || "(no output)");
      }
    } catch (e: any) {
      setOutput(printsRef.current.join("\n") + "\n\n[Exception] " + (e?.message || String(e)));
      setStatus("");
    } finally {
      setRunning(false);
    }
  }

  async function installPkg() {
    if (!pkgInput.trim() || lang !== "python") return;
    setRunning(true); setStatus(`Installing ${pkgInput}…`);
    try {
      const py = await ensurePyodide(setStatus);
      await py.loadPackage("micropip");
      const micropip = py.pyimport("micropip");
      await micropip.install(pkgInput.trim());
      setStatus(`Installed ${pkgInput}`);
      setPkgInput("");
    } catch (e: any) {
      setStatus(`Install failed: ${e.message}`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="glass p-5 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <div className="text-xs uppercase tracking-widest text-text-muted">Code Playground</div>
          <div className="text-sm text-text-secondary">Runs in your browser — Python via Pyodide · zero install</div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-white/[0.04] border border-white/10 rounded-lg p-0.5">
            {(["python", "javascript"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`text-xs px-3 py-1 rounded-md transition ${
                  lang === l ? "bg-accent/30 text-accent-light" : "text-text-secondary hover:text-text-primary"
                }`}
              >{l === "python" ? "Python" : "JavaScript"}</button>
            ))}
          </div>
          <button onClick={run} disabled={running} className="btn-primary text-xs disabled:opacity-40">
            {running ? "Running…" : "▶ Run"}
          </button>
        </div>
      </div>

      <div className="rounded-lg overflow-hidden border border-white/10">
        <MonacoEditor
          height="320px"
          language={lang}
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

      {lang === "python" && (
        <div className="flex items-center gap-2">
          <input
            value={pkgInput}
            onChange={(e) => setPkgInput(e.target.value)}
            placeholder="pip install (e.g. requests, sympy)"
            className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-accent/60"
          />
          <button onClick={installPkg} disabled={running || !pkgInput.trim()} className="btn-ghost text-xs disabled:opacity-40">
            micropip install
          </button>
        </div>
      )}

      {(status || output) && (
        <div className="bg-black/40 border border-white/10 rounded-lg p-3 font-mono text-xs whitespace-pre-wrap min-h-[80px] max-h-[280px] overflow-y-auto">
          {status && <div className="text-accent-light mb-1">{status}</div>}
          <div className="text-emerald-200">{output || (status ? "" : "(no output yet)")}</div>
        </div>
      )}

      <div className="text-[10px] text-text-muted">
        Python packages preloaded: numpy, pandas, scikit-learn, matplotlib, scipy, sympy. Use the pip box for others.
      </div>
    </div>
  );
}

function formatVal(v: any): string {
  if (typeof v === "string") return v;
  try { return JSON.stringify(v, null, 2); } catch { return String(v); }
}
