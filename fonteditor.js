// title:   game title
// author:  game developer, email, etc.
// desc:    short description
// site:    website link
// license: MIT License (change this to your license of choice)
// version: 0.1
// script:  js

const CELL = 10;
const GRID = 8;

// Teclas
const KEY_A = 1;
const KEY_P = 16;
const KEY_S = 19;
const KEY_UP = 58;
const KEY_DOWN = 59;
const KEY_LEFT = 60;
const KEY_RIGHT = 61;

// Estado
let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" +
  "-=_[]\\;:'`,./";
let index = 0;
let cursorX = 0;
let cursorY = 0;
let mousePrevLeft = false;
let lastInputWasMouse = false;
let mouseAnimationFrame = 0; // contador de frames para animar iconos

// UI botones de cambio de carácter
const UI_CHAR_Y = 10;
const UI_CHAR_SPACING = 30;
const UI_CONTROLS_X = GRID * CELL + 2;
const UI_CHARGROUP_LABEL = { x: UI_CONTROLS_X, y: UI_CHAR_Y, w: 34, h: 12 };
const UI_PREV_BUTTON = { x: UI_CONTROLS_X, y: UI_CHAR_Y, w: 10, h: 10 };
const UI_CHAR_LABEL = { x: UI_CONTROLS_X + 14, y: UI_CHAR_Y + 2 };
const UI_NEXT_BUTTON = { x: UI_CONTROLS_X + 24, y: UI_CHAR_Y, w: 10, h: 10 };

// UI preview
const UI_PREVIEW_X = 120;
const UI_PREVIEW_Y = UI_CHAR_Y- 8;

// Sprites de mouse (4 tiles 8x8 cada uno, valores directos del sprite tab)
const MOUSE_LMB_SPRITES = [258, 257, 274, 273];
const MOUSE_RMB_SPRITES = [256, 259, 272, 275];

// Velocidad de animación de iconos de mouse (en ticks)
const MOUSE_ICON_TOGGLE_FRAMES = 24; // más lento (24 ticks ≈ 0.8s a 30fps)

// Animación de columnas (LMB columna izquierda; RMB columna derecha)
function getMouseIconPhase() {
  return Math.floor(mouseAnimationFrame / MOUSE_ICON_TOGGLE_FRAMES) % 2;
}

function getLmbSprites() {
  if (getMouseIconPhase() === 1) {
    // Alterna la primera columna a 0/16 en sprite tab -> 256/272
    return [256, 257, 272, 273];
  }
  return MOUSE_LMB_SPRITES;
}

function getRmbSprites() {
  if (getMouseIconPhase() === 1) {
    // Alterna la segunda columna a 1/17 en sprite tab -> 257/273
    return [256, 257, 272, 273];
  }
  return MOUSE_RMB_SPRITES;
}

// Fuente
let font = {};
let ligatures = {
  "=>": "ARROW",
  "<=": "LE",
  ">=": "GE",
  "==": "EQ",
  "!=": "NE",
  "&&": "AND",
  "||": "OR",
  "ch": "CH",
  "ll": "LL",
  "rr": "RR",
  "qu": "QU",
  "gu": "GU"
};

// Inicializar caracteres
function initFont() {
  for (let c of chars) {
    font[c] = createEmptyChar();
  }

  for (let key in ligatures) {
    let lig = ligatures[key];
    if (!font[lig]) {
      font[lig] = createEmptyChar();
    }
  }
}

function createEmptyChar() {
  let arr = [];
  for (let y = 0; y < GRID; y++) {
    arr[y] = [];
    for (let x = 0; x < GRID; x++) {
      arr[y][x] = 0;
    }
  }
  return arr;
}

initFont();

// ======================
// LOOP PRINCIPAL
// ======================
function TIC() {
  cls(0);

  mouseAnimationFrame += 1;

  handleInput();
  drawEditor();
  drawPreview();
}

// ======================
// HELPERS
// ======================
function getMouse() {
  let m = mouse();
  if (!m) return {x: -1, y: -1, left: false, right: false, middle: false};
  if (typeof m.x === 'number' && typeof m.y === 'number') {
    return m;
  }
  if (Array.isArray(m) && m.length >= 2) {
    return {
      x: m[0],
      y: m[1],
      left: m[2] || false,
      middle: m[3] || false,
      right: m[4] || false,
      scrollx: m[5] || 0,
      scrolly: m[6] || 0
    };
  }
  return {x: -1, y: -1, left: false, right: false, middle: false};
}

