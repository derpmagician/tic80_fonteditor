// title:   game title
// author:  game developer, email, etc.
// desc:    short description
// site:    website link
// license: MIT License (change this to your license of choice)
// version: 0.1
// script:  js

// layout
const COL_1 = 10;
const COL_2 = 83;

const BG_COLOR = 1;
const MAIN_COLOR = 14;
const SECONDARY_COLOR = 10;

// Grid
const CELL = 10;
const GRID = 8;
const GRID_COLOR = MAIN_COLOR;
const GRID_CURSOR_COLOR = SECONDARY_COLOR;

const TITLE_TEXT_COLOR = SECONDARY_COLOR;
const COMMON_TEXT_COLOR = MAIN_COLOR;

// Teclas
const KEY_A = 1;
const KEY_H = 8;
const KEY_P = 16;
const KEY_CTRL = 63;
const KEY_S = 19;
const KEY_T = 20;
const KEY_BACKSPACE = 14;
const KEY_DELETE = 127;
const KEY_SPACE = 57;
const KEY_MINUS = 37;
const KEY_EQUALS = 38;
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
let showHelp = false; // mostrar modal de ayuda

let typedText = "";
let textInputMode = false;

// ui botones de preview
const UI_PREVIEW_LABEL = { x: COL_2, y: 1, w: 50, h: 10 };

// UI botones de cambio de carácter
const UI_CHAR_Y = GRID * CELL + 2; // debajo del grid (8*10=80 -> +2)
const UI_CHAR_SPACING = 30;

const UI_CONTROLS_X = 20;
const UI_CHARGROUP_LABEL = { x: UI_CONTROLS_X - 20, y: UI_CHAR_Y + 10, w: 34, h: 12 };
const UI_PREV_BUTTON = { x: UI_CONTROLS_X, y: UI_CHAR_Y, w: 10, h: 10 };
const UI_CHAR_LABEL = { x: UI_CONTROLS_X + 14, y: UI_CHAR_Y + 2 };
const UI_NEXT_BUTTON = { x: UI_CONTROLS_X + 24, y: UI_CHAR_Y, w: 10, h: 10 };

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
  if (!showHelp) {
    drawPreview();
  }
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

