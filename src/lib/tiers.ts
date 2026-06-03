// Tier assignments derived from the strategy document.
// Tier A = Must-Master / front-load, B = Working-Knowledge, C = Aware-Of / differentiation, D = Optional.

type TierMap = Record<string, "A" | "B" | "C" | "D">;

// Match by code prefix; longest prefix wins.
const TIER_RULES: Array<{ prefix: string; tier: "A" | "B" | "C" | "D" }> = [
  // Phase 1 — math A; data A; tooling C
  { prefix: "P1_1_1", tier: "A" },
  { prefix: "P1_1_2", tier: "A" },
  { prefix: "P1_1_3", tier: "A" },
  { prefix: "P1_1_4", tier: "B" },
  { prefix: "P1_1_5", tier: "A" },
  { prefix: "P1_2_1", tier: "A" },
  { prefix: "P1_2_2", tier: "A" },
  { prefix: "P1_2_3", tier: "B" },
  { prefix: "P1_2_4", tier: "B" },
  { prefix: "P1_3_1_", tier: "C" }, // tooling
  { prefix: "P1_3_2_C", tier: "C" },
  { prefix: "P1_3_3_D", tier: "C" },
  { prefix: "P1_3_4_C", tier: "C" },
  { prefix: "P1_3_5_A", tier: "C" },
  { prefix: "P1_3_3_4", tier: "A" },
  { prefix: "P1_3_5_6_7", tier: "A" },
  { prefix: "P1_3", tier: "A" },

  // Phase 2 — Tier A core, ensembles A, others B
  { prefix: "P2_1", tier: "A" },
  { prefix: "P2_2", tier: "A" },
  { prefix: "P2_3", tier: "A" },
  { prefix: "P2_4", tier: "A" },
  { prefix: "P2_5_1", tier: "A" },
  { prefix: "P2_5_4", tier: "A" },
  { prefix: "P2_5", tier: "B" },
  { prefix: "P2_6", tier: "B" },
  { prefix: "P2_7", tier: "B" },

  // Phase 3 — DL Tier A almost all
  { prefix: "P3_1", tier: "A" },
  { prefix: "P3_2", tier: "A" },
  { prefix: "P3_3_1", tier: "B" },
  { prefix: "P3_3_2", tier: "A" },
  { prefix: "P3_3_3", tier: "C" },
  { prefix: "P3_3_4", tier: "A" },
  { prefix: "P3_4", tier: "B" },
  { prefix: "P3_5", tier: "C" },
  { prefix: "P3_6", tier: "C" },

  // Phase 4 — CV Tier B/C unless CV-specific
  { prefix: "P4_1", tier: "B" },
  { prefix: "P4_2", tier: "B" },
  { prefix: "P4_3_1", tier: "B" },
  { prefix: "P4_3", tier: "C" },
  { prefix: "P4_4_4", tier: "B" },
  { prefix: "P4_4", tier: "C" },
  { prefix: "P4_5_1", tier: "B" },
  { prefix: "P4_5_4", tier: "B" },
  { prefix: "P4_5", tier: "C" },
  { prefix: "P4_6_1", tier: "B" },
  { prefix: "P4_6_4", tier: "B" },
  { prefix: "P4_6", tier: "C" },
  { prefix: "P4_7", tier: "D" },

  // Phase 5 — NLP→Transformers Tier A
  { prefix: "P5_1_1", tier: "A" },
  { prefix: "P5_1_5", tier: "A" },
  { prefix: "P5_1", tier: "B" },
  { prefix: "P5_2", tier: "B" },
  { prefix: "P5_3_4", tier: "A" },
  { prefix: "P5_3_5", tier: "A" },
  { prefix: "P5_3", tier: "B" },
  { prefix: "P5_4", tier: "A" },
  { prefix: "P5_5", tier: "B" },

  // Phase 6 — LLMs Tier A (your wheelhouse)
  { prefix: "P6_1", tier: "A" },
  { prefix: "P6_2", tier: "A" },
  { prefix: "P6_3", tier: "A" },
  { prefix: "P6_4", tier: "A" },
  { prefix: "P6_5", tier: "A" },
  { prefix: "P6_6", tier: "A" },
  { prefix: "P6_7", tier: "B" },

  // Phase 7 — RAG Tier A
  { prefix: "P7_1", tier: "A" },
  { prefix: "P7_2", tier: "A" },
  { prefix: "P7_3", tier: "A" },
  { prefix: "P7_4_3", tier: "A" },
  { prefix: "P7_4_4", tier: "A" },
  { prefix: "P7_4", tier: "B" },

  // Phase 8 — Agents Tier A
  { prefix: "P8_1", tier: "A" },
  { prefix: "P8_2", tier: "A" },
  { prefix: "P8_3", tier: "A" },
  { prefix: "P8_4", tier: "B" },
  { prefix: "P8_5_2", tier: "A" },
  { prefix: "P8_5", tier: "B" },
  { prefix: "P8_6", tier: "A" },

  // Phase 9 — Multimodal B/C
  { prefix: "P9_4", tier: "B" },
  { prefix: "P9_5_1", tier: "B" },
  { prefix: "P9_3_1", tier: "B" },
  { prefix: "P9", tier: "C" },

  // Phase 10 — MLOps Tier A (gap closer)
  { prefix: "P10_1", tier: "A" },
  { prefix: "P10_2", tier: "A" },
  { prefix: "P10_3", tier: "A" },
  { prefix: "P10_4_1", tier: "A" },
  { prefix: "P10_4", tier: "B" },
  { prefix: "P10_5", tier: "A" },
  { prefix: "P10_6", tier: "A" },

  // Phase 11 — Frontier C signal
  { prefix: "P11_1", tier: "B" },
  { prefix: "P11_2", tier: "B" },
  { prefix: "P11_3", tier: "C" },
  { prefix: "P11_4", tier: "C" },
  { prefix: "P11_5", tier: "B" },
  { prefix: "P11_6_1", tier: "B" },
  { prefix: "P11_6", tier: "C" },
  { prefix: "P11_7", tier: "B" },
  { prefix: "P11_8", tier: "D" },

  // Phase 12 — Specialized D
  { prefix: "P12", tier: "D" },
];