// ======================
// INPUT
// ======================
function handleInput() {
  let m = getMouse();
  let hasMouse = m && m.x >= 0 && m.y >= 0;
  let mouseOverGrid = hasMouse && m.x < GRID * CELL && m.y < GRID * CELL;

  let current = getCurrentChar();
  if (!current) {
    // En caso de que el carácter actual no esté en la tabla, crear uno
    let key = getCurrentKey();
    current = createEmptyChar();
    font[key] = current;
  }

  let keyPrev = keyp(KEY_A);
  let keyNext = keyp(KEY_S);
  let gamepadCharPrev = btnp(7); // Y
  let gamepadCharNext = btnp(6); // X

  // UI + teclado + gamepad de cambio de carácter (siempre disponible)
  let uiPrev = false;
  let uiNext = false;
  // UI button clicks deben funcionar aunque el mouse esté fuera del grid.
  uiPrev = m.x >= UI_PREV_BUTTON.x && m.x < (UI_PREV_BUTTON.x + UI_PREV_BUTTON.w) && m.y >= UI_PREV_BUTTON.y && m.y < (UI_PREV_BUTTON.y + UI_PREV_BUTTON.h);
  uiNext = m.x >= UI_NEXT_BUTTON.x && m.x < (UI_NEXT_BUTTON.x + UI_NEXT_BUTTON.w) && m.y >= UI_NEXT_BUTTON.y && m.y < (UI_NEXT_BUTTON.y + UI_NEXT_BUTTON.h);



  let changed = false;
  if (m.left && !mousePrevLeft && uiPrev) {
    index = (index + chars.length - 1) % chars.length;
    changed = true;
    lastInputWasMouse = true;
  } else if (m.left && !mousePrevLeft && uiNext) {
    index = (index + 1) % chars.length;
    changed = true;
    lastInputWasMouse = true;
  } else if (keyPrev) {
    index = (index + chars.length - 1) % chars.length;
    changed = true;
    lastInputWasMouse = false;
  } else if (keyNext) {
    index = (index + 1) % chars.length;
    changed = true;
    lastInputWasMouse = false;
  } else if (gamepadCharPrev) {
    index = (index + chars.length - 1) % chars.length;
    changed = true;
    lastInputWasMouse = false;
  } else if (gamepadCharNext) {
    index = (index + 1) % chars.length;
    changed = true;
    lastInputWasMouse = false;
  }

  if (mouseOverGrid) {
    let gx = Math.floor(m.x / CELL);
    let gy = Math.floor(m.y / CELL);


    if (gx >= 0 && gx < GRID && gy >= 0 && gy < GRID) {
      if (m.left) {
        current[gy][gx] = 1; // pintar while hold
      } else if (m.right) {
        current[gy][gx] = 0; // borrar while hold
      }
      // Mantener cursor en el último píxel válido dentro del editor
      cursorX = gx;
      cursorY = gy;
    } else {
      // Si el mouse sale del área, no alteramos cursorX/cursorY.
      // Esto evita que el cursor se mueva a coordenadas "recortadas"
      // cuando el usuario mueve el puntero fuera del grid.
    }
  }

  // Navegación teclado y gamepad siempre disponible
  if (btnp(0) || keyp(KEY_UP)) cursorY = (cursorY + GRID - 1) % GRID; // arriba / flecha arriba
  if (btnp(1) || keyp(KEY_DOWN)) cursorY = (cursorY + 1) % GRID; // abajo / flecha abajo
  if (btnp(3) || keyp(KEY_RIGHT)) cursorX = (cursorX + 1) % GRID; // derecha / flecha derecha
  if (btnp(2) || keyp(KEY_LEFT)) cursorX = (cursorX + GRID - 1) % GRID; // izquierda / flecha izquierda

  cursorX = Math.max(0, Math.min(GRID - 1, cursorX));
  cursorY = Math.max(0, Math.min(GRID - 1, cursorY));

  // Edición con teclado siempre disponible
  // En TIC-80, las teclas son keycodes 1..94 (A=1, B=2, ..., X=24, Z=26)
  if (keyp(26)) { // Z = alterna pixel en cursor
    current[cursorY][cursorX] = current[cursorY][cursorX] ? 0 : 1;
  }
  if (keyp(24)) { // X = borra pixel en cursor
    current[cursorY][cursorX] = 0;
  }

  // El cambio de carácter ya se procesa antes (UI mouse + A/S + X/Y gamepad).
  if (index < 0) index = chars.length - 1;
  if (index >= chars.length) index = 0;

  // Export
  if (keyp(KEY_P) || keyp(112)) { // P
    trace("DEBUG P key pressed: export triggered", 12);
    exportFont();
  }

  mousePrevLeft = m.left;
}

