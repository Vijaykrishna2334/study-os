import CompanyResearchClient from "@/components/CompanyResearchClient";

export const dynamic = "force-dynamic";

export default function CompanyPage() {
  return (
    <div className="space-y-6 animate-[fadeInUp_0.5s_ease-out]">
      <header>
        <div className="text-xs uppercase tracking-[0.25em] text-text-muted mb-2">Company Research · Gemini-driven</div>
        <h1 className="text-4xl font-extrabold gradient-text">Know them before they know you.</h1>
        <p className="text-text-secondary mt-2 max-w-2xl">
          Type any company name. Gemini researches: products, leadership, recent news, interview process, common questions, culture, tech stack. Saved to library forever.
        </p>
      </header>
      <CompanyResearchClient />
    </div>
  );
}
