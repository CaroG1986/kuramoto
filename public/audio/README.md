# 🔊 Audio del Patio — Instrucciones

Coloca tus archivos de audio grabados en esta carpeta.

## Estructura esperada

```
public/audio/
├── limbo.wav        → Círculo 1 — Limbo
├── lujuria.wav      → Círculo 2 — Lujuria
├── gula.wav         → Círculo 3 — Gula
├── avaricia.wav     → Círculo 4 — Avaricia
├── ira.wav          → Círculo 5 — Ira      (dispara al saltar)
├── pereza.wav       → Círculo 6 — Pereza   (dispara al quedarse dormida)
├── violencia.wav    → Círculo 7 — Violencia (dispara en ATTACK)
└── traicion.wav     → Círculo 8 — Traición  (dispara al girar la rueda)
```

## Cuándo se dispara cada audio

| Personaje   | Evento                                 | Frecuencia               |
|-------------|----------------------------------------|--------------------------|
| Violencia   | Estado ATTACK (golpe a Pereza)         | Cada ciclo de θ₇         |
| Pereza      | Transición a sueño (`sinθ₅ < -0.2`)   | Cada ciclo de θ₅         |
| Ira         | Inicio de salto violento (`sinθ₄ > 0.3`)| Cada ciclo de θ₄        |
| Traición    | Inicio de empuje de rueda (`sinθ₇ > 0`)| Cada ciclo de θ₇         |
| Demás       | En cada cresta de fase (peak trigger)  | Cada ciclo de θᵢ         |

## Formatos soportados

- `.wav` (recomendado)
- `.mp3` — renombrar archivo en `AudioManager.js` → `soundFileMap`

## Si no hay archivo

Si un archivo no existe, el sistema usa un **sintetizador de respaldo** automáticamente.  
No se producen errores en consola ni se rompe la experiencia.

## Cómo cambiar un audio

1. Reemplaza el archivo `.wav` en esta carpeta con tu nuevo audio.
2. Mantén el mismo nombre de archivo.
3. Recarga la página (`F5`).

## Control de volumen

Ajustable en `AudioManager.js`:
- `masterGain.gain` → volumen global (actualmente `0.5`)
- `gain.gain` en `triggerCharacterEvent` → volumen por personaje (actualmente `0.7`)
