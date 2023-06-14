const scl = 2
let displayScale = 0.4
let cnv;
let graphics, myShader;

//bloom stuff
let shaderThreshold, shaderBlur;
let bufferOriginal, bufferBright, bufferBlurH, bufferBlurV;

let baseSW ;
let margin;
let curtains = [];
let wordDump;
let wordAngleRounding;
let focalPoint, defaultFocalPoint;
let curtainFlow;
let curtainSplit
let bgColor, palette
let color1, color2, color3, color4, color5;

let testRun = false
let isHorizontal = true
const palettes = ["depression", "jealousy", "lust", "anger"]

//tv static instead of canvas texture
  // also glitch stuff
//try embracing canvas
//fine tune palettes with bg colors
//try multiple word dumps in different sizes

function chooseColorPalette() {

  //randomize the sort function for a weighted random?
  palette = palettes.sort(() => random() - 0.35)[0]//"neon"//"base", 
  console.log("PALETTE: ", palette)
  bgColor = [60, 50, 1]
  wordAngleRounding = random(1.5, 2)
  switch (palette) {
    case "base": {
      color1 = color(280, 60, 12)//blue
      color2 = color(350, 70, 10)//red
      color3 = color(310, 65, 10)//purple
      color4 = color(170, 30, 7)//green
      color5 = color(50, 20, 14)//yellow
      break;
    }
    case "anger": {//Anger
      wordAngleRounding = 1
      const accent = color(20, 80, 18)
      color1 = color(180, 5, 60)
      color2 = color(300, 5, 5)
      color3 = accent
      color4 = accent
      color5 = accent
      break;  
    }
    case "jealousy": {//Jealousy
      wordAngleRounding = 1.8
      const accent = color(240, 20, 30)
      color1 = color(100, 30, 10)
      color2 = color(160, 60, 10)
      color3 = color(40, 30, 30)
      color4 = accent
      color5 = accent
      break;
    }
    case "depression": {//Despair
      wordAngleRounding = 2.2
      const accent = color(60, 20, 45)
      color1 = color(200, 50, 15)
      color2 = color(280, 50, 15)
      color3 = color(240, 40, 7)
      color4 = accent
      color5 = accent
      break;
    }
    case "lust": {
      wordAngleRounding = 3
      const accent = color(0, 95, 25)
      color1 = color(280, 30, 15)
      color2 = color(320, 40, 20)
      color3 = accent
      color4 = accent
      color5 = accent
      break; 
    }
    case "neon": {

      //TODO, invert focal point and spiral lines brightness levels
      bgColor = [30, 50, 96]

      const accent = color(300, 100, 90)
      color1 = color(350, 100, 90)
      color2 = color(40, 100, 90)
      color3 = accent
      color4 = accent
      color5 = accent
      break;
    }
  }
}
  

function preload() {
  myShader = loadShader('/shaders/shader.vert', '/shaders/shader.frag');
  isHorizontal = random() > 0.5
}

function setup() {
  const startW = isHorizontal ? 1600 : 900
  const startH = isHorizontal ? 900 : 1600
  cnv = createCanvas(startW * scl, startH * scl, WEBGL);
  colorMode(HSL)

  graphics = createGraphics(width, height);
  graphics.colorMode(HSL)

  minDimension = min(height, width)
  maxDimension = max(height, width)

  // const minWindowDim = min(windowHeight, windowWidth)
  // const dimRatio = (minWindowDim / minDimension) * windowWidth / windowHeight
  // console.log("🚀 ~ file: sketch.js:123 ~ setup ~ dimRatio:", dimRatio)
  // displayScale = round(dimRatio * 10) / 10
  // console.log("🚀 ~ file: sketch.js:125 ~ setup ~ displayScale:", displayScale)
  setScaleClass(displayScale)


  const s = random(1000)
  console.log("seed", s)
  randomSeed(s);
  noiseSeed(s)

  shader(myShader);

  chooseColorPalette()

  baseSW = minDimension / 900;
  margin = minDimension * 0.09;

  curtainFlow = random(-minDimension/2, minDimension/2)
  const maxCurtAmount = 8
  const amount = round(random(1,maxCurtAmount))
  for (let i = 0; i < amount; i++) {
    curtains.push(new Curtain())
  }
  curtains.sort((a, b) => a.curtainHeight - b.curtainHeight)

  curtainSplit = floor(curtains.length * (4 / maxCurtAmount))
  

  graphics.textFont("Cutive Mono")
  wordDump = new WordDump()

  // focalPoint = createVector(constrain(randomGaussian(width/2, width/4), 0, width),0)
  defaultFocalPoint = createVector(random(width), 0)

  
  graphics.background(...bgColor)

  const shaderBG = hslToRgb(...bgColor)
  myShader.setUniform("bgColor", shaderBG)
  myShader.setUniform("rando", random());
}

