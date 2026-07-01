# 📓 Cuaderno de Límites — Análisis Matemático I

Libreta digital interactiva sobre **Límite de funciones reales** (Unidad Temática N.º 2),
con gráficos interactivos en `<canvas>`, estética de apuntes a mano y un cuestionario
con feedback inmediato al final de cada módulo.

Es un sitio **100% estático** (HTML + CSS + JS puro, sin frameworks ni build step),
así que se despliega en Vercel sin configuración.

## Estructura

```
cuaderno-limites/
├── index.html          → Portada + índice de módulos
├── modulo-1.html        → El problema de la tangente
├── modulo-2.html        → Definición informal de límite
├── modulo-3.html        → Límites laterales
├── modulo-4.html        → Límites infinitos y asíntotas verticales
├── modulo-5.html        → Definición formal (ε–δ)
├── modulo-6.html        → Límites al infinito, propiedades y técnicas de cálculo
├── css/notebook.css     → Toda la identidad visual (papel, espiral, post-its, quiz, etc.)
└── js/
    ├── notebook.js       → Índice deslizante, navegación entre módulos, progreso
    ├── plotter.js         → Motor de gráficos interactivos en canvas
    └── quiz.js             → Motor de cuestionarios con feedback inmediato
```

## Cómo desplegarlo en Vercel

**Opción A — más rápida (arrastrar y soltar):**
1. Entrá a [vercel.com](https://vercel.com) → *Add New* → *Project*.
2. Elegí **"Deploy without Git"** / arrastrá la carpeta `cuaderno-limites` (o el .zip descomprimido) al panel.
3. Vercel detecta que es un sitio estático — no hace falta tocar ningún ajuste de build (dejá *Build Command* y *Output Directory* vacíos, o "Other" como framework preset).
4. Listo, te da una URL para compartir con tus compañeros.

**Opción B — con Vercel CLI:**
```bash
npm i -g vercel
cd cuaderno-limites
vercel --prod
```

**Opción C — con GitHub:**
1. Subí la carpeta a un repo de GitHub.
2. En Vercel: *Add New → Project → Import Git Repository*.
3. Framework preset: **Other**. No hay build command. Listo.

## Notas

- El progreso de los cuestionarios (✔ en el índice) se guarda con `localStorage`,
  **por navegador/dispositivo** — no es una base de datos compartida entre compañeros.
- Todo el contenido matemático está basado en Stewart, J. (2012). *Cálculo. Trascendentes
  tempranas*, Cap. 2, y en las guías de cátedra (Guía de estudio N.º 5, Guías de
  Actividades Prácticas N.º 7 y 8) de Análisis Matemático I.
- El módulo de **Continuidad** queda como "próximamente" en el índice — se puede sumar
  después siguiendo el mismo esquema de archivos (copiar un `modulo-N.html`, ajustar
  `MODULES` en `js/notebook.js` y sacarle `locked:true`).
- Para agregar más preguntas a un cuestionario, solo hay que sumar objetos al array
  `questions` que cada módulo pasa a `NBQuiz(...)` al final del archivo — soporta
  preguntas de opción múltiple (`mcq`), verdadero/falso (`tf`) y completar (`fill`).
