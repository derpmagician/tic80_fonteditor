---
name: copilot-instructions
# Optional: set applyTo narrower if you add many repos in one org
applyTo: "**/*.js"
description: "Project-specific Copilot Desktop instructions for Tic-80 font editor maintenance and enhancements."
---

# Tic-80 Font Editor (fonteditor)

This repository contains a Tic-80 font editing demo script in `fonteditor.js` (8x8 pixel glyph design, ligature support and preview rendering). Use this workspace instruction to guide Copilot for feature requests, bug fixes, and cleanups.

## Key files

- `fonteditor.js`: single source file. Main loop `TIC()` handles input, brush editing, visualization, ligature parsing, and JSON export.
- `modern-font-requirements.md`: likely design / feature requirements for font rendering or constraints.
- `tic80_man.md`: may include user notes or TIC-80 platform references.

## What we expect from Copilot

1. **Code improvements**
   - Make editor behavior robust (clear/undo, selection, preserved state across characters)
   - Enhance export format for read/write compatibility with Tic-80 font data (e.g. binary tile encoding, JSON + named glyph array)
   - Add UI affordances inside `TIC()` (current char index, grid overlays, clear all, invert, save/load)

2. **Bug fixes**
   - Keep `index` in range when char set changes
   - Avoid silently skipping missing glyphs in `drawText()`/`drawChar()`; fallback to placeholder (e.g. `?`)
   - Validate `ligatures` keys to not conflict with single char indices

3. **Documentation**
   - Add README usage instructions: load in Tic-80, edit glyphs, arrow keys, export via `E` key, import support when added.
   - Document keyboard/mouse controls and data format.

## Copilot prompt patterns (examples)

- "Add undo/redo to Tic-80 font editor grid editing in `fonteditor.js`."
- "Convert current per-pixel array glyph store to typed `Uint8Array` bitmask in `fonteditor.js`."
- "Implement save/load font JSON to Tic-80 cart memory for `fonteditor.js`."

## Quick run/test guidance

Tic-80 scripts are tested by loading in the Tic-80 app:
- Start Tic-80
- `LOAD fonteditor.js`
- Press `RUN` (or `CTRL+R`)
- Use mouse to draw in 8x8 cell grid
- Press left/right keys to switch glyph
- Press `E` to export font JSON via `trace()` output

## Auto-generated best practices

- Avoid globals where a function-local or object can encapsulate state.
- Prefer naming clarity (`CURRENT_CHAR_KEY`, `glpyhIndex`) and avoid comments-only logic.

---

> For missing automation docs, ask the user if they want tests under `tictest/` or a CLI converter script.
