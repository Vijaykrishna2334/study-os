"use client";
import { useEffect, useState } from "react";

type Header = { name: string; email: string; phone: string; location: string; linkedin: string; github: string };
type Experience = { title: string; company: string; location: string; period: string; bullets: string[] };
type Project = { name: string; tech: string; bullets: string[]; link: string };
type Education = { degree: string; school: string; period: string };

type Resume = {
  id: string;
  name: string;
  targetRole: string;
  summary: string;
  headerJSON: string;
  bulletsJSON: string;
  experienceJSON: string;
  skillsJSON: string;
  educationJSON: string;
  projectsJSON: string;
};

const DEFAULTS = {
  header: {
    name: "Pedhapati Vijay Krishna",
    email: "vijaykrishna2334@gmail.com",
    phone: "+91 9182583307",
    location: "East Godavari, AP",
    linkedin: "linkedin.com/in/vijaykrishna",
    github: "github.com/vijaykrishna",
  } as Header,
  experience: [
    { title: "Generative AI & Automation Intern", company: "NextMile", location: "Remote", period: "Jan 2026 – Present",
      bullets: [
        "Built and maintained NimbusPost API integration handling 200+ daily orders, automating end-to-end shipment tracking",
        "Engineered real-time webhook pipeline connecting NimbusPost with TownScript, eliminating 80% of manual data entry",
        "Developed automated NDR/RTO resolution system reducing product return rates by 30%",
      ],
    },
    { title: "AI/ML Engineer Intern", company: "WhatanAidea Solutions", location: "Bengaluru", period: "Sep 2025 – Dec 2025",
      bullets: [
        "Architected multi-style interior design generation system using Gemini 2.5 Pro/Flash — 500+ requests at 92% satisfaction",
        "Implemented LLM routing (Gemini Pro for quality, Flash for speed) reducing API costs by 40% with no quality drop",
        "Automated image generation workflows using n8n with 15+ reusable templates, cutting client delivery turnaround by 60%",
      ],
    },
  ] as Experience[],
  projects: [
    { name: "EliteBuilders", tech: "Next.js 16, React 19, GPT-4/Claude, Supabase", link: "github.com/vijaykrishna/elitebuilders",
      bullets: [
        "AI developer challenge platform where submissions are auto-scored by GPT-4/Claude",
        "Architected LLM evaluation pipeline fetching GitHub READMEs, scoring submissions, ranking builders",
      ],
    },
    { name: "Telecom AI Assistant", tech: "Python, FastAPI, Llama 3.2, RAG, Whisper, Docker", link: "github.com/vijaykrishna/telecom-ai",
      bullets: [
        "Voice-enabled RAG chatbot for telecom queries — sub-2s latency, 95%+ resolution rate",
        "Engineered LLM backend with ChromaDB retrieval, reducing human agent escalation by 35%",
      ],
    },
  ] as Project[],
  skills: [
    "Python, TypeScript, JavaScript, SQL",
    "PyTorch, TensorFlow, LangChain, LangGraph, FastAPI, Next.js",
    "Gemini API, OpenAI API, Vertex AI, Groq AI, Hugging Face",
    "Docker, Git, GCP, AWS, Supabase, PostgreSQL, ChromaDB, Pinecone",
    "RAG, Agents, Fine-tuning, LoRA/QLoRA, Prompt Engineering, MLOps",
  ],
  education: [
    { degree: "B.Tech, Mechanical Engineering", school: "Pragati Engineering College", period: "2019" },
  ] as Education[],
};

