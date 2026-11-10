# FlintRacing.org-
Hands-on STEM program for youth and families. Build Soap Box Derby Vehicles, 3D-Printing, STEAM projects and more! 



Public site for Flint Racing & STEM, Flint, Michigan.

- `index.html` — the whole public site (pages switch by the address `#`, e.g. `#calendar`).
- `img/` — logos, partner logos and photos used by the site.
- `source/` — the editable source (`index.src.html`) and `build.py`, which produces `index.html`.

## Publishing
GitHub Pages serves this repository from the `main` branch, root folder.

## Admin portal (Supabase)
- Go to `#admin` on the live site (or Sign in → Admin).
- Admins can edit any text or photo in place ("Edit the site"), manage calendar events and monthly bulletin notes, and read questionnaire inquiries.
- Data lives in the Supabase project **FlintRacingandSTEM**: tables `site_content`, `events`, `bulletin_notes`, `inquiries`, `admins`, and the `site-images` storage bucket. Row-level security lets the public read site content and send inquiries; only admins can change anything.
- If Supabase can't be reached, the site falls back to the content built into `index.html`.

## Coming next
- Portals: Program Dashboard, Teacher planning, Photographer, Race Day, Building Workshop sign-in, and the live race view.
