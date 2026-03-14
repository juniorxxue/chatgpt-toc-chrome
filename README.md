# chatgpt-toc-chrome

Chrome extension for `chatgpt.com` / `chat.openai.com` that adds a compact, draggable table of contents for ChatGPT conversations.

Disclaimer: This repository includes AI-assisted code. Review and test it yourself before distributing it.

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

## Install

1. Open `chrome://extensions`
2. Enable Developer Mode
3. Click `Load unpacked`
4. Select this repository root
5. Open `https://chatgpt.com/` or `https://chat.openai.com/`
