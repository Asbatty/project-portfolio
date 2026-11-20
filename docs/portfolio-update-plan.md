# Portfolio Update Plan — Nov 2026

Research pulled from past Claude Code sessions (WorksOut, Home Assistant, Fire TV) and the
current resume PDF. Nothing on the live site has changed yet.

## 0. Decisions (answered Nov 20)

1. **Resume source:** Andrew will send the new resume PDF later. §1 waits on it.
2. **Beach Closure Sign:** gets its own project page (§2d). Andrew will look for photos.
3. **AI credit:** none. Role fields list Andrew alone (e.g. "Solo — design & development").
4. **Smart-home pages:** two separate pages, *Home Server* and *Fire TV HUD*. Each page has a
   section on how they work together, and the two pages link to each other.
5. **Fire TV HUD source:** stays private. The page describes it with no repo link.

## 1. Resume ↔ site sync

| Item | Resume (May 2026) | Site today | Action |
|---|---|---|---|
| Skills | SolidWorks, Fusion 360, MATLAB, Python, AutoCAD, Excel, Arduino, C++, EES | Adds KiCad, ESP32, LabVIEW, strain gauges/DAQ, machining, 3D printing; no AutoCAD/Excel/EES | Merge into one list; add software skills (React, TypeScript, Kotlin, Home Assistant/YAML, Git) to both |
| Experience | DOT Engineering Intern (2024); GLBRC Lab Assistant (2024) | No experience section | Add a short Experience section to `index.html` (about section) |
| Education | B.S. ME + Environmental Studies certificate, May 2026 | Certificate not mentioned | Add the certificate |
| Projects | Mohr's Circle, BLE macro pad, Beach Sign | Mohr's, Macro Pad, CCTV | Add WorksOut, Home Server and Fire TV HUD to the new resume |
| File | `assets/AndrewBattenbergResume.pdf` | Linked at `index.html:40` | Replace the file under the **same filename** so the link keeps working |

## 2. New project pages

Each one follows the CLAUDE.md "Adding a New Project" steps: `projects/<slug>/index.html`, a card in
`projects/index.html`, and a 16:9 800×450 thumbnail.

### 2a. WorksOut (Lift) — `projects/worksout/` — **done Nov 20** (screenshots taken from a local build with a seeded demo profile)
- **Card:** "An offline-first workout tracker PWA that plans each session and suggests the next
  weight from your history. No backend, no accounts." Tags: React · TypeScript · PWA · Offline-first
- **Meta:** Web App (PWA) · Sep 2026 – present · Solo design & development
- **Subtitle:** An installable, offline-first lifting tracker with double-progression weight
  suggestions, built with React and TypeScript and shared by link.
- **Sections:**
  - Overview: daily plan and logging, double-progression suggestions.
  - Architecture: Vite, React and TypeScript with zero runtime dependencies beyond React. Pure-function
    logic tested with Vitest, CI to GitHub Pages, program validation script (6 programs, 74 exercises).
  - Keeping data safe with no server: install-first wizard, persistent storage, one-tap backups,
    versioned migrations.
  - Iterating from real use: draggable rest timer, 30-min program, the 15↔20 lb dumbbell
    progression bug fixed using estimated 1RM.
- **Links:** live app https://asbatty.github.io/WorksOut/ · repo https://github.com/Asbatty/WorksOut
- **Assets needed:** 6–7 phone screenshots taken with a **demo profile**: today's plan, active
  workout (thumbnail), rest timer, progress chart, history, program picker and editor.
- **Before publishing:** decide whether to push the unpushed "backup nudge after 10 workouts"
  change. Don't describe it as live until then.

### 2b. Home Server — `projects/home-server/` — **needs screenshots + privacy pass**
- **Card:** "Self-hosted Home Assistant server on a Mac mini with custom tablet, phone and TV
  dashboards, local-first lighting and pet-feeder monitoring." Tags: Home Assistant ·
  Self-hosted · Smart Home · Matter / Thread
- **Meta:** Personal project · 2026 (ongoing) · Solo — design, configuration, scripting
- **Sections:**
  - Overview: native HA in a Python venv under launchd, Matter server and Thread border router,
    Tailscale for remote access, every change goes through validate → restart → Git commit.
  - Dashboards and controls: Mushroom and card-mod wall tablet, phone and "newspaper" pages,
    room lighting groups and modes, one-button TV power with Wake-on-LAN.
  - Designing for reliability: the feeder runs its own schedule and HA only monitors and backs
    it up. The recurring lockup was traced to a known Tuya firmware issue. Mushroom cards
    fixed with `extra_module_url`.
  - Guest / house-sitter mode: a restricted dashboard with auto-off lamps and written
    instructions. Describe it **generically**, with no dates or schedules.
  - Working with the Fire TV HUD: HA supplies the HUD's live panels and alerts, and the TV
    power, sleep and memory-cleanup automations run from HA. Link to the Fire TV HUD page.
