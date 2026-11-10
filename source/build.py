"""Build the artifact page (images embedded) and the GitHub copy (images as files).

Photos: img/hero.*, img/story.* ; slideshow list below (img/web) ; other pages use {{IMG:img/...}} tokens.
"""
import base64, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, "img")

# Built Together slideshow: (title, small tag, image in img/web, focus point for cropping)
SLIDES = [
    ("Teamwork at the track", "Cronin Derby Downs", "2026-racers-group", "50% 45%"),
    ("Ready to race", "Race day", "kevin-nephew-calvin-car", "50% 30%"),
    ("Generations at the track", "Race day", "racer-with-veteran", "50% 52%"),
    ("Down the hill", "Cronin Derby Downs", "race-day-track-tents", "50% 55%"),
    ("Where Flint racing began", "From the archives", "flint-journal-starting-ramp-bw", "50% 55%"),
    ("Builders, lined up and proud", "From the archives", "1938-builders-lineup-bw", "50% 55%"),
    ("Good luck, racer", "From the archives", "flint-journal-handshake-bw", "50% 45%"),
    ("To the finish line", "From the archives", "checkered-flag-finish-bw", "50% 60%"),
]


# Each inner list is one slide of the partner carousel (up to 4 cards). "your-logo" = the Become a partner card.
PARTNER_PAGES = [
    [("goyette", "Goyette Mechanical"), ("ideal-group", "Ideal Group"),
     ("united-way", "United Way of Southeastern Michigan"), ("flint-community-schools", "Flint Community Schools")],
    [("community-foundation", "Community Foundation of Greater Flint"), ("huntington", "Huntington Bank"),
     ("city-of-flint", "City of Flint"), ("uaw-598", "UAW Local 598")],
    [("kgcb", "Keep Genesee County Beautiful"), ("your-logo", "Your Logo Here")],
    [("motor-city", "Motor City Sign Works"), ("graphics-galore", "Graphics Galore"), ("moonwalk-man", "Moonwalk Man"),
     ("bd", "Behind Your Design")],
]


def find(name):
    for ext in (".webp", ".jpg", ".jpeg", ".png"):
        p = os.path.join(IMG, name + ext)
        if os.path.exists(p):
            return p
    return None


def data_uri(path):
    ext = os.path.splitext(path)[1].lower().lstrip(".")
    mime = {"jpg": "jpeg", "jpeg": "jpeg"}.get(ext, ext)
    return "data:image/%s;base64,%s" % (mime, base64.b64encode(open(path, "rb").read()).decode())


def build(embed):
    src = open(os.path.join(HERE, "index.src.html")).read()
    ref = (lambda p: data_uri(p)) if embed else (lambda p: os.path.relpath(p, HERE).replace(os.sep, "/"))

    logo = find("logo-dark")
    src = src.replace("{{LOGO_DARK}}", ref(logo))
    src = src.replace("{{LOGO_WHITE}}", ref(find("logo-white")))

    hero = find("hero")
    src = src.replace("{{HERO_PHOTO}}", '<img src="%s" alt="Race day: spectator tents and parked cars along the track on a sunny day">' % ref(hero) if hero
                      else '<div class="photo-ph"><div><b>Hero photo</b>DSC_4677.JPG</div></div>')
    story = find("story")
    src = src.replace("{{STORY_PHOTO}}", '<img src="%s" alt="Black-and-white photo of a Soap Box Derby helmet in the foreground while workers prepare the original track">' % ref(story) if story
                      else '<div class="photo-ph"><div><b>Family Story photo</b></div></div>')

    slides = [{"title": t, "tag": g, "img": ref(os.path.join(IMG, "web", f + ".webp")), "pos": pos}
              for t, g, f, pos in SLIDES]
    src = src.replace("{{SLIDES}}", json.dumps(slides))
    partners = [[{"name": n, "img": "" if f == "your-logo" else ref(os.path.join(IMG, "partners", f + ".webp"))}
                 for f, n in page] for page in PARTNER_PAGES]
    src = src.replace("{{PARTNERS}}", json.dumps(partners))
    for k, f in [("ABOUT_1", "about-kevin-nephew-calvin-car"), ("ABOUT_2", "about-racer-with-veteran"), ("ABOUT_3", "about-2026-racers-group")]:
        src = src.replace("{{%s}}" % k, ref(find(f)))
    # Any {{IMG:path}} token in the page becomes that image (embedded or a file path)
    src = re.sub(r"\{\{IMG:([^}]+)\}\}", lambda m: ref(os.path.join(HERE, m.group(1))), src)
    return src


if __name__ == "__main__":
    art = build(True)
    open(os.path.join(HERE, "flint-racing-site.html"), "w").write(art)
    page = build(False)
    i = page.index("</style>") + len("</style>")
    open(os.path.join(HERE, "index.html"), "w").write(
        '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
        + page[:i] + "\n</head>\n<body>\n" + page[i:] + "\n</body>\n</html>\n")
    print("artifact bytes:", len(art))
