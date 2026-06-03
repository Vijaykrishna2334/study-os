import PortfolioTracker from "@/components/PortfolioTracker";
import JDMatcher from "@/components/JDMatcher";

export const dynamic = "force-dynamic";

export default function CareerPage() {
  return (
    <div className="space-y-8 animate-[fadeInUp_0.5s_ease-out]">
      <header>
        <div className="text-xs uppercase tracking-[0.25em] text-text-muted mb-2">Career · turn study into offers</div>
        <h1 className="text-4xl font-extrabold gradient-text">Portfolio + JD Matcher</h1>
        <p className="text-text-secondary mt-2 max-w-2xl">
          Track your 4 showcase repos. Paste any job description — get a fit score, the topics you've already mastered that fit, the gaps to close, and tailored resume bullets.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Showcase repos</h2>
        <PortfolioTracker />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Job-description matcher</h2>
        <JDMatcher />
      </section>
    </div>
  );
}
