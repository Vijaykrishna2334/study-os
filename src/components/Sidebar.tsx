"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { GcpCreditsSidebar } from "./GcpCreditsWidget";

const STUDY_NAV = [
  { href: "/",            label: "Dashboard",     icon: "▦" },
  { href: "/topics",      label: "Topics",        icon: "≡" },
  { href: "/today",       label: "Today",         icon: "◐" },
  { href: "/search",      label: "Search Notes",  icon: "⌕" },
  { href: "/notes-chat",  label: "Ask Notes",     icon: "✱" },
  { href: "/videos",      label: "Videos",        icon: "▶" },
  { href: "/dsa",         label: "DSA Grinder",   icon: "⚡" },
  { href: "/glossary",    label: "Glossary",      icon: "ⓘ" },
  { href: "/papers",      label: "Papers",        icon: "📜" },
  { href: "/flashcards",  label: "Flashcards",    icon: "◇" },
  { href: "/mock",        label: "Mock Interview", icon: "✦" },
  { href: "/weekly",      label: "Weekly Review", icon: "❖" },
  { href: "/playground",  label: "Playground",    icon: "⌨" },
  { href: "/settings",    label: "Settings",      icon: "⚙" },
];

const CAREER_NAV = [
  { href: "/resume",            label: "Resume Builder",    icon: "📄" },
  { href: "/cover-letter",      label: "Cover Letter",      icon: "✉" },
  { href: "/interview-prep",    label: "Interview Prep",    icon: "🧠" },
  { href: "/interview-planner", label: "Interview Planner", icon: "📅" },
  { href: "/company",           label: "Company Research",  icon: "🏢" },
];

const APPLY_NAV = [
  { href: "/discover",  label: "Company Discover",  icon: "🔍" },
  { href: "/scoring",   label: "Tailored Scoring",  icon: "🎯" },
  { href: "/pipeline",  label: "Job Pipeline",      icon: "📋" },
  { href: "/analytics", label: "Analytics",         icon: "📊" },
];

const FREELANCE_NAV = [
  { href: "/freelance", label: "Freelance Tracker", icon: "💼" },
];

type NavItem = { href: string; label: string; icon: string };

function NavSection({
  items,
  label,
  accentClass,
  activeClass,
  hoverClass,
  borderClass,
}: {
  items: NavItem[];
  label: string;
  accentClass: string;
  activeClass: string;
  hoverClass: string;
  borderClass: string;
}) {
  const path = usePathname();
  return (
    <>
      <div className="mt-4 mb-1 px-3">
        <div className={`text-[9px] uppercase tracking-[0.2em] font-semibold flex items-center gap-2 ${accentClass}`}>
          <span className="flex-1 border-t opacity-30 border-current" />
          {label}
          <span className="flex-1 border-t opacity-30 border-current" />
        </div>
      </div>
      {items.map((n) => {
        const active = n.href === "/" ? path === "/" : path?.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            className={clsx(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all flex-shrink-0",
              active ? activeClass : `text-text-secondary ${hoverClass} border ${borderClass}`
            )}
          >
            <span className="text-base opacity-80">{n.icon}</span>
            {n.label}
          </Link>
        );
      })}
    </>
  );
}

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="hidden md:flex w-60 flex-col px-4 py-6 border-r border-white/5 bg-black/20 backdrop-blur-xl sticky top-0 h-screen">
      <Link href="/" className="px-2 mb-8">
        <div className="text-xl font-extrabold gradient-text tracking-tight">Study OS</div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-text-muted mt-1">AI/ML Mastery</div>
      </Link>

      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

        {/* ── Study ─────────────────────────────────────────── */}
        {STUDY_NAV.map((n) => {
          const active = n.href === "/" ? path === "/" : path?.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all flex-shrink-0",
                active
                  ? "bg-accent/15 text-accent-light border border-accent/30 shadow-[0_0_20px_-8px_rgba(79,70,229,0.6)]"
                  : "text-text-secondary hover:bg-white/5 hover:text-text-primary border border-transparent"
              )}
            >
              <span className="text-base opacity-80">{n.icon}</span>
              {n.label}
            </Link>
          );
        })}

        {/* ── Career Toolkit ────────────────────────────────── */}
        <NavSection
          items={CAREER_NAV}
          label="Career Toolkit"
          accentClass="text-emerald-400/80"
          activeClass="bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_20px_-8px_rgba(16,185,129,0.5)]"
          hoverClass="hover:bg-emerald-500/5 hover:text-emerald-300"
          borderClass="border-transparent"
        />

        {/* ── ApplyPilot ────────────────────────────────────── */}
        <NavSection
          items={APPLY_NAV}
          label="ApplyPilot"
          accentClass="text-indigo-400/80"
          activeClass="bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-[0_0_20px_-8px_rgba(99,102,241,0.6)]"
          hoverClass="hover:bg-indigo-500/5 hover:text-indigo-300"
          borderClass="border-transparent"
        />

        {/* ── Freelance ─────────────────────────────────────── */}
        <NavSection
          items={FREELANCE_NAV}
          label="Freelance"
          accentClass="text-yellow-400/80"
          activeClass="bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 shadow-[0_0_20px_-8px_rgba(234,179,8,0.5)]"
          hoverClass="hover:bg-yellow-500/5 hover:text-yellow-300"
          borderClass="border-transparent"
        />

      </nav>

      <div className="mt-auto pt-4">
        <GcpCreditsSidebar />
        <div className="pt-4 border-t border-white/5 mt-4">
          <div className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Vijay Krishna</div>
          <div className="text-xs text-text-secondary leading-relaxed">
            12 phases · 340+ topics<br />
            Gemini-powered brain
          </div>
        </div>
      </div>
    </aside>
  );
}
