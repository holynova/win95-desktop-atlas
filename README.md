# Win95 Desktop Atlas

[中文说明](README.zh-CN.md) · [GitHub repository](https://github.com/holynova/win95-desktop-atlas) · [Cloudflare demo](https://win95-desktop-atlas.xiaosang.cc/)

Ten editorial and interface layouts share the window chrome of Windows 95. The index presents real previews and a comparison of reading order, suitable material and limitations. Pick a layout by what the reader needs to do.

![The layout atlas with previews of contrasting compositions](assets/screenshot.png)

| Reading task | Examples |
| --- | --- |
| Read in sequence | Narrow-column field essay, timestamped postal log |
| Look closely | Typographic poster, asymmetric photo wall, paired architectural drawings |
| Connect pictures and words | Print magazine spread, collectible stamp cards, annotated star map |
| Compare and operate | Ceramics matrix, master–detail audio library |

Compare the same printed material in the poster and magazine. Visit the stamp catalogue and its production timeline to see how a collection becomes a story. Each example includes layout notes.

## Run locally

Requires Node.js for checks and Python 3 for the local server. No application dependencies.

```sh
npm run check
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000`. All samples, photos and audio are served from `dist/assets`. The city photographs come from Unsplash.

## Publish

Cloudflare Pages builds the GitHub production branch **main**, runs `npm run check`, and serves `dist/`. After committing a change, publish with `git push origin main`.

![QR code for the Cloudflare demo](assets/qr.png)
