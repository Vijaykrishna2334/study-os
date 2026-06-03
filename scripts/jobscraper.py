#!/usr/bin/env python3
"""
Real job scraper using python-jobspy.
Called by the Next.js API: node spawn → python3 scripts/jobscraper.py
Input:  JSON on argv[1] with {role, location, remote, results}
Output: JSON array of job objects to stdout
"""
import sys, json, traceback

def scrape(role, location, remote, results_wanted):
    from jobspy import scrape_jobs
    import pandas as pd

    site_names = ["indeed", "linkedin", "glassdoor", "google"]
    
    jobs_df = scrape_jobs(
        site_name=site_names,
        search_term=role,
        location=location or "India",
        results_wanted=results_wanted or 15,
        hours_old=168,           # last 7 days
        is_remote=remote or False,
        country_indeed="India",
        linkedin_fetch_description=True,
    )

    if jobs_df is None or jobs_df.empty:
        return []

    # Normalize columns
    jobs = []
    for _, row in jobs_df.iterrows():
        def s(col, fallback=""):
            v = row.get(col, fallback)
            if v is None or (hasattr(v, '__class__') and v.__class__.__name__ == 'float'):
                return fallback
            return str(v).strip()

        platform_map = {
            "indeed": "Indeed",
            "linkedin": "LinkedIn",
            "glassdoor": "Glassdoor",
            "google": "Google Jobs",
            "zip_recruiter": "ZipRecruiter",
        }
        site_raw = s("site", "indeed").lower()
        platform = platform_map.get(site_raw, site_raw.title())

        # Salary
        min_sal = s("min_amount")
        max_sal = s("max_amount")
        sal_currency = s("currency", "")
        if min_sal and max_sal:
            if "INR" in sal_currency or not sal_currency:
                salary = f"₹{int(float(min_sal))//100000}-{int(float(max_sal))//100000} LPA"
            else:
                salary = f"{sal_currency}{min_sal}-{max_sal}"
        else:
            salary = None

        # Description
        desc = s("description") or s("job_function") or ""
        desc = desc[:300] if desc else f"{s('title')} role at {s('company')}"

        # Tags from description keywords
        keywords = ["Python", "PyTorch", "TensorFlow", "LLM", "NLP", "ML", "AI", "Deep Learning",
                   "Computer Vision", "MLOps", "Docker", "Kubernetes", "AWS", "GCP", "Azure",
                   "RAG", "Langchain", "Transformers", "BERT", "GPT", "SQL", "Spark"]
        tags = [k for k in keywords if k.lower() in desc.lower()][:5]
        if not tags:
            tags = ["AI/ML", "Python"]

        # Date posted
        date_posted = s("date_posted") or s("job_posted_at_datetime_utc") or "Recently"
        if "T" in date_posted:
            date_posted = date_posted.split("T")[0]

        job_url = s("job_url") or s("job_url_direct") or "https://www.linkedin.com/jobs/"

        jobs.append({
            "title": s("title") or role,
            "company": s("company") or "Tech Company",
            "location": s("location") or location or "India",
            "platform": platform,
            "salary": salary,
            "posted": date_posted,
            "url": job_url,
            "description": desc[:250],
            "tags": tags,
        })

    return jobs

if __name__ == "__main__":
    try:
        params = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
        role     = params.get("role", "AI ML Engineer")
        location = params.get("location", "India")
        remote   = params.get("remote", False)
        results  = params.get("results", 15)
        
        jobs = scrape(role, location, remote, results)
        print(json.dumps({"ok": True, "jobs": jobs, "count": len(jobs)}))
    except Exception as e:
        print(json.dumps({"ok": False, "error": str(e), "trace": traceback.format_exc()}))