function keyCodeToChar(keyCode) {
  const map = {
    // Alfabeto
    1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E', 6: 'F', 7: 'G', 8: 'H', 9: 'I',
    10: 'J', 11: 'K', 12: 'L', 13: 'M', 14: 'N', 15: 'O', 16: 'P', 17: 'Q', 18: 'R',
    19: 'S', 20: 'T', 21: 'U', 22: 'V', 23: 'W', 24: 'X', 25: 'Y', 26: 'Z',
    // Números
    27: '0', 28: '1', 29: '2', 30: '3', 31: '4', 32: '5', 33: '6', 34: '7',
    35: '8', 36: '9',
    // Puntuación / símbolos imprimibles
    37: '-', 38: '=', 39: '[', 40: ']', 41: '\\', 42: ';', 43: "'", 44: '`',
    45: ',', 46: '.', 47: '/',
    // Espacio
    57: ' '
  };

  return map[keyCode] || "";
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

  let keyPrev = !textInputMode && keyp(KEY_A);
  let keyNext = !textInputMode && keyp(KEY_S);
  let gamepadCharPrev = !textInputMode && btnp(7); // Y
  let gamepadCharNext = !textInputMode && btnp(6); // X

  let totalOptions = getAllEditableKeys().length;

  // UI + teclado + gamepad de cambio de carácter (para modo EDIT)
  let uiPrev = false;
  let uiNext = false;
  // UI button clicks deben funcionar aunque el mouse esté fuera del grid.
  uiPrev = !textInputMode && m.x >= UI_PREV_BUTTON.x && m.x < (UI_PREV_BUTTON.x + UI_PREV_BUTTON.w) && m.y >= UI_PREV_BUTTON.y && m.y < (UI_PREV_BUTTON.y + UI_PREV_BUTTON.h);
  uiNext = !textInputMode && m.x >= UI_NEXT_BUTTON.x && m.x < (UI_NEXT_BUTTON.x + UI_NEXT_BUTTON.w) && m.y >= UI_NEXT_BUTTON.y && m.y < (UI_NEXT_BUTTON.y + UI_NEXT_BUTTON.h);



  let changed = false;
  if (m.left && !mousePrevLeft && uiPrev) {
    index = (index + totalOptions - 1) % totalOptions;
    changed = true;
    lastInputWasMouse = true;
  } else if (m.left && !mousePrevLeft && uiNext) {
    index = (index + 1) % totalOptions;
    changed = true;
    lastInputWasMouse = true;
  } else if (keyPrev) {
    index = (index + totalOptions - 1) % totalOptions;
    changed = true;
    lastInputWasMouse = false;
  } else if (keyNext) {
    index = (index + 1) % totalOptions;
    changed = true;
    lastInputWasMouse = false;
  } else if (gamepadCharPrev) {
    index = (index + totalOptions - 1) % totalOptions;
    changed = true;
    lastInputWasMouse = false;
  } else if (gamepadCharNext) {
    index = (index + 1) % totalOptions;
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
  if (index < 0) index = totalOptions - 1;
  if (index >= totalOptions) index = 0;

  // Toggle de modo texto (mientras se edita texto no se cambia carácter con A/S).
  if (keyp(KEY_T)) {
    textInputMode = !textInputMode;
  }

  if (textInputMode) {
    // BACKSPACE / DELETE
    if (keyp(KEY_BACKSPACE) || keyp(KEY_DELETE)) {
      typedText = typedText.slice(0, -1);
    }

    // Capturar cualquiera tecla imprimible en el modo texto
    for (let code = 1; code <= 94; code++) {
      if (keyp(code)) {
        let ch = keyCodeToChar(code);
        if (ch) {
          typedText += ch;
        }
      }
    }
  }

  // DELETE en modo normal deshace el carácter seleccionado (borrar celdas)
  if (!textInputMode && keyp(KEY_DELETE)) {
    let current = getCurrentChar();
    for (let yy = 0; yy < GRID; yy++) {
      for (let xx = 0; xx < GRID; xx++) {
        current[yy][xx] = 0;
      }
    }
  }

  // Ayuda modal (Ctrl + H)
  if (keyp(KEY_H) && key(KEY_CTRL)) {
    showHelp = !showHelp;
  }

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
  if (showHelp) {
    drawHelpModal();
    return;
  }

  let current = getCurrentChar();
  if (!current) {
    current = createEmptyChar();
  }
  let m = getMouse();
  let hasMouse = m && m.x >= 0 && m.y >= 0;
  let mouseOverGrid = hasMouse && m.x < GRID * CELL && m.y < GRID * CELL;
  let hoverX = mouseOverGrid ? Math.floor(m.x / CELL) : -1;
  let hoverY = mouseOverGrid ? Math.floor(m.y / CELL) : -1;

  for (let y = 0; y < GRID; y++) {
    for (let x = 0; x < GRID; x++) {
      let color = current[y][x] ? 12 : GRID_COLOR;
      rect(x * CELL, y * CELL, CELL, CELL, color);
      rectb(x * CELL, y * CELL, CELL, CELL, 0);

      if (mouseOverGrid && x === hoverX && y === hoverY) {
        rectb(x * CELL, y * CELL, CELL, CELL, GRID_CURSOR_COLOR);
      } else if (!mouseOverGrid && !lastInputWasMouse && x === cursorX && y === cursorY) {
        rectb(x * CELL, y * CELL, CELL, CELL, GRID_CURSOR_COLOR);
      }
    }
  }

  const UI_INFO_Y = UI_CHAR_Y + 16;
  print("Ctrl + H for help", 0, UI_INFO_Y, COMMON_TEXT_COLOR, false, 1, true);
  print("Ctrl + T: toggle text input", 0, UI_INFO_Y + 10, COMMON_TEXT_COLOR, false, 1, true);
  print("Mode: " + (textInputMode ? "TEXT" : "EDIT"), 0, UI_INFO_Y + 18, COMMON_TEXT_COLOR, false, 1, true);

  // Texto con fuente custom creada
  const typedTextY = UI_INFO_Y + 30;
  if (typedText.length > 0) {
    drawText(typedText, 0, typedTextY);
  } else {
    print("(enter text in TEXT mode)", 0, typedTextY, COMMON_TEXT_COLOR, false, 1, true);
  }

  // Botones de UI (click → cambio de character)
  rectb(UI_PREV_BUTTON.x, UI_PREV_BUTTON.y, UI_PREV_BUTTON.w, UI_PREV_BUTTON.h, SECONDARY_COLOR);
  print("<", UI_PREV_BUTTON.x + 4, UI_PREV_BUTTON.y + 2, 12, false, 1, true);

  rectb(UI_NEXT_BUTTON.x, UI_NEXT_BUTTON.y, UI_NEXT_BUTTON.w, UI_NEXT_BUTTON.h, SECONDARY_COLOR);
  print(">", UI_NEXT_BUTTON.x + 4, UI_NEXT_BUTTON.y + 2, 12, false, 1, true);

  print("CHAR:", UI_CHARGROUP_LABEL.x, UI_CHARGROUP_LABEL.y - 8, TITLE_TEXT_COLOR, false, 1, true);
  // Label del caracter central (ordenado con constantes)
  let label = getCurrentKey();
  print("PREVIEW:", UI_PREVIEW_LABEL.x, UI_PREVIEW_LABEL.y, TITLE_TEXT_COLOR, false, 1, true);

  print(label, UI_CHAR_LABEL.x, UI_CHAR_LABEL.y, 12, false, 1, true);

}

function drawHelpModal() {
  // Fondo semitransparente y panel central
  rect(0, 0, 240, 136, 0);
  rect(8, 8, 224, 120, 0);
  rectb(8, 8, 224, 120, 1);

  print("HELP (Ctrl+H para cerrar)", 16, 14, 12, false, 1, true);
  print("A/S: cambiar caracter", 16, 24, 12, false, 1, true);
  print("Z: alternar pixel", 16, 32, 12, false, 1, true);
  print("X: borrar pixel", 16, 40, 12, false, 1, true);
  print("Ctrl + T: toggle text input", 16, 48, 12, false, 1, true);
  print("BACKSPACE/DELETE: borrar texto", 16, 56, 12, false, 1, true);
  print("DELETE (modo edit): limpiar char", 16, 64, 12, false, 1, true);
  print("P: exportar fuente", 16, 72, 12, false, 1, true);
  print("Ctrl+H: mostrar/ocultar ayuda", 16, 80, 12, false, 1, true);

  // Iconos LMB/RMB y explicación
  print("LMB: pinta", 16, 88, 12, false, 1, true);
  drawMouseButtonIcon(getLmbSprites(), 90, 80);
  print("RMB: borra", 16, 96, 12, false, 1, true);
  drawMouseButtonIcon(getRmbSprites(), 90, 96);

  print("Ppal: cambia ligaturas con A/S.", 16, 116, 12, false, 1, true);
}

// ======================
// PREVIEW
// ======================
function drawPreview() {
  // Mostrar todos los caracteres básicos en varias filas para no salirse del borde.
  let previewChars = chars;
  let charsPerLine = 16;
  let lineY = 0; // alineado con UI_CHAR_Y

  lineY += CELL; // reducir espaciado

  for (let start = 0; start < previewChars.length; start += charsPerLine) {
    let slice = previewChars.slice(start, start + charsPerLine);
    drawText(slice, COL_2, lineY);
    lineY += CELL + 2; // menos separación entre líneas
  }

  // Mostrar ligaturas en una nueva línea tras las letras, uno al lado del otro.
  let ligKeys = Object.keys(ligatures);
  if (ligKeys.length) {
    lineY += CELL + 4;
    print("LIGS:", COL_2, 60, TITLE_TEXT_COLOR, false, 1, true);

    let ligText = ligKeys.join("");
    drawText(ligText, COL_2, 66);
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
function getAllEditableKeys() {
  // chars es una cadena; convertimos a array para que cada carácter sea una entrada
  // y las ligaturas sean entradas completas ("=>", "<=", etc.)
  return chars.split("").concat(Object.keys(ligatures));
}

function getCurrentKey() {
  let all = getAllEditableKeys();
  if (index < 0 || index >= all.length) {
    index = 0;
  }
  let key = all[index] || "";
  // Evitar key vacío y/o index inválido
  if (!key && chars.length > 0) {
    index = 0;
    key = chars[0];
  }
  return key;
}

function getCurrentChar() {
  let key = getCurrentKey();
  if (!key) {
    key = chars[0];
  }
  let targetKey = ligatures[key] ? ligatures[key] : key;
  if (!font[targetKey]) {
    font[targetKey] = createEmptyChar();
  }
  return font[targetKey];
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

