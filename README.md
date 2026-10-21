# Generative Art with a Genetic Algorithm

A genetic algorithm that runs entirely in the browser and evolves circles, triangles and lines until, together, they approximate a target image. Built with JavaScript and [p5.js](https://p5js.org/) for the Artificial Intelligence course at the University of Costa Rica (June 2026).

## How it works

1. **Target:** a random 400×300 photo from [Lorem Picsum](https://picsum.photos/) is loaded into a pixel bitmap.
2. **Population:** 60 random shapes (circles, triangles or lines) with random position, size and RGBA color.
3. **Fitness:** each shape is drawn alone on an off-screen canvas, and its error is the mean squared error against the target, computed only over the pixels it covers. Lower is better.
4. **Selection, crossover and mutation:** the 30 best shapes survive. New shapes are random, but inherit the color of one of two surviving parents. Each shape then has a 13% chance of a color mutation and a 13% chance of a geometry mutation.
5. **Fixing good shapes:** a shape whose error is below half of the current global error is fixed permanently on the canvas, so the bar for new shapes rises as the image improves. Up to 300 shapes can be fixed; after that, a better shape replaces the worst fixed one.

One generation runs every 100 ms, for up to 10,000 generations.

## Parameters

| Parameter | Value |
|---|---|
| Population size | 60 shapes |
| Survivors per generation | 30 (truncation selection) |
| Color mutation | 13% chance, ±25 per channel (RGBA) |
| Geometry mutation | 13% chance, ±20 px in position (plus small size or thickness changes) |
| Fixing threshold | error < 0.5 × global error |
| Maximum fixed shapes | 300 |
| Canvas | 400 × 300 px |
| Generations | up to 10,000, one every 100 ms |

## Run it

No build step or installation is needed.

1. Clone the repository and open `index.html` in a browser (or use the live demo).
2. Click **Random Image** to load a target image.
3. Click **Evolucionar** to start the evolution, and **Detener** to stop it.

The buttons **Generar Población**, **Cruzar**, **Mutar**, **Calcular aptitud** and **Seleccionar** run each step of the algorithm on its own, which is useful to see what each one does.

## Project structure

```
.
├── index.html     # page layout, buttons and the p5.js sketch
└── functions.js   # genetic algorithm: population, fitness, selection, crossover, mutation
```

## Author

**Isaías Alberto Alfaro Ugalde** · [GitHub](https://github.com/IsaiasAlfa)