const STAGES = {
  DRAW_WORDS: "DRAW_WORDS",
  FIRST_CURTAINS: "FIRST_CURTAINS",
  SPIRAL: "SPIRAL",
  FOCAL: "FOCAL",
  LINES: "LINES",
  LAST_CURTAINS: "LAST_CURTAINS",
  ALL_COMPLETE: "ALL_COMPLETE"
} 
let stage = STAGES.DRAW_WORDS
let count = 0
let lightLineIndex = 0
function draw() {
  console.log(stage)
  if (stage === STAGES.DRAW_WORDS) {
    const complete = wordDump.drawWords(count)
    count++
    if (complete) {
      stage = STAGES.FIRST_CURTAINS
      count = 0
    }
  }

  //further back curtains
  // for (let i = 0; i < curtainSplit; i++) {
    // curtains[i].draw()
  // }
  if (stage === STAGES.FIRST_CURTAINS) {
    if (count < curtainSplit) {
      curtains[count].draw()
      count++
    } else {
      stage = STAGES.SPIRAL
      count = 0
    }
  }
    
  if (stage === STAGES.SPIRAL) {
    wordDump.makeSpiral()
    stage = STAGES.FOCAL
  }

  if (stage === STAGES.FOCAL) {
    //TODO convert to use count?
    wordDump.drawFocalPoint()

    stage = STAGES.LINES
    count = 0
  }

  if (stage === STAGES.LINES) {
    if (count < wordDump.darkLines.length) {
    // for (let i = 0; i < wordDump.darkLines.length; i++) { 
      const lastLine = wordDump.drawDarkLines(count)
  
      if (lastLine) { 
        wordDump.drawLightLines(lightLineIndex)
        lightLineIndex++
      }
      count++
    } else {
      stage = STAGES.LAST_CURTAINS
      count = curtainSplit;
    }
  }

  if (stage === STAGES.LAST_CURTAINS) {
    if (count < curtains.length) {
      curtains[count].draw()
      count++
    } else {
      stage = STAGES.ALL_COMPLETE
      count = 0
    }
  }
  //closer curtains
  // for (let i = curtainSplit; i < curtains.length; i++) {
  //   curtains[i].draw()
  // }


  image(graphics, -width / 2, -height / 2, width, height)
  myShader.setUniform("texture", graphics)
  rect(-width / 2, -height / 2, width, height)

  if (stage === STAGES.ALL_COMPLETE) {
    console.log("COMPLETED")
    noLoop()
  }
}


function keyPressed() {
  if (key == 's') save("Making Dinner For One.png");
  if (key == "+" || key == "=") {
    if (displayScale >= 1.9) return
    displayScale += 0.1
    displayScale = round(displayScale * 10) / 10
    console.log("+ to " + displayScale)
    setScaleClass(displayScale)
  }
  if (key == "_" || key =="-") {
    if (displayScale <= 0.2) return
    displayScale -= 0.1
    displayScale = round(displayScale * 10) / 10
    console.log("- to " + displayScale)
    setScaleClass(displayScale)
  }
}
function setScaleClass(scl) {
  const cls = String(scl).replace(".", "")
  cnv.class(`x${ cls }`)
}

function hslToRgb(h, s, l) {
  s /= 100
  l /= 100
  let a = s * Math.min(l, 1 - l);
  let f = (n, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  return [f(0), f(8), f(4)];
}   

function isPointInPolygon(point, polygon) {
  const [x, y] = point;
  let isInside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    // Check if the point is on the boundary of the polygon
    if (
      (yi === y && y === yj && ((xi <= x && x <= xj) || (xi >= x && x >= xj))) ||
      (xi === x && x === xj && ((yi <= y && y <= yj) || (yi >= y && y >= yj)))
    ) {
      return true;
    }

    // Check for intersection between the polygon edge and the horizontal ray
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      isInside = !isInside;
    }
  }

  return isInside;
}

