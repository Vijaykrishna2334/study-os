import { NextRequest, NextResponse } from "next/server";

function mdToHtml(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inUl = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const esc = line
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code>$1</code>")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    if (/^# /.test(line)) {
      if (inUl) { out.push("</ul>"); inUl = false; }
      out.push(`<h1>${esc.slice(2)}</h1>`);
    } else if (/^## /.test(line)) {
      if (inUl) { out.push("</ul>"); inUl = false; }
      out.push(`<h2>${esc.slice(3)}</h2>`);
    } else if (/^### /.test(line)) {
      if (inUl) { out.push("</ul>"); inUl = false; }
      out.push(`<h3>${esc.slice(4)}</h3>`);
    } else if (/^#### /.test(line)) {
      if (inUl) { out.push("</ul>"); inUl = false; }
      out.push(`<h4>${esc.slice(5)}</h4>`);
    } else if (/^[-•] /.test(line)) {
      if (!inUl) { out.push("<ul>"); inUl = true; }
      out.push(`<li>${esc.replace(/^[-•] /, "")}</li>`);
    } else if (/^---+$/.test(line)) {
      if (inUl) { out.push("</ul>"); inUl = false; }
      out.push("<hr>");
    } else if (line.trim() === "") {
      if (inUl) { out.push("</ul>"); inUl = false; }
    } else {
      if (inUl) { out.push("</ul>"); inUl = false; }
      out.push(`<p>${esc}</p>`);
    }
  }
  if (inUl) out.push("</ul>");
  return out.join("\n");
}

function buildHtml(resumeMarkdown: string, job?: { title: string; company: string }): string {
  const html = mdToHtml(resumeMarkdown);
  const title = job ? `Resume — ${job.title} at ${job.company}` : "Resume";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: Arial, 'Helvetica Neue', sans-serif;
      font-size: 10pt;
      line-height: 1.35;
      color: #111;
      background: #fff;
      max-width: 780px;
      margin: 0 auto;
      padding: 28px 36px;
    }

    /* Name */
    h1 {
      font-size: 17pt;
      font-weight: 700;
      color: #000;
      letter-spacing: -0.2px;
      margin-bottom: 3px;
    }

    /* Section headers */
    h2 {
      font-size: 9.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #1a56db;
      border-bottom: 1.2px solid #1a56db;
      padding-bottom: 2px;
      margin-top: 10px;
      margin-bottom: 5px;
    }

    /* Job title / project name */
    h3 {
      font-size: 10pt;
      font-weight: 700;
      color: #111;
      margin-top: 6px;
      margin-bottom: 0px;
    }

    /* Company / date line */
    h4 {
      font-size: 9.5pt;
      font-weight: 400;
      color: #444;
      font-style: italic;
      margin-top: 0;
      margin-bottom: 2px;
    }

    hr {
      border: none;
      border-top: 1px solid #ddd;
      margin: 6px 0;
    }

    ul {
      margin: 2px 0 4px 16px;
      list-style-type: disc;
    }

    li {
      margin-bottom: 1px;
      font-size: 9.5pt;
      line-height: 1.3;
    }

    p {
      margin-bottom: 3px;
      font-size: 9.5pt;
      line-height: 1.35;
    }

    a { color: #1a56db; text-decoration: none; }
    strong { font-weight: 700; }
    em { font-style: italic; }
    code { font-family: monospace; font-size: 9pt; }

    /* Print */
    @media print {
      body { padding: 0; font-size: 9.5pt; }
      h1 { font-size: 16pt; }
      h2 { font-size: 9pt; color: #1a56db; border-color: #1a56db; margin-top: 8px; }
      li { font-size: 9pt; }
      p  { font-size: 9pt; }
      a  { color: #000; }
      .no-print { display: none !important; }
      @page {
        size: A4;
        margin: 10mm 13mm;
      }
    }

    /* Print bar */
    .print-bar {
      position: fixed; top: 0; left: 0; right: 0;
      background: #1e1b4b; color: #fff;
      padding: 8px 20px;
      display: flex; align-items: center; gap: 10px;
      z-index: 100;
      font-family: -apple-system, sans-serif; font-size: 13px;
    }
    .print-bar span { flex: 1; font-weight: 600; }
    .print-bar button {
      padding: 5px 16px; border-radius: 5px; border: none;
      cursor: pointer; font-size: 12px; font-weight: 600;
    }
    .btn-pdf { background: #4f46e5; color: #fff; }
    .btn-close { background: rgba(255,255,255,0.15); color: #fff; }
    .body-padded { margin-top: 44px; }
  </style>
</head>
<body>
  <div class="print-bar no-print">
    <span>📄 ${title}</span>
    <button class="btn-pdf" onclick="window.print()">⬇ Save as PDF (2 pages)</button>
    <button class="btn-close" onclick="window.close()">✕ Close</button>
  </div>
  <div class="body-padded">
    ${html}
  </div>
  <script>
    setTimeout(() => window.print(), 600);
  </script>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const { content, title, company } = await req.json();
    if (!content) return NextResponse.json({ error: "No content" }, { status: 400 });
    const html = buildHtml(content, title ? { title, company: company || "" } : undefined);
    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