export default function ResumeBuilder() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [active, setActive] = useState<Resume | null>(null);
  const [busy, setBusy] = useState(false);

  // parsed state for editing
  const [header, setHeader]         = useState<Header>(DEFAULTS.header);
  const [summary, setSummary]       = useState("");
  const [experience, setExperience] = useState<Experience[]>(DEFAULTS.experience);
  const [projects, setProjects]     = useState<Project[]>(DEFAULTS.projects);
  const [skills, setSkills]         = useState<string[]>(DEFAULTS.skills);
  const [education, setEducation]   = useState<Education[]>(DEFAULTS.education);
  const [targetRole, setTargetRole] = useState("AI/ML Engineer");
  const [name, setName] = useState("Default");

  useEffect(() => { (async () => {
    const d = await (await fetch("/api/resumes")).json();
    setResumes(d.resumes);
    if (d.resumes[0]) load(d.resumes[0]);
  })(); }, []);

  function load(r: Resume) {
    setActive(r);
    setName(r.name); setTargetRole(r.targetRole);
    setHeader(safeJSON(r.headerJSON, DEFAULTS.header));
    setSummary(r.summary);
    setExperience(safeJSON(r.experienceJSON, DEFAULTS.experience));
    setProjects(safeJSON(r.projectsJSON, DEFAULTS.projects));
    setSkills(safeJSON(r.skillsJSON, DEFAULTS.skills));
    setEducation(safeJSON(r.educationJSON, DEFAULTS.education));
  }

  async function save() {
    if (!active) return;
    setBusy(true);
    await fetch("/api/resumes", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: active.id, name, targetRole, summary,
        headerJSON: JSON.stringify(header),
        experienceJSON: JSON.stringify(experience),
        projectsJSON: JSON.stringify(projects),
        skillsJSON: JSON.stringify(skills),
        educationJSON: JSON.stringify(education),
      }),
    });
    const d = await (await fetch("/api/resumes")).json();
    setResumes(d.resumes);
    setBusy(false);
  }

  async function dupe() {
    const r = await fetch("/api/resumes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${name} (copy)`, targetRole,
        headerJSON: JSON.stringify(header), summary,
        experienceJSON: JSON.stringify(experience),
        projectsJSON: JSON.stringify(projects),
        skillsJSON: JSON.stringify(skills),
        educationJSON: JSON.stringify(education),
      }),
    });
    const d = await r.json();
    if (d.resume) { setResumes((p) => [d.resume, ...p]); load(d.resume); }
  }

  function exportPDF() { window.print(); }

  return (
    <div className="space-y-4 print:p-0">
      <div className="glass p-4 flex flex-wrap gap-3 items-center print:hidden">
        <select value={active?.id || ""} onChange={(e) => { const r = resumes.find((x) => x.id === e.target.value); if (r) load(r); }}
                className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent/60">
          {resumes.map((r) => <option key={r.id} value={r.id}>{r.name} — {r.targetRole}</option>)}
        </select>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Resume name"
               className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent/60" />
        <input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="Target role"
               className="bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent/60" />
        <div className="ml-auto flex gap-2">
          <button onClick={save} disabled={busy} className="btn-primary text-sm disabled:opacity-40">{busy ? "Saving…" : "Save"}</button>
          <button onClick={dupe} className="btn-ghost text-xs">Duplicate</button>
          <button onClick={exportPDF} className="btn-primary text-xs">Save as PDF (Ctrl+P)</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* EDITOR */}
        <div className="space-y-4 print:hidden">
          <Block title="Header">
            <Two>
              <TextField label="Name" v={header.name} on={(v) => setHeader({ ...header, name: v })} />
              <TextField label="Email" v={header.email} on={(v) => setHeader({ ...header, email: v })} />
              <TextField label="Phone" v={header.phone} on={(v) => setHeader({ ...header, phone: v })} />
              <TextField label="Location" v={header.location} on={(v) => setHeader({ ...header, location: v })} />
              <TextField label="LinkedIn" v={header.linkedin} on={(v) => setHeader({ ...header, linkedin: v })} />
              <TextField label="GitHub" v={header.github} on={(v) => setHeader({ ...header, github: v })} />
            </Two>
          </Block>

          <Block title="Summary">
            <textarea value={summary} onChange={(e) => setSummary(e.target.value)}
                      className="w-full h-24 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-accent/60" />
          </Block>

          <Block title="Experience" onAdd={() => setExperience([{ title: "", company: "", location: "", period: "", bullets: [""] }, ...experience])}>
            {experience.map((e, i) => (
              <div key={i} className="border border-white/8 rounded-lg p-3 space-y-2 mb-2">
                <Two>
                  <TextField label="Title" v={e.title} on={(v) => setExperience(experience.map((x, j) => j === i ? { ...x, title: v } : x))} />
                  <TextField label="Company" v={e.company} on={(v) => setExperience(experience.map((x, j) => j === i ? { ...x, company: v } : x))} />
                  <TextField label="Period" v={e.period} on={(v) => setExperience(experience.map((x, j) => j === i ? { ...x, period: v } : x))} />
                  <TextField label="Location" v={e.location} on={(v) => setExperience(experience.map((x, j) => j === i ? { ...x, location: v } : x))} />
                </Two>
                <ArrayField items={e.bullets} on={(arr) => setExperience(experience.map((x, j) => j === i ? { ...x, bullets: arr } : x))} placeholder="Bullet (start with strong verb + metric)" />
                <button onClick={() => setExperience(experience.filter((_, j) => j !== i))} className="text-[10px] text-rose-400 hover:underline">Remove</button>
              </div>
            ))}
          </Block>

          <Block title="Projects" onAdd={() => setProjects([{ name: "", tech: "", link: "", bullets: [""] }, ...projects])}>
            {projects.map((p, i) => (
              <div key={i} className="border border-white/8 rounded-lg p-3 space-y-2 mb-2">
                <Two>
                  <TextField label="Name" v={p.name} on={(v) => setProjects(projects.map((x, j) => j === i ? { ...x, name: v } : x))} />
                  <TextField label="Tech" v={p.tech} on={(v) => setProjects(projects.map((x, j) => j === i ? { ...x, tech: v } : x))} />
                </Two>
                <TextField label="Link" v={p.link} on={(v) => setProjects(projects.map((x, j) => j === i ? { ...x, link: v } : x))} />
                <ArrayField items={p.bullets} on={(arr) => setProjects(projects.map((x, j) => j === i ? { ...x, bullets: arr } : x))} placeholder="Bullet" />
                <button onClick={() => setProjects(projects.filter((_, j) => j !== i))} className="text-[10px] text-rose-400 hover:underline">Remove</button>
              </div>
            ))}
          </Block>

          <Block title="Skills (one line per category)">
            <ArrayField items={skills} on={setSkills} placeholder="e.g. Python, TypeScript, SQL" />
          </Block>

          <Block title="Education" onAdd={() => setEducation([{ degree: "", school: "", period: "" }, ...education])}>
            {education.map((ed, i) => (
              <div key={i} className="border border-white/8 rounded-lg p-3 space-y-2 mb-2">
                <Two>
                  <TextField label="Degree" v={ed.degree} on={(v) => setEducation(education.map((x, j) => j === i ? { ...x, degree: v } : x))} />
                  <TextField label="School" v={ed.school} on={(v) => setEducation(education.map((x, j) => j === i ? { ...x, school: v } : x))} />
                </Two>
                <TextField label="Period" v={ed.period} on={(v) => setEducation(education.map((x, j) => j === i ? { ...x, period: v } : x))} />
                <button onClick={() => setEducation(education.filter((_, j) => j !== i))} className="text-[10px] text-rose-400 hover:underline">Remove</button>
              </div>
            ))}
          </Block>
        </div>

        {/* PREVIEW */}
        <div className="bg-white text-black rounded-lg shadow-2xl p-8 print:p-0 print:shadow-none print:rounded-none">
          <ResumePreview header={header} summary={summary} experience={experience} projects={projects} skills={skills} education={education} />
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body { background: white !important; }
          aside, header, .print\\:hidden { display: none !important; }
          main { padding: 0 !important; max-width: 100% !important; }
        }
      `}</style>
    </div>
  );
}

function ResumePreview({ header, summary, experience, projects, skills, education }: {
  header: Header; summary: string; experience: Experience[]; projects: Project[]; skills: string[]; education: Education[];
}) {
  return (
    <article className="font-sans text-[10pt] leading-snug">
      <header className="text-center pb-2 border-b border-black">
        <h1 className="text-[16pt] font-bold tracking-wide uppercase">{header.name}</h1>
        <div className="text-[8.5pt] mt-1">
          {header.location} · {header.phone} · {header.email}
          {header.linkedin && ` · ${header.linkedin}`}
          {header.github && ` · ${header.github}`}
        </div>
      </header>

      {summary && (
        <section className="mt-3">
          <h2 className="text-[10pt] font-bold uppercase tracking-wide border-b border-black pb-0.5">Summary</h2>
          <p className="mt-1">{summary}</p>
        </section>
      )}

      {experience.length > 0 && (
        <section className="mt-3">
          <h2 className="text-[10pt] font-bold uppercase tracking-wide border-b border-black pb-0.5">Experience</h2>
          {experience.map((e, i) => (
            <div key={i} className="mt-2">
              <div className="flex justify-between font-semibold">
                <span>{e.title}</span><span className="text-[9pt] font-normal">{e.period}</span>
              </div>
              <div className="italic text-[9.5pt]">{e.company}{e.location ? ` · ${e.location}` : ""}</div>
              <ul className="list-disc list-outside ml-4 mt-1">{e.bullets.filter((b) => b.trim()).map((b, j) => <li key={j}>{b}</li>)}</ul>
            </div>
          ))}
        </section>
      )}

      {projects.length > 0 && (
        <section className="mt-3">
          <h2 className="text-[10pt] font-bold uppercase tracking-wide border-b border-black pb-0.5">Projects</h2>
          {projects.map((p, i) => (
            <div key={i} className="mt-2">
              <div className="flex justify-between font-semibold">
                <span>{p.name} <span className="font-normal italic text-[9.5pt]">({p.tech})</span></span>
                {p.link && <span className="text-[9pt] font-normal">{p.link}</span>}
              </div>
              <ul className="list-disc list-outside ml-4 mt-1">{p.bullets.filter((b) => b.trim()).map((b, j) => <li key={j}>{b}</li>)}</ul>
            </div>
          ))}
        </section>
      )}

      {skills.length > 0 && (
        <section className="mt-3">
          <h2 className="text-[10pt] font-bold uppercase tracking-wide border-b border-black pb-0.5">Skills</h2>
          <ul className="mt-1">{skills.filter((s) => s.trim()).map((s, i) => <li key={i}>{s}</li>)}</ul>
        </section>
      )}

      {education.length > 0 && (
        <section className="mt-3">
          <h2 className="text-[10pt] font-bold uppercase tracking-wide border-b border-black pb-0.5">Education</h2>
          {education.map((e, i) => (
            <div key={i} className="mt-1 flex justify-between">
              <div><span className="font-semibold">{e.degree}</span> — {e.school}</div>
              <span className="text-[9pt]">{e.period}</span>
            </div>
          ))}
        </section>
      )}
    </article>
  );
}

function Block({ title, children, onAdd }: { title: string; children: React.ReactNode; onAdd?: () => void }) {
  return (
    <div className="glass p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs uppercase tracking-widest text-text-muted">{title}</div>
        {onAdd && <button onClick={onAdd} className="text-[10px] text-accent-light hover:underline">+ Add</button>}
      </div>
      {children}
    </div>
  );
}
function Two({ children }: { children: React.ReactNode }) { return <div className="grid sm:grid-cols-2 gap-2">{children}</div>; }
function TextField({ label, v, on }: { label: string; v: string; on: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-widest text-text-muted">{label}</span>
      <input value={v} onChange={(e) => on(e.target.value)} className="mt-0.5 w-full bg-white/[0.04] border border-white/10 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-accent/60" />
    </label>
  );
}
function ArrayField({ items, on, placeholder }: { items: string[]; on: (a: string[]) => void; placeholder: string }) {
  return (
    <div className="space-y-1">
      {items.map((it, i) => (
        <div key={i} className="flex gap-1">
          <input value={it} onChange={(e) => on(items.map((x, j) => j === i ? e.target.value : x))} placeholder={placeholder}
                 className="flex-1 bg-white/[0.04] border border-white/10 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-accent/60" />
          <button onClick={() => on(items.filter((_, j) => j !== i))} className="text-[10px] text-rose-400 px-2">×</button>
        </div>
      ))}
      <button onClick={() => on([...items, ""])} className="text-[10px] text-accent-light hover:underline">+ Add row</button>
    </div>
  );
}
function safeJSON<T>(s: string, fallback: T): T { try { return JSON.parse(s); } catch { return fallback; } }
