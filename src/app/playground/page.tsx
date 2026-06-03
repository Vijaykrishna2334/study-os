import CodePlayground from "@/components/CodePlayground";

export const dynamic = "force-dynamic";

export default function PlaygroundPage() {
  return (
    <div className="space-y-6 animate-[fadeInUp_0.5s_ease-out]">
      <header>
        <div className="text-xs uppercase tracking-[0.25em] text-text-muted mb-2">Free Playground</div>
        <h1 className="text-4xl font-extrabold gradient-text">Code anything, no install.</h1>
        <p className="text-text-secondary mt-2 max-w-2xl">
          Full Python (numpy / pandas / sklearn / matplotlib / scipy / sympy preloaded) and JavaScript, running entirely in your browser via Pyodide.
        </p>
      </header>
      <CodePlayground title="Scratch" initialLang="python" />
    </div>
  );
}
