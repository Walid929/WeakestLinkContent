"""Converts a question export CSV into the game's content files.

    python tools/import_csv.py path/to/questions_export.csv

Writes questions/en.json, questions/ar.json and categories.json next to manifest.json.

CSV columns used: questionText, category, language, difficulty, questionType, option1-4,
correctOption, textAnswer, boolAnswer, fileUrl.

- Categories are matched across the two languages through CATEGORY_MAP below, so one
  on/off switch in the lobby covers both. Unknown categories get their own id automatically.
- Questions without options get three wrong answers picked from other answers in the same
  category (so a flag question gets other country names). They are only shown in the
  multiple-choice answer modes.
- fileUrl becomes a picture, audio clip or video shown on the TV.
"""
import csv, json, os, re, sys, random, hashlib
from collections import defaultdict, Counter

# id: (English name, Arabic name, on by default, [CSV names that map to it])
CATEGORY_MAP = [
    ("general",     "General Knowledge",     "معلومات عامة",            True,  ["General Knowledge", "Entertainment", "Entertaiment", "معلومات عامة"]),
    ("capitals",    "Capitals",              "عواصم",                   True,  ["Capitals", "عواصم"]),
    ("flags",       "Flags",                 "أعلام",                   True,  ["Flags", "أعلام"]),
    ("maps",        "Maps",                  "خرائط",                   True,  ["Maps", "خرائط"]),
    ("geography",   "Geography",             "جغرافيا",                 True,  ["Geography", "جغرافيا"]),
    ("history",     "History",               "تاريخ",                   True,  ["History"]),
    ("landmarks",   "Landmarks",             "معالم سياحية",            True,  ["Landmarks", "معالم سياحية"]),
    ("animals",     "Animal World",          "عالم الحيوانات",          True,  ["Animal World", "عالم الحيوانات"]),
    ("sports",      "Sports",                "رياضة",                   True,  ["Sports", "رياضة"]),
    ("ucl",         "UEFA Champions League", "دوري أبطال أوروبا",       True,  ["Uefa Champions League", "دوري ابطال اوروبا"]),
    ("football",    "Football Missing Detail", "المعلومة الكروية المفقودة", True, ["Football Missing Detail", "المعلومة الكروية المفقودة"]),
    ("technology",  "Technology",            "تكنولوجيا",               True,  ["Technology"]),
    ("riddles",     "Riddles",               "ألغاز",                   True,  ["Riddles", "الغاز"]),
    ("brands",      "Brands",                "ماركات",                  True,  ["Brands", "ماركات"]),
    ("logos",       "Logos",                 "شعارات",                  True,  ["Logo", "Logos", "شعارات"]),
    ("q8logos",     "Kuwaiti Logos",         "شعارات كويتية",           True,  ["Q8 Logos", "شعارات كويتية"]),
    ("restaurants", "Restaurants",           "مطاعم",                   True,  ["Restaurants", "مطاعم"]),
    ("cuisine",     "World Cuisine",         "مطابخ عالمية",            True,  ["Cuisine", "Cuisine ", "Recipes", "مطابخ عالمية", "اكلات عالمية"]),
    ("grocery",     "Products",              "منتجات",                  True,  ["Grocery", "منتجات"]),
    ("cosmetics",   "Cosmetics",             "مستحضرات التجميل",        True,  ["Cosmetics", "مستحضرات التجميل"]),
    ("picture",     "Solve the Picture",     "خمن الصورة",              True,  ["Solve the picture", "خمن الصورة"]),
    # Audio/video clips take longer than a Weakest Link turn, so these start switched off.
    ("movies",      "Movies & Series",       "أفلام ومسلسلات",          False, ["Movies/Series", "أفلام/مسلسلات"]),
    ("songs",       "Songs",                 "أغاني",                   False, ["Songs", "أغاني"]),
    ("foreignsongs", "Foreign Songs",        "أغاني أجنبية",            False, ["أغاني اجنبية"]),
]

LANG = {"English": "en", "عربي": "ar", "Arabic": "ar", "en": "en", "ar": "ar"}
DIFF = {"Easy": 1, "سهل": 1, "Medium": 2, "متوسط": 2, "Hard": 3, "صعب": 3}
TRUE_FALSE = {"en": ("True", "False"), "ar": ("صح", "خطأ")}


def clean(s):
    return re.sub(r"\s+", " ", (s or "").replace("‏", "").replace("‎", "")).strip()


