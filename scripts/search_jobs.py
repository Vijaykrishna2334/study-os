#!/usr/bin/env python3
import sys
import json

def main():
    role     = sys.argv[1] if len(sys.argv) > 1 else "AI Engineer"
    location = sys.argv[2] if len(sys.argv) > 2 else "India"
    remote   = sys.argv[3].lower() == "true" if len(sys.argv) > 3 else False

    try:
        from jobspy import scrape_jobs
        import pandas as pd

        jobs_df = scrape_jobs(
            site_name=["linkedin", "indeed", "glassdoor", "google"],
            search_term=role,
            location="" if remote else location,
            results_wanted=15,
            hours_old=336,       # 2 weeks
            country_indeed="India",
            linkedin_fetch_description=False,
            verbose=0,
        )

        # Build keyword filter from the search role
        role_words = [w.lower() for w in role.split() if len(w) > 2]
        ALWAYS_INCLUDE = ["ai", "ml", "llm", "nlp", "genai", "machine learning",
                          "data scientist", "data science", "deep learning",
                          "artificial intelligence", "computer vision", "mlops"]

        def is_relevant(title: str) -> bool:
            t = title.lower()
            # Must contain at least one AI/ML keyword — role_words alone not enough
            # (avoids "Staff Engineer I", "SDE IV" etc.)
            has_ai_kw = any(kw in t for kw in ALWAYS_INCLUDE)
            has_role_kw = any(w in t for w in role_words if w not in ("engineer","developer","scientist"))
            return has_ai_kw or has_role_kw

        jobs = []
        for _, row in jobs_df.iterrows():
            title = str(row.get("title", "") or "").strip()
            company = str(row.get("company", "") or "").strip()
            if not title or not company or title.lower() == "nan" or company.lower() == "nan":
                continue

            # Skip irrelevant jobs
            if not is_relevant(title):
                continue

            salary = None
            mn = row.get("min_amount")
            mx = row.get("max_amount")
            cur = str(row.get("currency", "") or "")
            try:
                if mn and mx:
                    salary = f"{cur}{int(float(mn)):,}–{int(float(mx)):,}"
                elif mn:
                    salary = f"{cur}{int(float(mn)):,}+"
            except Exception:
                salary = None

            posted = str(row.get("date_posted", "") or "Recently")
            if posted.lower() == "nan":
                posted = "Recently"

            desc = str(row.get("description", "") or "")
            if desc.lower() == "nan":
                desc = ""
            desc = " ".join(desc.split())[:400]

            jobs.append({
                "title":       title,
                "company":     company,
                "location":    str(row.get("location", location) or location),
                "platform":    str(row.get("site", "Other") or "Other").capitalize(),
                "salary":      salary,
                "posted":      posted,
                "url":         str(row.get("job_url", "#") or "#"),
                "description": desc,
                "tags":        [],
            })

        print(json.dumps(jobs))

    except ImportError:
        print(json.dumps({"error": "python-jobspy not installed. Run: pip3 install python-jobspy"}))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
