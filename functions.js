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
      tipo,
      x: Math.floor(Math.random() * 400),
      y: Math.floor(Math.random() * 300),
      radio: Math.floor(Math.random() * 50) + 10,
      color, aptitud: 0
    };
  } else if (tipo === "triangle") {
    return {
      tipo,
      x1: Math.floor(Math.random() * 400), y1: Math.floor(Math.random() * 300),
      x2: Math.floor(Math.random() * 400), y2: Math.floor(Math.random() * 300),
      x3: Math.floor(Math.random() * 400), y3: Math.floor(Math.random() * 300),
      color, aptitud: 0
    };
  } else {
    return {
      tipo,
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