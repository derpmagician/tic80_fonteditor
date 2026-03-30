# Modern Font Requirements (Tipografía moderna y profesional)

Este documento describe todos los elementos que debe tener una fuente para considerarse moderna y profesional: ligaduras, kerning, variable width, soporte internacional, OpenType y más.

## 1. Definición y alcance
- Legibilidad en textos largos y también en display.
- Consistencia en estilo gráfico y espaciado.
- Compatibilidad con sistemas actuales (web, escritorio, apps).
- Preparada para internacionalización y diversos scripts.

## 2. Métricas base
- Ascender / Descender.
- CapHeight / xHeight.
- LineGap.
- em y unitsPerEm bien calibrados (normalmente 1000 o 2048).
- Indicadores de altura uniforme entre pesos.

## 3. Espaciado y kerning
- Sidebearings coherentes (izquierda/derecha por glifo).
- Kerning amplio y configurable con GPOS.
- Pares clave: AV, AT, To, WA, Yo, Ta, etc.
- Kerning responsive; opciones ópticas para differentes tamaños.
- Ajustes de espaciado óptico para puntuación y guiones.

## 4. Ligaduras
- Ligaduras estándar: `fi`, `fl`, `ff`, `ffi`, `ffl`.
- Ligaduras discrecionales: `st`, `ct`, etc.
- OpenType features:
  - `liga` (standard ligatures)
  - `dlig` (discretionary ligatures)
  - `hlig` (historic ligatures)
- Compatibilidad con motores de renderizado comunes.

## 5. Alternativas y conjuntos estilísticos
- features OpenType: `ss01`..`ss20` (stylistic sets), `calt`, `salt`, `swsh`, `hist`.
- Variantes de caracteres con mismo ancho o similares.
- Opciones con alternantes de mayúsculas y numerales.

## 6. Pesos y familia
- Mínimo: Thin/Hairline, Light, Regular, Medium/Book, Bold, Black/Heavy.
- Opcional: ExtraLight, SemiBold, ExtraBold.
- Transiciones visuales suaves entre pesos.

## 7. Variable Font
- Ejes recomendados:
  - `wght` (100–900)
  - `wdth` (condensado–expandido)
  - `opsz` (optical size)
  - `ital` (italics) o `slnt` (slant)
- Interpolación fluida entre pesos y anchos.
- Soporte correcto de variable en CSS y apps modernas: `font-variation-settings`.
- Embedding en formatos WOFF2/TTF.

## 8. Cobertura Unicode
- ASCII básico y Latin-1.
- Latin Extended A/B/C, Central Europe, Baltic, Vietnamese, Turkish.
- Diacríticos completos: ñ, ü, ć, ș, etc.
- Opcional: Cyrillic, Greek, IPA, Scripts adicionales.

## 9. OpenType features completas
- Numerales: `onum`, `lnum`, `tnum`, `pnum`.
- Fracciones y super/sub: `frac`, `numr`, `dnom`, `sups`, `subs`, `ordn`.
- Capitales versales: `case`, `c2sc`, `smcp`.
- Figura oldstyle y ligadura contextual: `calt`, `rlig`.
- Importante definir `GPOS` y `GSUB` para cada feature.

## 10. Hinting y rasterizado
- Hinting en TrueType/CFF para tamaños pequeños.
- soporte de autohint y hints manuales cuando es necesario.
- versionado WOFF/WOFF2/TTF/OTF para web y escritorio.
- gAsp table con ajustes para renderizado en diferentes puntos.

## 11. Accesibilidad y usabilidad
- Contraste de trazos suficiente.
- Amplitud de espaciado que evita fatiga visual.
- Con caracteres diferenciados para dislexia (si aplica: g, a, q).
- nNúmeros tabulares para financial UI.

## 12. Metadatos y distribución
- Name table con:
  - Family name
  - Subfamily name
  - Designer y copyright
  - License
- OS/2 table correcta (weightClass, widthClass, usWeightClass).
- post table (italic angle, underline thickness).
- Versiones semánticas y documentación de licencia (SIL Open Font License / comercial).

## 13. Packaging profesional
- @font-face recomendado con feature settings:
  ```css
  @font-face {
    font-family: "ModernPro";
    src: url("ModernPro.woff2") format("woff2"),
         url("ModernPro.woff") format("woff");
    font-weight: 100 900;
    font-style: normal;
    font-display: swap;
  }

  .text {
    font-family: "ModernPro", sans-serif;
    font-feature-settings: "liga" 1, "kern" 1, "ss01" 1;
    font-variant-numeric: lining-nums proportional-nums;
  }
  ```
- Demo con frases reales, UI, tablas, captions.
- Especificación de: métricas, features, uso recomendado, pares de kerning, guía de estilos.

## 14. Verificación / QA
- Uso de herramientas:
  - fontbakery
  - fonttools (ttx)
  - gftools
  - akula
- Revisar:
  - glifos faltantes/duplicados
  - x-height consistente
  - distorsiones en interpolación variable
  - kerning críticos con combinaciones como `AV`, `To`, `Wa`
- Pruebas en browsers y apps (Illustrator, Figma, InDesign, VS Code).

## 15. Plus de modernidad
- Soporte layer color: COLRv1/CPAL o SVG para icon fonts.
- Parametric design con ejes condicionales.
- Optimización para renderizado en Pantallas retina y 4K.

## 16. Checklist rápida
- [ ] Métricas calibradas
- [ ] Kerning completo
- [ ] Ligaduras y alternantes OpenType
- [ ] Diseño múltiple peso/width
- [ ] Variable font validada
- [ ] Cobertura internacional adecuada
- [ ] Hinting válido
- [ ] Metadatos completos
- [ ] QA con fontbakery y fonttools
- [ ] Documentación y CSS de uso
