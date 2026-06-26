// ============================================================
// VARIABLES GLOBALES
// ============================================================

let bitmapObjetivo = null;
let figurasFijas = [];
let pAux = null;

// ============================================================
// INICIALIZACIÓN
// ============================================================

function inicializarCanvasAux(p) {
  pAux = p.createGraphics(400, 300);
  pAux.pixelDensity(1);
}

function loadImageBitmap(imageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(imageElement, 0, 0, 400, 300);

  const imageData = ctx.getImageData(0, 0, 400, 300);
  bitmapObjetivo = imageData.data;

  console.log("Bitmap objetivo cargado:", bitmapObjetivo.length, "valores");
}

// ============================================================
// POBLACIÓN
// ============================================================

function crearFiguraAleatoria() {
  const tipos = ["circle", "triangle", "line"];
  const tipo = tipos[Math.floor(Math.random() * tipos.length)];
  const color = {
    r: Math.floor(Math.random() * 256),
    g: Math.floor(Math.random() * 256),
    b: Math.floor(Math.random() * 256),
    a: Math.floor(Math.random() * 156) + 50
  };

  if (tipo === "circle") {
    return {
      tipo, fija: false,
      x: Math.floor(Math.random() * 400),
      y: Math.floor(Math.random() * 300),
      radio: Math.floor(Math.random() * 50) + 10,
      color, aptitud: 0
    };
  } else if (tipo === "triangle") {
    return {
      tipo, fija: false,
      x1: Math.floor(Math.random() * 400), y1: Math.floor(Math.random() * 300),
      x2: Math.floor(Math.random() * 400), y2: Math.floor(Math.random() * 300),
      x3: Math.floor(Math.random() * 400), y3: Math.floor(Math.random() * 300),
      color, aptitud: 0
    };
  } else {
    return {
      tipo, fija: false,
      x1: Math.floor(Math.random() * 400), y1: Math.floor(Math.random() * 300),
      x2: Math.floor(Math.random() * 400), y2: Math.floor(Math.random() * 300),
      grosor: Math.floor(Math.random() * 4) + 1,
      color, aptitud: 0
    };
  }
}

function generarPoblacion(n) {
  let poblacion = [];
  for (let i = 0; i < n; i++) {
    poblacion.push(crearFiguraAleatoria());
  }
  return poblacion;
}

// ============================================================
// DIBUJO
// ============================================================

function dibujarPoblacion(p, poblacion) {
  p.background(255);
  for (let figura of poblacion) {
    const c = figura.color;
    p.fill(c.r, c.g, c.b, c.a);
    p.noStroke();

    if (figura.tipo === "circle") {
      p.circle(figura.x, figura.y, figura.radio * 2);

    } else if (figura.tipo === "triangle") {
      p.triangle(figura.x1, figura.y1, figura.x2, figura.y2, figura.x3, figura.y3);

    } else if (figura.tipo === "line") {
      p.stroke(c.r, c.g, c.b, c.a);
      p.strokeWeight(figura.grosor);
      p.line(figura.x1, figura.y1, figura.x2, figura.y2);
    }
  }
}

// ============================================================
// APTITUD
// ============================================================

function calcularAptitud(figura) {
  pAux.clear();
  const c = figura.color;
  pAux.fill(c.r, c.g, c.b, c.a);
  pAux.noStroke();

  if (figura.tipo === "circle") {
    pAux.circle(figura.x, figura.y, figura.radio * 2);

  } else if (figura.tipo === "triangle") {
    pAux.triangle(figura.x1, figura.y1, figura.x2, figura.y2, figura.x3, figura.y3);

  } else if (figura.tipo === "line") {
    pAux.stroke(c.r, c.g, c.b, c.a);
    pAux.strokeWeight(figura.grosor);
    pAux.line(figura.x1, figura.y1, figura.x2, figura.y2);
  }

  pAux.loadPixels();
  const pixeles = pAux.pixels;
  let mse = 0;
  let count = 0;

  for (let i = 0; i < pixeles.length; i += 4) {
    const a = pixeles[i + 3];
    if (a === 0) continue;

    const dr = pixeles[i]     - bitmapObjetivo[i];
    const dg = pixeles[i + 1] - bitmapObjetivo[i + 1];
    const db = pixeles[i + 2] - bitmapObjetivo[i + 2];

    mse += dr * dr + dg * dg + db * db;
    count++;
  }

  figura.aptitud = count > 0 ? mse / count : 0;
}