- **Assets needed:** dashboard screenshots with names, presence and times blurred, plus a simple
  architecture diagram (Mac mini → HA → Matter/Thread/Zigbee/Wi-Fi devices → dashboards).

### 2c. Fire TV HUD — `projects/fire-tv-hud/` — **not ready (needs screenshots; repo decision)**
- **Card:** "A custom Kotlin home screen for Fire TV that strips Amazon's ads and turns the TV
  into a Home Assistant control panel." Tags: Android · Kotlin · Jetpack Compose · ADB
- **Meta:** Software / Smart Home · Oct–Nov 2026 · Solo — design & development
- **Sections:**
  - Debloat: ADB package disabling, DNS-blocking the packages that can't be disabled, verifying
    playback still works.
  - The HUD: Compose launcher, accessibility service to take over the Home button, brand-colour
    glow grid, Continue row, live HA panels and alert toasts.
  - Working within the hardware limits: freezes on 2 GB of RAM fixed with memory-light decoding
    plus a sleep/overnight restart, and joint Fire TV + Samsung TV power control.
  - Part of a bigger system: the HUD is the TV-side front end of the Home Server. It reads
    lights, modes, thermostat, vacuum and feeder state from HA and sends commands back. Link to
    the Home Server page.
- **Assets needed:** `adb shell screencap` captures of the home grid (thumbnail), lamps/modes
  and an alert toast, plus a photo of the TV.
- **Before publishing:** confirm the debloat package count and the dates. The source stays
  private: no repo link, and no code excerpts that contain IPs, tokens or keystore details.

### 2d. Remote Beach Closure Sign — `projects/beach-sign/` — **needs photos**
- **Card:** "A remotely updated beach-closure sign: an Arduino with a cellular shield that
  changes its message when it receives an SMS." Tags: Arduino · Cellular / SMS · Electronics
- **Meta:** Team project · UW–Madison · Role: circuit design, manufacturing and testing
- **Sections:** the problem (getting closures posted in real time), the hardware (Arduino with
  a SIM shield, the sign build), the SMS-to-sign software, testing, and my contributions.
  Take the details from the resume once it arrives.
- **Assets needed:** photos of the sign, the electronics and any schematics or reports. Andrew
  is looking for them.

## 2e. Recruiter-readiness pass (Nov 20) — done
Projects grouped (hardware first, Mohr's leads with an ASEE badge), Experience section, phone number
removed, full name everywhere, link previews, images resized, Recipe Box edit bar hidden from visitors,
Mohr's page rebuilt around my role and results, CCTV page written.

## 3. Existing TODOs (from CLAUDE.md)
- `macro-pad`: replace the PDF placeholder with the real write-up.
- `cctv-camcorder`: finish the overview, and add images and CAD files.
- `mohrs-circle`: link the three unused images (`Prototype App.png`, `Prototype App 2.png`,
  `PrototypeReal.jpg`) in a gallery.

## 4. Landing page and listing
- `projects/index.html`: add the three cards. Consider grouping into **Hardware / Engineering**
  (Mohr's, Macro Pad, CCTV, Beach Sign) and **Software / Smart Home** (WorksOut, Home Server,
  Fire TV HUD).
- `index.html`: update the hero/about blurb to cover software and self-hosting alongside ME work.
  Feature one software project in the `.preview-thumbs` strip. Add an Experience block.
- Update the CLAUDE.md file tree and "Current Project Status" table.

## 5. Privacy checklist (public site — check every page before it ships)
Never include:
- IPs (LAN or Tailscale) or ports
- usernames or local paths
- SSH, deploy or signing keys
- HA tokens or entity IDs that reveal the household
- private repo names (the HA config repo)
- email or phone in new copy
- device names or serials
- housemate or other personal names, including the program named after a person in WorksOut
- presence/"who's home" data, feeding times, vacation or vacuum timing
- calendar contents
- the real bodyweight or profile in WorksOut screenshots
- Claude session links

Separately (not a site task): rotate the Google OAuth client secret that was pasted into a
chat on Nov 14.

## 6. Suggested order
1. WorksOut page: the easiest, since the repo and live app are both public; needs screenshots only.
2. Home Server and Fire TV HUD pages, built together so the cross-links and "working
   together" sections match.
3. Resume sync (§1) and landing-page refresh (§4), once the resume arrives.
4. Beach Sign page, once photos are found.
5. Existing TODOs (§3) as content becomes available.
