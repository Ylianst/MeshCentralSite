# MeshCentral — Modern Website Redesign

A complete, production-quality redesign of the MeshCentral homepage intended as a drop-in or strong proposal replacement for the current [MeshCentralSite](https://github.com/Ylianst/MeshCentralSite) GitHub Pages experience.

**Live preview**: Just open `index.html` in any modern browser (no build step required).

## Why this redesign?

The current official site (as of 2026) is a very old-school, 2000s-era layout with absolute positioning, floats, a rotating image carousel, and a massive table of compatibility logos. It works, but it doesn't communicate the power, modernity, or actual user experience of MeshCentral.

This new site delivers:

- Dark, premium cyber/tech aesthetic that fits a self-hosted RMM tool perfectly
- **Fully interactive RMM simulator** — the killer feature. Click real device cards and experience simulated remote desktop (OS-specific mocks for Ubuntu / Windows 11 / macOS), a working terminal with actual commands (`neofetch`, `stats`, `agent`, `amt`, etc.), and a file manager
- Clear architecture explanation with diagram
- One-command quickstart (npm / Docker / npx)
- Prominent, working Downloads & Resources section linking to real GitHub releases, npm, Docker, and wiki
- Excellent mobile experience (including the simulator)
- Strong CTAs and community pride messaging

## Project Structure

```
/Users/ZacsMacBook/Documents/Mesh Central Website/
├── index.html          # Single-file app (everything is here)
├── index.css           # All styles (glassmorphism + neon)
├── index.js            # Full simulator logic + nav + copy + tabs
└── README.md           # You are here
```

No dependencies. No bundler. Works offline after first font load.

## How to Preview

```bash
# Simplest
open index.html

# Or with a local server (recommended)
python3 -m http.server 8765
# then visit http://localhost:8765
```

## Key Interactive Elements (all buttons & flows verified)

- **Navigation**: Smooth scroll + mobile hamburger (fully functional)
- **Quickstart tabs**: npm / Docker / npx — click to switch
- **Copy buttons**: Copy the exact commands to clipboard with visual feedback
- **Simulator** (the heart of the site):
  - Click any device row → jumps into Remote Desktop view
  - Action buttons (Desktop / Terminal / Files) work
  - Sidebar navigation between views
  - **Persistent "← Devices" button** (especially important on mobile when the sidebar collapses to icons)
  - Terminal accepts real commands (`help`, `neofetch`, `stats`, `agent`, `amt`, `clear`, `exit`)
  - File manager: clicking files shows download toast, upload/new folder buttons work
  - Disconnect buttons everywhere return you cleanly to the device list
- All external links open in new tabs to the real project resources

## Mobile Experience

Tested at 375px width. The simulator gracefully collapses the sidebar to icon-only navigation while the new persistent back bar guarantees users can never get "stuck" in a sub-view.

## Contribution Path

This was built with the explicit goal of being contributed back to the MeshCentral project.

Recommended approach:

1. Open a discussion or issue in https://github.com/Ylianst/MeshCentral/discussions or the main repo
2. Point to a deployed version of this folder (GitHub Pages, Cloudflare Pages, or a fork of MeshCentralSite)
3. Offer to do the integration work into the existing `MeshCentralSite` repo structure if Ylian likes the direction

The site is intentionally **single-file** so it can be merged with minimal disruption.

## Future Polish Ideas (if adopted)

- Replace the OS mock wallpapers with real sanitized MeshCentral screenshots
- Add a proper "Screens" gallery page or modal
- Pull live GitHub star count / latest release version via API
- Add a very light "tour" mode for first-time visitors

## Credits

Original concept, design, and the entire interactive simulator built as a contribution to the incredible MeshCentral project by Ylian Saint-Hilaire and the community.

MeshCentral is one of the best pieces of open-source infrastructure software in existence. This site exists because it deserves a front door that matches its quality.

---

**Status**: Ready for review and real-world testing. All primary buttons and flows have been exercised and hardened.

If you're evaluating this for the official site — thank you. The project is worth it.