function calcularAptitudGlobal(p) {
  p.loadPixels();
  const pixeles = p.pixels;
  let mse = 0;

  for (let i = 0; i < pixeles.length; i += 4) {
    const dr = pixeles[i]     - bitmapObjetivo[i];
    const dg = pixeles[i + 1] - bitmapObjetivo[i + 1];
    const db = pixeles[i + 2] - bitmapObjetivo[i + 2];
    mse += dr * dr + dg * dg + db * db;
  }

  return mse / (pixeles.length / 4);
}

// ============================================================
// ALGORITMO GENÉTICO
// ============================================================

function seleccionar(poblacion) {
  poblacion.sort((a, b) => a.aptitud - b.aptitud);
  return poblacion.slice(0, 30);
}

function cruzar(poblacion) {
  const hijos = [];
  while (hijos.length < 60 - poblacion.length) {
    const padre1 = poblacion[Math.floor(Math.random() * poblacion.length)];
    const padre2 = poblacion[Math.floor(Math.random() * poblacion.length)];

    const hijo = crearFiguraAleatoria();
    hijo.color = Math.random() < 0.5 ? { ...padre1.color } : { ...padre2.color };
    hijos.push(hijo);
  }
  return [...poblacion, ...hijos];
}

function mutar(poblacion) {
  for (let figura of poblacion) {
    if (Math.random() < 0.13) {
      figura.color.r = Math.min(255, Math.max(0, figura.color.r + Math.floor(Math.random() * 50) - 25));
      figura.color.g = Math.min(255, Math.max(0, figura.color.g + Math.floor(Math.random() * 50) - 25));
      figura.color.b = Math.min(255, Math.max(0, figura.color.b + Math.floor(Math.random() * 50) - 25));
      figura.color.a = Math.min(255, Math.max(0, figura.color.a + Math.floor(Math.random() * 50) - 25));
    }

    if (Math.random() < 0.13) {
      if (figura.tipo === "circle") {
        figura.x     = Math.min(400, Math.max(0, figura.x     + Math.floor(Math.random() * 40) - 20));
        figura.y     = Math.min(300, Math.max(0, figura.y     + Math.floor(Math.random() * 40) - 20));
        figura.radio = Math.min(60,  Math.max(10, figura.radio + Math.floor(Math.random() * 20) - 10));

      } else if (figura.tipo === "triangle") {
        figura.x1 = Math.min(400, Math.max(0, figura.x1 + Math.floor(Math.random() * 40) - 20));
        figura.y1 = Math.min(300, Math.max(0, figura.y1 + Math.floor(Math.random() * 40) - 20));
        figura.x2 = Math.min(400, Math.max(0, figura.x2 + Math.floor(Math.random() * 40) - 20));
        figura.y2 = Math.min(300, Math.max(0, figura.y2 + Math.floor(Math.random() * 40) - 20));
        figura.x3 = Math.min(400, Math.max(0, figura.x3 + Math.floor(Math.random() * 40) - 20));
        figura.y3 = Math.min(300, Math.max(0, figura.y3 + Math.floor(Math.random() * 40) - 20));

      } else if (figura.tipo === "line") {
        figura.x1     = Math.min(400, Math.max(0, figura.x1     + Math.floor(Math.random() * 40) - 20));
        figura.y1     = Math.min(300, Math.max(0, figura.y1     + Math.floor(Math.random() * 40) - 20));
        figura.x2     = Math.min(400, Math.max(0, figura.x2     + Math.floor(Math.random() * 40) - 20));
        figura.y2     = Math.min(300, Math.max(0, figura.y2     + Math.floor(Math.random() * 40) - 20));
        figura.grosor = Math.min(5,   Math.max(1, figura.grosor + Math.floor(Math.random() * 3)  - 1));
      }
    }
  }
  return poblacion;
}

function fijarMejores(poblacion, aptitudGlobal) {
  const LIMITE_FIJAS = 300;

  for (let i = poblacion.length - 1; i >= 0; i--) {
    const figuraActual = poblacion[i];

    if (!figuraActual.fija && figuraActual.aptitud < aptitudGlobal * 0.5) {

      if (figurasFijas.length < LIMITE_FIJAS) {
        figuraActual.fija = true;
        figurasFijas.push(figuraActual);
        poblacion.splice(i, 1);
        poblacion.push(crearFiguraAleatoria());

      } else {
        let indicePeor = 0;
        for (let j = 1; j < figurasFijas.length; j++) {
          if (figurasFijas[j].aptitud > figurasFijas[indicePeor].aptitud) {
            indicePeor = j;
          }
        }

        if (figuraActual.aptitud < figurasFijas[indicePeor].aptitud) {
          figuraActual.fija = true;
          figurasFijas[indicePeor] = figuraActual;
          poblacion.splice(i, 1);
          poblacion.push(crearFiguraAleatoria());
        }
      }
    }
  }
}