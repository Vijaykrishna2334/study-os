import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const PYTHON = "/var/www/study-app/venv/bin/python";
const SCRIPT = "/var/www/study-app/scripts/search_jobs.py";

export async function POST(req: NextRequest) {
  try {
    const { role, location = "India", remote } = await req.json();
    if (!role || role.trim().length < 2) {
      return NextResponse.json({ error: "Please enter a job role" }, { status: 400 });
    }

    const safeRole     = role.trim().replace(/"/g, "");
    const safeLocation = (location || "India").replace(/"/g, "");
    const safeRemote   = remote ? "true" : "false";

    const cmd = `"${PYTHON}" "${SCRIPT}" "${safeRole}" "${safeLocation}" "${safeRemote}"`;

    const { stdout, stderr } = await execAsync(cmd, { timeout: 60000 });

    if (stderr && stderr.includes("error")) {
      console.error("[discover] python stderr:", stderr.slice(0, 300));
    }

    const parsed = JSON.parse(stdout.trim());

    // Python returned an error object
    if (parsed && !Array.isArray(parsed) && parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 500 });
    }

    const jobs = Array.isArray(parsed) ? parsed : [];
    return NextResponse.json({ ok: true, jobs, role: safeRole, location: remote ? "Remote" : safeLocation });

  } catch (e: any) {
    console.error("[discover] error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
