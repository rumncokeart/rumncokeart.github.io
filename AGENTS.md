# AGENTS.md

## Cursor Cloud specific instructions

This repository is a **static website** (plain HTML/CSS/vanilla JS) — the personal
portfolio for painter Ramya Shenoy. There is **no build system, no package manager,
and no dependencies to install**. Pages are served as-is.

### Services

- **Static file server** (only service): serves the HTML/CSS/JS/images. There is no
  backend, database, or API owned by this project.

### Run / develop

- Serve locally with any static server. The documented command (see `README.md`) is:
  `python3 -m http.server 8080` (then open `http://localhost:8080`). `python3` is
  preinstalled.
- Editing HTML/CSS/JS requires only a page refresh — there is no bundler or hot reload.

### Lint / test / build

- There are **no lint, automated test, or build steps** in this repo (no configs,
  scripts, or tooling exist). Verification is done by serving the site and viewing pages.

### Gotchas

- The contact form (`contact.html`) posts to a third-party service (FormSubmit,
  `formsubmit.co`). Do **not** actually submit it during testing — it sends real email
  and the first submission requires a one-time email confirmation.
- `index.html` includes a Google Tag Manager analytics snippet; it is not required for
  local development.
- Deployment is via GitHub Pages with a custom domain (`CNAME`).
