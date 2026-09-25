"""Converts the pipe-separated source lists into the questions/<lang>.json files the game reads.
Line format: category|difficulty[F]|question|answer|wrong1;wrong2;wrong3   (F marks head-to-head friendly)"""
import json, sys, os
CATS = {"arts","history","places","science","sport","general"}
def build(lang, src, dst):
    out, seen = [], set()
    for n, line in enumerate(open(src, encoding="utf-8"), 1):
        line = line.strip()
        if not line or line.startswith("#"): continue
        parts = line.split("|")
        assert len(parts) == 5, f"{src}:{n} expected 5 fields, got {len(parts)}"
        cat, diff, q, a, wrong = parts
        assert cat in CATS, f"{src}:{n} bad category {cat}"
        final = diff.endswith("F"); d = int(diff.rstrip("F"))
        w = [x.strip() for x in wrong.split(";") if x.strip()]
        assert len(w) == 3, f"{src}:{n} needs 3 wrong answers"
        assert a not in w, f"{src}:{n} answer repeated in wrong list"
        assert q not in seen, f"{src}:{n} duplicate question"; seen.add(q)
        out.append({"id": f"{lang}-{len(out)+1:04d}", "cat": cat, "diff": d, "final": final, "q": q, "a": a, "wrong": w})
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    json.dump({"schemaVersion": 1, "language": lang, "questions": out}, open(dst, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    from collections import Counter
    print(lang, len(out), dict(Counter(x["cat"] for x in out)), "final:", sum(x["final"] for x in out))
root = sys.argv[1] if len(sys.argv) > 1 else "."
# Run from the content repository root (questions/ next to manifest.json) or from the dev workspace (content/questions).
out = f"{root}/questions" if os.path.exists(f"{root}/manifest.json") else f"{root}/content/questions"
for lang in ("en", "ar"):
    build(lang, f"{root}/content_src/{lang}.txt", f"{out}/{lang}.json")
