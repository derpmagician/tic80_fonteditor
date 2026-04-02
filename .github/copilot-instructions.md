# Project Guidelines

## Overview

TIC-80 pixel font editor — a single-file cartridge (`fonteditor.js`) that runs inside the TIC-80 fantasy console. Lets you draw 8×8 pixel characters, define ligatures, preview text, and export font data as JSON.

## TIC-80 Runtime

- **Display**: 240×136 pixels, 16-color palette
- **Language**: JavaScript (TIC-80 JS runtime, not browser JS)
- **No build step**: `fonteditor.js` IS the cartridge — load and run directly in TIC-80
- **Run**: Open TIC-80 → `load fonteditor` → `run` (or Ctrl+R)
- **API reference**: See [tic80_man.md](../tic80_man.md) for all available functions

## Key Conventions

### Code Structure

The file follows a strict section order marked with `// ========` banners:
1. Constants (layout, colors, keys)
2. State variables
3. UI constants
4. Sprite/animation helpers
5. Font data + ligatures
6. `TIC()` — main loop (called at 60fps)
7. Input handling (`handleInput`)
8. Editor drawing (`drawEditor`, `drawHelpModal`)
9. Preview drawing (`drawPreview`)
10. Text rendering (`drawText`, `drawChar`)
11. Helpers (`getAllEditableKeys`, `getCurrentKey`, `getCurrentChar`)
12. Export (`exportFont`)
13. TIC-80 asset blocks (`<TILES>`, `<SPRITES>`, `<WAVES>`, etc.) — **never remove or reorder**

### Input System

- TIC-80 key codes differ from browser codes — see `tic80_man.md` Key IDs table
- `keyp(code)` = key just pressed this frame; `key(code)` = key held down
- `btn/btnp` = gamepad buttons (0–7 for P1)
- Modifier combos use `keyp(KEY) && key(KEY_CTRL)` pattern
- Current shortcuts: `Ctrl+H` help, `Ctrl+T` text mode, `Ctrl+P` export
- **Two modes**: EDIT (draw pixels, A/S change char) and TEXT (type preview text). Character switching is disabled in TEXT mode.

### Mouse Handling

- `mouse()` returns vary by TIC-80 version — always use the `getMouse()` wrapper
- Track `mousePrevLeft` for click-edge detection (not hold)

### Font Data

- Each character is an 8×8 array of 0/1 (off/on pixels)
- Ligatures map multi-char sequences to single glyph keys (e.g., `"ch"` → `"CH"`)
- `chars` string defines the editable character set; ligature keys are appended to the editable list

### Drawing

- Use `rect` for filled areas, `rectb` for borders
- Use `print(text, x, y, color, fixed, scale, smallfont)` — TIC-80's built-in font
- Custom font rendering goes through `drawText` → `drawChar` (reads `font[]` data)
- Color 12 = active/filled pixels, color 0 = background

## Pitfalls

- **Asset blocks at EOF**: The `// <TILES>` ... `// </TILES>` blocks are parsed by TIC-80. Never alter their format or move them away from the end of the file.
- **`KEY_DELETE` code is 127** in this project (non-standard TIC-80 mapping) — verify against `tic80_man.md` if adding new key bindings.
- **No `console.log`**: Use `trace(msg, color)` for debug output in TIC-80.
- **No ES modules / imports**: Everything lives in one global scope inside the cartridge.

## Related Docs

- [tic80_man.md](../tic80_man.md) — TIC-80 API, RAM layout, key/button IDs
- [modern-font-requirements.md](../modern-font-requirements.md) — Long-term design goals for the font
