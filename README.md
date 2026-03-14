# chatgpt-toc-chrome

Chrome extension for `chatgpt.com` / `chat.openai.com` that adds a compact, draggable table of contents for ChatGPT conversations.

This repository was assembled and modified with OpenAI Codex assistance. Review the code and behavior yourself before shipping it to users or submitting it to any browser store.

## Features

- Floating TOC panel with drag, collapse, search, and prompt rename support
- Prompt-grouped answer outline instead of a flat heading list
- Heading extraction from ChatGPT answers (`h1` to `h6`)
- Default compact view: groups visible, deeper heading levels collapsed by default
- Global `Expand all` and `Collapse all` controls in the panel header

## Attribution

This project is derived from and inspired by two upstream projects:

- [`sk5268/chatgpt_toc`](https://github.com/sk5268/chatgpt_toc?tab=readme-ov-file): UI / UX base and floating panel behavior
- [`WindZZzzZZzz/gpt-toc-extension`](https://github.com/WindZZzzZZzz/gpt-toc-extension): answer-heading extraction concept and reference implementation

Because this repo derives from GPL-licensed code in `chatgpt_toc`, this combined repository is published under GPL-3.0. See [LICENSE](./LICENSE) and [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).

## Install Locally

1. Open `chrome://extensions`
2. Enable Developer Mode
3. Click `Load unpacked`
4. Select this repository root
5. Open `https://chatgpt.com/` or `https://chat.openai.com/`

## How To Use

- Click a prompt title in the TOC to jump to that exchange
- Click an answer heading to jump inside the answer
- Use `Collapse all` to show only prompt rows
- Use `Expand all` to open all groups and heading branches
- Drag the panel by its header to move it
- Click the round header toggle button to minimize the whole panel

## Development

- Main extension files:
  - `manifest.json`
  - `code.js`
  - `code.css`
- After changes, reload the unpacked extension from `chrome://extensions`

## Releases

A GitHub Actions workflow is included at `.github/workflows/release.yml`.

Release flow:

1. Update `manifest.json` version
2. Commit and push `main`
3. Create a tag like `v3.0.1`
4. Push the tag with `git push origin v3.0.1`

On tag push, GitHub Actions will package the extension as a zip and attach it to a GitHub Release.

## Notes

- This repo currently automates GitHub zip releases only
- Chrome Web Store publishing is not automated here because it would require store credentials and additional secrets
