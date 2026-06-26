// Variable para almacenar el bitmap de la imagen objetivo
let bitmapObjetivo = null;

// Circulos, Triángulos y Líneas
let figura = {
  tipo: "circle",
  x: 0,
  y: 0,
  radio: 0,
  color: { r: 0, g: 0, b: 0, a: 0 },
  aptitud: 0
};

let figura2 ={
  tipo: "triangle",
  x1: 0, y1: 0,
  x2: 0, y2: 0,
  x3: 0, y3: 0,
  color: { r: 0, g: 0, b: 0, a: 0 },
  aptitud: 0
};

let figura3 = {
  tipo : "line",
  x1: 0, y1: 0,
  x2: 0, y2: 0,
  grosor: 1,
  color: { r: 0, g: 0, b: 0, a: 0 },
  aptitud: 0
};


// Variable para el canvas auxiliar
let pAux = null;

function inicializarCanvasAux(p) {
  pAux = p.createGraphics(400, 300);
  pAux.pixelDensity(1);
}

// Función para cargar la imagen objetivo y obtener su bitmap
function loadImageBitmap(imageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(imageElement, 0, 0, 400, 300);

  const imageData = ctx.getImageData(0, 0, 400, 300);
  bitmapObjetivo = imageData.data;

  console.log("Bitmap objetivo cargado:", bitmapObjetivo.length, "valores");
  console.log("loadImageBitmap llamado");
}

// Función para crear una figura aleatoria
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

// Función para generar una población de figuras aleatorias
function generarPoblacion(n) {
  let poblacion = [];
  for (let i = 0; i < n; i++) {
    poblacion.push(crearFiguraAleatoria());
  }
  return poblacion;
}

// Función para dibujar la población en el canvas
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

// Función para calcular la aptitud de una figura comparándola con el bitmap objetivo
function calcularAptitud(figura) {
  // 1. Limpiar canvas auxiliar
  pAux.clear();

  // 2. Dibujar la figura
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

  // 3. Leer píxeles
  pAux.loadPixels();
  const pixeles = pAux.pixels;

  // 4. Comparar contra bitmap objetivo solo en píxeles que cubre la figura
  let mse = 0;
  let count = 0;

  for (let i = 0; i < pixeles.length; i += 4) {
    const a = pixeles[i + 3];
    if (a === 0) continue; // píxel no cubierto por la figura

    const dr = pixeles[i]     - bitmapObjetivo[i];
    const dg = pixeles[i + 1] - bitmapObjetivo[i + 1];
    const db = pixeles[i + 2] - bitmapObjetivo[i + 2];

    mse += dr * dr + dg * dg + db * db;
    count++;
  }

  figura.aptitud = count > 0 ? mse / count : 0;
}

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
    hijo.color = Math.random() < 0.5 ? {...padre1.color} : {...padre2.color};
    hijos.push(hijo);
  }
  return [...poblacion, ...hijos];
}

function mutar(poblacion, tasa) {
  for (let figura of poblacion) {
    if (Math.random() < tasa) {
      // Mutar color
      figura.color.r = Math.min(255, Math.max(0, figura.color.r + Math.floor(Math.random() * 50) - 25));
      figura.color.g = Math.min(255, Math.max(0, figura.color.g + Math.floor(Math.random() * 50) - 25));
      figura.color.b = Math.min(255, Math.max(0, figura.color.b + Math.floor(Math.random() * 50) - 25));
      figura.color.a = Math.min(255, Math.max(0, figura.color.a + Math.floor(Math.random() * 50) - 25));
    }

    if (Math.random() < tasa) {
      // Mutar geometría según tipo
      if (figura.tipo === "circle") {
        figura.x = Math.min(400, Math.max(0, figura.x + Math.floor(Math.random() * 40) - 20));
        figura.y = Math.min(300, Math.max(0, figura.y + Math.floor(Math.random() * 40) - 20));
        figura.radio = Math.min(60, Math.max(10, figura.radio + Math.floor(Math.random() * 20) - 10));

      } else if (figura.tipo === "triangle") {
        figura.x1 = Math.min(400, Math.max(0, figura.x1 + Math.floor(Math.random() * 40) - 20));
        figura.y1 = Math.min(300, Math.max(0, figura.y1 + Math.floor(Math.random() * 40) - 20));
        figura.x2 = Math.min(400, Math.max(0, figura.x2 + Math.floor(Math.random() * 40) - 20));
        figura.y2 = Math.min(300, Math.max(0, figura.y2 + Math.floor(Math.random() * 40) - 20));
        figura.x3 = Math.min(400, Math.max(0, figura.x3 + Math.floor(Math.random() * 40) - 20));
        figura.y3 = Math.min(300, Math.max(0, figura.y3 + Math.floor(Math.random() * 40) - 20));

      } else if (figura.tipo === "line") {
        figura.x1 = Math.min(400, Math.max(0, figura.x1 + Math.floor(Math.random() * 40) - 20));
        figura.y1 = Math.min(300, Math.max(0, figura.y1 + Math.floor(Math.random() * 40) - 20));
        figura.x2 = Math.min(400, Math.max(0, figura.x2 + Math.floor(Math.random() * 40) - 20));
        figura.y2 = Math.min(300, Math.max(0, figura.y2 + Math.floor(Math.random() * 40) - 20));
        figura.grosor = Math.min(5, Math.max(1, figura.grosor + Math.floor(Math.random() * 3) - 1));
      }
    }
  }
  return poblacion;
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

let figurasFijas = [];

function fijarMejores(poblacion, aptitudGlobal) {
  const LIMITE_FIJAS = 300;

  for (let i = poblacion.length - 1; i >= 0; i--) {
    let figuraActual = poblacion[i];

    // Verificamos si la figura de la población es buena comparada con la aptitud global
    if (!figuraActual.fija && figuraActual.aptitud < aptitudGlobal * 0.5) {
      
      if (figurasFijas.length < LIMITE_FIJAS) {
        // 1. Si aún hay espacio, simplemente la agregamos
        figuraActual.fija = true;
        figurasFijas.push(figuraActual);
        
        // La sacamos de la población y creamos una nueva
        poblacion.splice(i, 1);
        poblacion.push(crearFiguraAleatoria());
        
      } else {
        // 2. Si ya está lleno, buscamos la peor figura (la del MSE / aptitud más alto)
        let indicePeor = 0;
        let peorAptitud = figurasFijas[0].aptitud;

        for (let j = 1; j < figurasFijas.length; j++) {
          if (figurasFijas[j].aptitud > peorAptitud) {
            peorAptitud = figurasFijas[j].aptitud;
            indicePeor = j;
          }
        }

        // 3. Comparamos si la figura actual es MEJOR (menor aptitud) que la peor guardada
        if (figuraActual.aptitud < peorAptitud) {
          figuraActual.fija = true;
          
          // Reemplazamos la peor figura por la nueva
          figurasFijas[indicePeor] = figuraActual;
          
          // La sacamos de la población y creamos una nueva para mantener el tamaño
          poblacion.splice(i, 1);
          poblacion.push(crearFiguraAleatoria());
        }
      }
    }
  }
}