// ======================
// EDITOR
// ======================
function drawEditor() {
  let current = getCurrentChar();
  let m = getMouse();
  let hasMouse = m && m.x >= 0 && m.y >= 0;
  let mouseOverGrid = hasMouse && m.x < GRID * CELL && m.y < GRID * CELL;
  let hoverX = mouseOverGrid ? Math.floor(m.x / CELL) : -1;
  let hoverY = mouseOverGrid ? Math.floor(m.y / CELL) : -1;

  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      let color = current[y][x] ? 12 : 1;
      rect(x * CELL, y * CELL, CELL, CELL, color);
      rectb(x * CELL, y * CELL, CELL, CELL, 0);

      if (mouseOverGrid && x === hoverX && y === hoverY) {
        rectb(x * CELL, y * CELL, CELL, CELL, 14);
      } else if (!mouseOverGrid && !lastInputWasMouse && x === cursorX && y === cursorY) {
        rectb(x * CELL, y * CELL, CELL, CELL, 14);
      }
    }
  }

  // Dibujar ícono de botón de mouse en lugar de texto "LMB"/"RMB".
  drawMouseButtonIcon(getLmbSprites(), 0, 80);
  print("paint", 20, 90, 12, false, 1, true);

  drawMouseButtonIcon(getRmbSprites(), 0, 97);
  print("erase", 20, 107, 12, false, 1, true);

  print("P export", 0, 130, 12, false, 1, true);

  // Botones de UI (click → cambio de character)
  rect(UI_PREV_BUTTON.x, UI_PREV_BUTTON.y, UI_PREV_BUTTON.w, UI_PREV_BUTTON.h, 2);
  print("<", UI_PREV_BUTTON.x + 4, UI_PREV_BUTTON.y + 4, 12, false, 1, true);

  rect(UI_NEXT_BUTTON.x, UI_NEXT_BUTTON.y, UI_NEXT_BUTTON.w, UI_NEXT_BUTTON.h, 2);
  print(">", UI_NEXT_BUTTON.x + 4, UI_NEXT_BUTTON.y + 4, 12, false, 1, true);

  print("CHAR:    PREVIEW:", UI_CHARGROUP_LABEL.x, UI_CHARGROUP_LABEL.y - 8, 12, false, 1, true);
  // Label del caracter central (ordenado con constantes)
  let label = getCurrentKey();
  print(label, UI_CHAR_LABEL.x, UI_CHAR_LABEL.y, 12, false, 1, true);
  print("Cursor: " + cursorX + "," + cursorY + " (A/S change char, Z toggle pixel, X erase pixel)", 0, 120, 12, false, 1, true);


}

// ======================
// PREVIEW
// ======================
function drawPreview() {
  // Mostrar todos los caracteres básicos en varias filas para no salirse del borde.
  let previewChars = chars;
  let charsPerLine = 12;
  let lineY = UI_PREVIEW_Y; // alineado con UI_CHAR_Y

  lineY += CELL; // reducir espaciado

  for (let start = 0; start < previewChars.length; start += charsPerLine) {
    let slice = previewChars.slice(start, start + charsPerLine);
    drawText(slice, UI_PREVIEW_X, lineY);
    lineY += CELL + 2; // menos separación entre líneas
  }

  // Mostrar ligaturas en una nueva línea tras las letras.
  let ligKeys = Object.keys(ligatures);
  if (ligKeys.length) {
    lineY += CELL + 4;
    print("LIGS:", UI_PREVIEW_X, lineY - 8, 7, false, 1, true);

    // muestra ligatura base + glyph representado
    let LigDrawX = UI_PREVIEW_X;
    let LigDrawY = lineY;
    for (let i = 0; i < ligKeys.length; i++) {
      let pair = ligKeys[i];
      let glyph = ligatures[pair];

      // dibujar la secuencia y el nombre
      print(pair, LigDrawX, LigDrawY, 12, false, 1, true);
      drawChar(glyph, LigDrawX + 30, LigDrawY);

      LigDrawY += CELL + 2;
      if (LigDrawY > UI_PREVIEW_Y + 120) {
        LigDrawY = lineY;
        LigDrawX += 80;
      }
    }
  }
}