export function tierFor(code: string): "A" | "B" | "C" | "D" {
  let best: { tier: "A" | "B" | "C" | "D"; len: number } = { tier: "B", len: 0 };
  for (const r of TIER_RULES) {
    if (code.startsWith(r.prefix) && r.prefix.length > best.len) {
      best = { tier: r.tier, len: r.prefix.length };
    }
  }
  return best.tier;
}

export const TIER_META: Record<"A" | "B" | "C" | "D", { label: string; color: string; ring: string }> = {
  A: { label: "Must-Master", color: "text-rose-300",   ring: "ring-rose-500/40 bg-rose-500/10" },
  B: { label: "Working",     color: "text-amber-300",  ring: "ring-amber-500/40 bg-amber-500/10" },
  C: { label: "Aware",       color: "text-cyan-300",   ring: "ring-cyan-500/40 bg-cyan-500/10" },
  D: { label: "Optional",    color: "text-slate-400",  ring: "ring-slate-500/30 bg-slate-500/10" },
};

export const PHASE_TITLES: Record<number, string> = {
  1: "Foundations — Math + Python + Data",
  2: "Classical Machine Learning",
  3: "Deep Learning",
  4: "Computer Vision Deep",
  5: "NLP → Transformers",
  6: "Large Language Models",
  7: "Retrieval-Augmented Generation",
  8: "AI Agents",
  9: "Multimodal AI",
  10: "MLOps & Production",
  11: "2025 Frontier",
  12: "Specialized Domains",
};
