import "./globals.css";
import Sidebar from "@/components/Sidebar";
import NotificationTicker from "@/components/NotificationTicker";
import PomodoroWidget from "@/components/PomodoroWidget";

export const metadata = {
  title: "Study OS — Vijay's AI/ML Interview Mastery",
  description: "12-phase AI/ML study + interview prep, powered by Gemini.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 px-6 md:px-10 py-8 max-w-[1400px] mx-auto w-full">
            {children}
          </main>
        </div>
        <NotificationTicker />
        <PomodoroWidget />
      </body>
    </html>
  );
}