def media_of(url):
    url = (url or "").strip()
    if not url:
        return None
    path = url.split("?")[0].lower()
    if path.endswith(".mp3") or path.endswith(".wav") or path.endswith(".m4a") or path.endswith(".ogg"):
        kind = "audio"
    elif path.endswith(".mp4") or path.endswith(".webm") or path.endswith(".mov"):
        kind = "video"
    else:
        kind = "image"
    return {"type": kind, "url": url}


def main(csv_path, root):
    by_name = {}
    for cid, en, ar, on, names in CATEGORY_MAP:
        for n in names:
            by_name[clean(n)] = cid
    categories = {cid: {"id": cid, "name": {"en": en, "ar": ar}, "defaultOn": on} for cid, en, ar, on, _ in CATEGORY_MAP}

    rows = list(csv.DictReader(open(csv_path, encoding="utf-8-sig")))
    out = defaultdict(list)
    seen = set()
    skipped = Counter()
    for r in rows:
        lang = LANG.get(clean(r.get("language")))
        if not lang:
            skipped["unknown language"] += 1; continue
        text = clean(r.get("questionText"))
        qtype = clean(r.get("questionType")) or "text"
        wrong = []
        if qtype == "options":
            opts = [clean(r.get("option%d" % i)) for i in range(1, 5)]
            opts = [o for o in opts if o]
            answer = clean(r.get("correctOption"))
            if answer not in opts:
                skipped["options: correct answer not among options"] += 1; continue
            wrong = [o for o in opts if o != answer]
        elif qtype == "bools":
            t, f = TRUE_FALSE[lang]
            truth = clean(r.get("boolAnswer")).lower() == "true"
            answer, wrong = (t, [f]) if truth else (f, [t])
        else:
            answer = clean(r.get("textAnswer"))
        if not text or not answer or text.lower().startswith("test "):
            skipped["empty or test question"] += 1; continue

        raw_cat = clean(r.get("category"))
        cid = by_name.get(raw_cat)
        if cid is None:
            cid = re.sub(r"[^a-z0-9]+", "", raw_cat.lower()) or ("cat" + hashlib.md5(raw_cat.encode()).hexdigest()[:6])
            categories.setdefault(cid, {"id": cid, "name": {"en": raw_cat, "ar": raw_cat}, "defaultOn": True})

        media = media_of(r.get("fileUrl"))
        key = (lang, text, answer, media["url"] if media else "")
        if key in seen:
            skipped["duplicate"] += 1; continue
        seen.add(key)

        q = {"cat": cid, "diff": DIFF.get(clean(r.get("difficulty")), 2),
             # Spoken questions without pictures suit the fast head-to-head best.
             "final": media is None, "q": text, "a": answer, "wrong": wrong}
        if media:
            q["media"] = media
        out[lang].append(q)

    # Wrong answers for questions that came without options: other answers from the same category.
    rnd = random.Random(20260924)
    for lang, qs in out.items():
        pool = defaultdict(list)
        for q in qs:
            if q["a"] not in pool[q["cat"]]:
                pool[q["cat"]].append(q["a"])
        everything = sorted({q["a"] for q in qs})
        for q in qs:
            if len(q["wrong"]) >= 3:
                continue
            taken = {q["a"].lower()} | {w.lower() for w in q["wrong"]}
            candidates = [a for a in pool[q["cat"]] if a.lower() not in taken]
            rnd.shuffle(candidates)
            if len(candidates) < 3 - len(q["wrong"]):
                extra = [a for a in everything if a.lower() not in taken and a not in candidates]
                rnd.shuffle(extra)
                candidates += extra
            for a in candidates:
                if len(q["wrong"]) >= 3:
                    break
                if a.lower() not in taken:
                    q["wrong"].append(a); taken.add(a.lower())

    for lang, qs in out.items():
        for i, q in enumerate(qs, 1):
            q["id"] = "%s-%05d" % (lang, i)
        ordered = [{k: q[k] for k in ("id", "cat", "diff", "final", "q", "a", "wrong", "media") if k in q} for q in qs]
        path = os.path.join(root, "questions", lang + ".json")
        os.makedirs(os.path.dirname(path), exist_ok=True)
        json.dump({"schemaVersion": 2, "language": lang, "questions": ordered},
                  open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        counts = Counter(q["cat"] for q in qs)
        media = Counter(q["media"]["type"] for q in qs if "media" in q)
        print("%s: %d questions, media %s" % (lang, len(qs), dict(media)))
        print("   ", dict(counts))

    used = {q["cat"] for qs in out.values() for q in qs}
    cat_list = [c for c in categories.values() if c["id"] in used]
    json.dump({"schemaVersion": 1, "categories": cat_list}, open(os.path.join(root, "categories.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print("categories:", len(cat_list), "| skipped:", dict(skipped))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