function isSquareInPolygon(square, polygon) {
  for (let pnt of square) {
    if (!isPointInPolygon(pnt, polygon)) {
      return false;
    }
  }
  return true;
}

function checkCurtains(x, y) {
  for (let i = 0; i < curtainSplit; i++) {
    const curtain = curtains[i];

    //check general area
    if (x < curtain.curtainStart.x || x > curtain.curtainEnd.x) continue
    if (y < curtain.minY || y > curtain.maxY) continue
    return false
    // //else check all lines
    // const jump = curtain.curveArgs.length / 100
    // for (let j = 0; j < curtain.curveArgs.length; j += jump) {
    //   const [cx1, cy1, x1, y1, x2, y2, cx4, cy4] = curtain.curveArgs[j].points;
    // }

  }
  return true
}

function checkCurtainsB(x, y, checkMargin = baseSW*2) {
  for (let i = 0; i < curtainSplit; i++) {
    const curtain = curtains[i];
    const tlX = curtain.curtainStart.x
    const tlY = curtain.curtainStart.y
    const trX = curtain.curtainEnd.x
    const trY = curtain.curtainEnd.y
    const blX = tlX
    const blY = tlY + curtain.curtainHeight
    const brX = trX
    const brY = trY + curtain.curtainHeight

    const polygon = [
      [tlX, tlY],
      [trX, trY],
      [brX, brY],
      [blX, blY]
    ]
    // const pnt = [x, y]
    const sqr = [
      [x - checkMargin, y - checkMargin],
      [x + checkMargin, y - checkMargin],
      [x + checkMargin, y + checkMargin],
      [x - checkMargin, y + checkMargin]
    ]
    const isCovered = isSquareInPolygon(sqr, polygon)
    if (isCovered) return false
  }
  return true
}

function drawPoly(p, r, sides, startingAngle = random(TWO_PI), randRange = 0, widthRatio = 0) {
  const getR = (baseR, range, angle) => {
    const rand = map(noise(angle % TWO_PI), 0, 1, -range, range)
    const s = map(abs(sin(angle)), 0, 1, 0, baseR * widthRatio)
    return baseR + rand - s
  }
  const getXY = (p, a, startingAngle, radius) => {
    const sx = p.x + cos(a + startingAngle) * radius;
    const sy = p.y + sin(a + startingAngle) * radius;
    return [sx, sy]
  }
  graphics.beginShape()
  const angle = round((TWO_PI / sides) * 100) / 100;
  for (let a = 0; a <= TWO_PI; a += angle) {
    const radius = getR(r, randRange, a)
    graphics.vertex(...getXY(p, a, startingAngle, radius));
  }
  graphics.endShape()
}

function getCurveVectors(x1, y1, x2, y2, x3, y3, x4, y4, t_step = 0.01) { 
  const points = []
  for (let t = 0; t <= 1; t += t_step) {
    let x = bezierPoint(x1, x2, x3, x4, t);
    let y = bezierPoint(y1, y2, y3, y4, t);

    // Get the tangent vector, which is perpendicular to the normal (angle)
    let tx = bezierTangent(x1, x2, x3, x4, t);
    let ty = bezierTangent(y1, y2, y3, y4, t);

    // atan2 gives the angle of the vector
    let angle = atan2(ty, tx);

    const p = createVector(x, y)
    p.angle = angle
    points.push(p);
  }
  return points
}

function makeMaurer(x, y, n, d, rad) {

  const getVector = (i) => {
    let k = i * d;
    let r = rad * sin(n * k);
    let sx = x + r * cos(k);
    let sy = y + r * sin(k);

    return createVector(sx, sy);
  }

  for (let i = 0; i <= 360; i ++) { 
    const v1 = getVector(i)
    const v2 = getVector(i + 1)
    graphics.line(v1.x, v1.y, v2.x, v2.y)
  }
}
function easeOutSine(x) {
  return Math.sin((x*Math.PI)/2)
}
function easeInQuad(x) {
  return x * x;
}
function easeOutQuad(x) {
  return 1 - (1-x) * (1-x)
}
function easeInCubic(x) {
  return x * x * x;
}
function easeInQuart(x) {
  return x * x * x * x;
}
function easeOutQuart(x) {
  return 1 - Math.pow(1-x, 4)
}
function easeInExpo(x) {
  return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
}
function easeInCirc(x) {
  return 1 - Math.sqrt(1 - Math.pow(x, 2));
}
