function loadImageBitmap(imageElement) {
  // Canvas oculto — solo para leer píxeles, el usuario no lo ve
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext("2d");

  // Cargar la imagen
  ctx.drawImage(imageElement, 0, 0, 400, 300);

  // Extrae todos los píxeles: array plano [R,G,B,A, R,G,B,A, ...]
  const imageData = ctx.getImageData(0, 0, 400, 300);
  const pixels = imageData.data; // Uint8ClampedArray con 400*300*4 = 480,000 valores

  console.log("Total valores:", pixels.length);
  console.log("Píxel (0,0) → R:", pixels[0], "G:", pixels[1], "B:", pixels[2], "A:", pixels[3]);
};



  let geomBitmap = null;
  let maskBitmap = null;

  let baseImg;       // image of the original canvas content
  let maskedCircle;  // image after applying mask()

  function setup() {
    createCanvas(800, 400);
    pixelDensity(1); // avoid DPI complications

    // ----------------------------------------------------------------------
    // 1. DIBUJAR CONTENIDO BASE EN EL CANVAS
    // ----------------------------------------------------------------------
    background(30);
    noStroke();
    // Simple pattern: vertical stripes with a color gradient
    for (let x = 0; x < width; x += 10) {
      let t = x / width;
      fill(lerpColor(color('#ff5f6d'), color('#ffc371'), t));
      rect(x, 0, 10, height);
    }
    // Overlay some ellipses
    fill(0, 150);
    ellipse(200, 200, 200, 200);
    fill(255, 100);
    ellipse(600, 200, 250, 250);

    // Guardar copia del canvas actual como p5.Image
    baseImg = get(0, 0, width, height);

    // ----------------------------------------------------------------------
    // 2. ENFOQUE GEOMÉTRICO: SAMPLE CÍRCULO DIRECTAMENTE DE pixels[]
    // ----------------------------------------------------------------------
    loadPixels(); // carga los píxeles del canvas en pixels[]
    let cxGeom = 200;
    let cyGeom = 200;
    let rGeom  = 80;
    geomBitmap = getCircleBitmapFromCanvas(cxGeom, cyGeom, rGeom);

    // Visualizar el resultado geométrico en la parte izquierda (como debug):
    // Dibujamos un canvas auxiliar a partir de esa matriz.
    let geomVis = createImage(2 * rGeom, 2 * rGeom);
    geomVis.loadPixels();
    for (let y = 0; y < 2 * rGeom; y++) {
      for (let x = 0; x < 2 * rGeom; x++) {
        let idx = 4 * (x + y * geomVis.width);
        let cell = geomBitmap[y][x];
        if (cell) {
          geomVis.pixels[idx + 0] = cell.r;
          geomVis.pixels[idx + 1] = cell.g;
          geomVis.pixels[idx + 2] = cell.b;
          geomVis.pixels[idx + 3] = cell.a;
        } else {
          // fuera del círculo => transparente
          geomVis.pixels[idx + 0] = 0;
          geomVis.pixels[idx + 1] = 0;
          geomVis.pixels[idx + 2] = 0;
          geomVis.pixels[idx + 3] = 0;
        }
      }
    }
    geomVis.updatePixels();

    // ----------------------------------------------------------------------
    // 3. ENFOQUE MASK(): USAR UNA MÁSCARA CIRCULAR SOBRE UNA SUB-IMAGEN
    // ----------------------------------------------------------------------
    // Región rectangular alrededor de otro círculo
    let cxMask = 600;
    let cyMask = 200;
    let rMask  = 80;
    let sx = cxMask - rMask;
    let sy = cyMask - rMask;
    let sw = 2 * rMask;
    let sh = 2 * rMask;

    let sub = baseImg.get(sx, sy, sw, sh); // p5.Image de la región rectangular

    // Crear máscara circular con createGraphics
    let g = createGraphics(sw, sh);
    g.pixelDensity(1);
    g.clear();           // totalmente transparente
    g.noStroke();
    g.fill(255);         // blanco = visible
    g.circle(sw / 2, sh / 2, 2 * rMask); // círculo completo

    let maskImg = g.get();  // convertimos a p5.Image
    maskedCircle = sub.get();
    maskedCircle.mask(maskImg); // aplica máscara (alpha)

    // Obtener “bitmap lógico” de maskedCircle
    maskBitmap = getBitmapFromImage(maskedCircle);

    // Mostrar los resultados en consola para ver la estructura de datos
    console.log('geomBitmap (circle via geometry, null outside):', geomBitmap);
    console.log('maskBitmap (circle via mask, null where alpha=0):', maskBitmap);

    // Volver a dibujar el canvas limpio y mostrar comparativamente:
    background(30);
    // Izquierda: resultado geométrico
    image(geomVis, 0, 0);
    // Derecha: resultado mask()
    image(maskedCircle, width - sw, 0);
  }

  function draw() {
    // no animation needed
    noLoop();
  }

  // ------------------------------------------------------------------------
  // FUNCIONES AUXILIARES
  // ------------------------------------------------------------------------

  // Enfoque 1: sampling geométrico directo del canvas (circle)
  function getCircleBitmapFromCanvas(cx, cy, r) {
    let bitmap = [];
    let sx = cx - r;
    let sy = cy - r;
    let sw = 2 * r;
    let sh = 2 * r;

    for (let y = 0; y < sh; y++) {
      let row = [];
      for (let x = 0; x < sw; x++) {
        let px = sx + x;
        let py = sy + y;
        // test punto en círculo
        let dx = px - cx;
        let dy = py - cy;
        let inside = dx * dx + dy * dy <= r * r;

        let idx = 4 * (px + py * width);
        let rc = pixels[idx + 0];
        let gc = pixels[idx + 1];
        let bc = pixels[idx + 2];
        let ac = pixels[idx + 3];

        row.push(inside ? { r: rc, g: gc, b: bc, a: ac } : null);
      }
      bitmap.push(row);
    }
    return bitmap;
  }

  // Enfoque 2: obtener matriz bitmap desde una p5.Image con alpha (mask())
  function getBitmapFromImage(img) {
    img.loadPixels();
    let bitmap = [];
    for (let y = 0; y < img.height; y++) {
      let row = [];
      for (let x = 0; x < img.width; x++) {
        let idx = 4 * (x + y * img.width);
        let a = img.pixels[idx + 3];
        if (a > 0) {
          row.push({
            r: img.pixels[idx + 0],
            g: img.pixels[idx + 1],
            b: img.pixels[idx + 2],
            a: a
          });
        } else {
          row.push(null);
        }
      }
      bitmap.push(row);
    }
    return bitmap;
  }