// ======================
// RENDER TEXTO
// ======================
function drawText(text, x, y) {

  let i = 0;

  while (i < text.length) {

    let rawPair = text[i] + (text[i + 1] || "");
    let ligKey = rawPair;

    if (!ligatures[ligKey]) {
      ligKey = rawPair.toLowerCase();
    }

    if (ligatures[ligKey]) {
      drawChar(ligatures[ligKey], x, y);
      i += 2;
    } else {
      drawChar(text[i], x, y);
      i++;
    }

    x += CELL; // usa el tamaño de celda para espaciado consistente
  }
}

function drawChar(c, x, y) {
  let data = font[c];

  if (!data) {
    // No dibujar celdas de fallback para evitar cubrir letras en preview.
    // Se puede usar un placeholder más suave si se desea:
    // rectb(x, y, GRID, GRID, 1);
    return;
  }

  for (let yy = 0; yy < GRID; yy++) {
    for (let xx = 0; xx < GRID; xx++) {
      if (data[yy][xx]) {
        rect(x + xx, y + yy, 1, 1, 12);
      }
    }
  }
}

// ======================
// HELPERS
// ======================
function getCurrentKey() {
  return chars[index];
}

function getCurrentChar() {
  return font[getCurrentKey()];
}

function drawMouseButtonIcon(spriteIndexes, x, y) {
  // coloca el icono de 2x2 sprites (8x8 cada uno)
  spr(spriteIndexes[0], x, y);
  spr(spriteIndexes[1], x + 8, y);
  spr(spriteIndexes[2], x, y + 8);
  spr(spriteIndexes[3], x + 8, y + 8);
}

// ======================
// EXPORT
// ======================
function exportFont() {
  let data = JSON.stringify({
    font: font,
    ligatures: ligatures
  });

  trace(data);
}

// <TILES>
// 000:0000077700077007007000070700000707000007700000077000007070000700
// 001:7770000070077000700007007000007070000070700000070700000700700007
// 002:0000077700077667007666670766666707666667766666677666667076666700
// 003:7770000076677000766667007666667076666670766666670766666700766667
// 016:7000070070000700700007007000007070000070700000077000000707777777
// 017:0070000700700007007000070700000707000007700000077000000777777770
// 018:7666670076666700766667007666667076666670766666677666666707777777
// 019:0076666700766667007666670766666707666667766666677666666777777770
// </TILES>

// <SPRITES>
// 000:0000077700077007007000070700000707000007700000077000007070000700
// 001:7770000070077000700007007000007070000070700000070700000700700007
// 002:0000077700077667007666670766666707666667766666677666667076666700
// 003:7770000076677000766667007666667076666670766666670766666700766667
// 016:7000070070000700700007007000007070000070700000077000000707777777
// 017:0070000700700007007000070700000707000007700000077000000777777770
// 018:7666670076666700766667007666667076666670766666677666666707777777
// 019:0076666700766667007666670766666707666667766666677666666777777770
// </SPRITES>

// <WAVES>
// 000:00000000ffffffff00000000ffffffff
// 001:0123456789abcdeffedcba9876543210
// 002:0123456789abcdef0123456789abcdef
// </WAVES>

// <SFX>
// 000:000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000304000000000
// </SFX>

// <TRACKS>
// 000:100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
// </TRACKS>

// <PALETTE>
// 000:1a1c2c5d275db13e53ef7d57ffcd75a7f07038b76425717929366f3b5dc941a6f673eff7f4f4f494b0c2566c86333c57
// </PALETTE>

