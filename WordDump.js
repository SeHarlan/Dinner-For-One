class WordDump {
  constructor() {
    this.words = ["Loss", "Hope", "Lust", "Sadness", "Anger", "Despair", "Fear",
      "Emasculation", "Stupid", "Lonely", "Horny", "Failure", "Worry", "Jealousy", "Relief",
      "Fuck You", "Shame", "All For The Best...", "Disappointed", "Guilt", "Bored", "Melancholy",
      "FUCK", "Did She Cheat?", "Paranoia", "Mixed Emotions", "Rebirth", "Indifference"
    ]
    this.nRatio = random(0.005, 0.0004)
    this.angleRound = wordAngleRounding
    this.cols = [color1, color2, color3, color4, color5]
    this.col = random(this.cols)

    this.maxLi = 30//for spiral lines
    this.spiralPoint = null
    this.darkLines = []
    this.lightLines = []
    this.amount = 10000
    this.batchSize = this.amount / 30
  }
  drawWords(count) {
    if(count >= this.amount/this.batchSize) return true
    graphics.noStroke()
    graphics.textAlign(CENTER)
    graphics.rectMode(CENTER)
    const start = count * this.batchSize
    const end = start + this.batchSize
    for (let i = start; i < end; i++) {
    // for (let i = 0; i < this.amount; i++) {
      const x = random(margin, width - margin)
      const y = random(margin, height - margin)

      const n = noise(x * this.nRatio, y * this.nRatio)

      const angle = round(map(n, 0, 1, -PI / 2, PI / 2) * this.angleRound) / this.angleRound
      
      const n2 = noise(x * this.nRatio * 2, y * this.nRatio * 2)
      const lMod = map(n2, 0, 1, -20, 50)
      const l = lightness(this.col) + lMod
      const size = map(n2, 0, 1, 6, 12)

      const focalDist = maxDimension / 3
      const spiralLocBool = true //y > height * 0.4 
      if (spiralLocBool && !this.spiralPoint && l < 10) {
        const enoughDist = !focalPoint || focalPoint.dist(createVector(x, y)) > focalDist
        const usePoint = checkCurtains(x, y, baseSW * 5)
        if (usePoint && enoughDist) this.spiralPoint = createVector(x, y)
      }
      const focalLocBool = true //y < height * 0.6
      if (focalLocBool && !focalPoint && l > 40) {
        // if (x > margin * 2 && x < width - margin * 2) {
          const enoughDist = !this.spiralPoint || this.spiralPoint.dist(createVector(x,y)) > focalDist
          const usePoint = checkCurtains(x, y, baseSW * 25)
          if (usePoint && enoughDist) focalPoint = createVector(x, y)
        // }
      }

      const h = hue(this.col)
      const s = saturation(this.col)*0.25
      graphics.push()
      graphics.textSize(baseSW * size)
      graphics.fill(h, s, l, 0.5)
      graphics.translate(x, y)
      graphics.rotate(angle)

      if (testRun) {
        graphics.fill(this.h, 10, l, 0.2)
        const w = random(baseSW * 20, baseSW * 80)
        graphics.rect(0, 0, w, baseSW * size * 0.5)
      } else {
        graphics.text(random(this.words), 0, 0)
      }

      graphics.pop()
    }
  }
  makeSpiral() {
    if (!this.spiralPoint) return
    const baseLen = 10
    const { x, y } = this.spiralPoint

    const foc = focalPoint || defaultFocalPoint
    const angle = atan2(y - foc.y, x - foc.x) + PI;

    graphics.noFill()

    const recursiveSpiral = ({ c1x, c1y, x, y, ang, len, hu, sa, li, isAccent}) => {
      const range = PI / 5
      const rat = 0.01
      const angOff = map(noise(x * rat, y * rat), 0, 1, -range, range)
      const newLen = len * random(1, 1.5)

      const baseAngle = angle + map(noise(len * 0.05), 0, 1, -range * 3, range * 3)

      const x2 = x + cos(ang) * len
      const y2 = y + sin(ang) * len
      const cx2 = x2 + cos(baseAngle + angOff + PI) * newLen / 2
      const cy2 = y2 + sin(baseAngle + angOff + PI) * newLen / 2

      const accent = false

      const newCol = random() > 0.08 || isAccent ? color(hu, sa, li) : random(this.cols)
      
      const newHu = hue(newCol)
      const newSa = saturation(newCol)

      const liOff = random(1, 1.35) 
      const liOffMod = !focalPoint ? 0.95: 1
      const newLi = li * max(liOff * liOffMod, 1)
      
      const ncx1 = x2 + cos(baseAngle + angOff) * newLen / 2
      const ncy1 = y2 + sin(baseAngle + angOff) * newLen / 2


      let stop = false

      if (x2 > width || x2 < 0) stop = true
      if (y2 > height || y2 < 0) stop = true
      if (newLi > this.maxLi && !accent) stop = true
      if (newLen > baseLen * 25) stop = true

      this.darkLines.push({ c1x, c1y, x, y, x2, y2, cx2, cy2, ang, len, hu, sa, li, isAccent, stop})
      
      if (stop) {
        this.lightLines.push({ x:x2, y:y2 })
        return
      }

      recursiveSpiral({
        c1x: ncx1,
        c1y: ncy1,
        x: x2,
        y: y2,
        ang: baseAngle + angOff,
        len: newLen,
        hu: newHu,
        sa: newSa,
        li: newLi,
        isAccent: accent,
      })

      if (random() < 0.45) recursiveSpiral({
        c1x: ncx1,
        c1y: ncy1,
        x: x2,
        y: y2,
        ang: baseAngle - angOff,
        len: newLen,
        hu: newHu,
        sa: newSa,
        li: newLi,
      })
    }

    const hu = hue(this.col)
    const sa = saturation(this.col)
    const li = min(lightness(this.col) * 0.25, this.maxLi*0.5)

    const c1x = x + cos(angle) * baseLen
    const c1y = y + sin(angle) * baseLen
    //main spiral
    recursiveSpiral({
      c1x, c1y, x, y,
      hu,
      sa,
      li,
      ang: angle,
      len: baseLen,
    })

  }

  drawDarkLines(i) { 
    const { c1x, c1y, x, y, x2, y2, cx2, cy2, ang, len, hu, sa, li, isAccent, stop } = this.darkLines[i]
    const sw = baseSW * map(li, 0, this.maxLi, 1, 3, true)
    graphics.strokeWeight(sw)

    const shadOff = sw * 0.75
    const shadLi = 5



    //MainLines
    // graphics.strokeWeight(sw)
    // graphics.stroke(hu, sa, li + 30, 0.55)
    // graphics.bezier(x, y - shadOff / 2, c1x, c1y - shadOff / 2, cx2, cy2 - shadOff / 2, x2, y2 - shadOff / 2)

    // graphics.stroke(hu, sa, shadLi)
    // graphics.bezier(x, y + shadOff, c1x, c1y + shadOff, cx2, cy2 + shadOff, x2, y2 + shadOff)
  
    // graphics.stroke(hu, sa, li)
    // graphics.bezier(x, y, c1x, c1y, cx2, cy2, x2, y2)

    //SPOTS
    // graphics.strokeWeight(baseSW)
    // const spotChance = map(li, 0, this.maxLi, -1, 2, true)
    // if (!isAccent && random() < spotChance) {
    //   const spotRad = sw * random(2, 4)
    //   const randRange = 0
    //   const sides = random([3, 4])
    //   const squeeze = 0.7

    //   graphics.stroke(hu, sa, li + 30, 0.5)
    //   drawPoly(createVector(x, y - shadOff / 2), spotRad, sides, ang + PI, randRange, squeeze)

    //   graphics.stroke(hu, sa, shadLi)
    //   drawPoly(createVector(x, y + shadOff), spotRad, sides, ang + PI, randRange, squeeze)

    //   graphics.stroke(hu, sa, li + 5)
    //   drawPoly(createVector(x, y), spotRad, sides, ang + PI, randRange, squeeze)
    // }


    //ridges
    const ridgePoints = getCurveVectors(x, y, c1x, c1y, cx2, cy2, x2, y2, 0.01)
    const angleOffRange = radians(sw * random(1,6))
    ridgePoints.forEach(({ x, y, angle }) => {
      graphics.strokeWeight(baseSW)

      //messy lines 
      const messyNum = 1
      const distance = sw * 10
      graphics.drawingContext.shadowBlur = baseSW * 3
      graphics.drawingContext.shadowColor = color(hu, sa, li*0.35)
      for (let i = 0; i < messyNum; i++) {
        const newL = li + randomGaussian(0, 5) + random(-10,15) 
        graphics.stroke(hu+random(-12, 12), sa + random(-50,0), newL, random(0.2, 1))
        const angleOff = random(-angleOffRange, angleOffRange)
        const x2 = x + cos(angle + angleOff) * distance
        const y2 = y + sin(angle + angleOff) * distance

        //control points for bezier curve
        const cRange = PI/6
        const c1Off = random(-cRange, cRange)
        const c1x = x + cos(angle + angleOff + c1Off) * distance / 2
        const c1y = y + sin(angle + angleOff + c1Off) * distance / 2
        const c2Off = random(-cRange, cRange)
        const c2x = x2 + cos(angle + angleOff + c2Off + PI) * distance / 2
        const c2y = y2 + sin(angle + angleOff + c2Off + PI) * distance / 2
        graphics.bezier(x,y,c1x,c1y,c2x,c2y,x2,y2)
      }
      graphics.drawingContext.shadowBlur = 0
      graphics.drawingContext.shadowColor = 0


      //orginal ridges
      // graphics.stroke(hu, sa, shadLi, random(0.5))
      // const rad = sw * 0.25
      // const x1 = x + cos(angle - PI / 2) * rad
      // const y1 = y + sin(angle - PI / 2) * rad
      // const x2 = x + cos(angle + PI / 2) * rad
      // const y2 = y + sin(angle + PI / 2) * rad
      // graphics.line(x1, y1, x2, y2)
    })



    return stop;
  }
  sortLightLines() {
    this.lightLines.sort((a, b) => {
      const foc = focalPoint || defaultFocalPoint
      const da = foc.dist(createVector(a.x, a.y))
      const db = foc.dist(createVector(b.x, b.y))
      return da - db
    })
  }
  drawFocalPoint() {
    if (!focalPoint && !this.lightLines.length) return
    if (!focalPoint) return
    graphics.strokeWeight(baseSW)
    graphics.noFill()
    const { x, y } = focalPoint || defaultFocalPoint
    const numSparks = 2000

    //base portal
    const portDis = baseSW * random(2,16)
    for (let i = 0; i < numSparks; i++) {
      const base = round(map(i, 0, numSparks, 1, 3)) * portDis*2
      const angle = random(TWO_PI)
      const dist = base + abs(randomGaussian(0, portDis))
      
      const rad = dist - map(abs(sin(angle+PI/2)), -1, 1, 0, dist * 0.5)
      const xs = x + cos(angle) * rad
      const ys = y + sin(angle) * rad

      const h = hue(this.col) + random(-10, 10)
      const s = saturation(this.col) + random(-10, 10)
      const l = random(70,100)
      graphics.stroke(h,s,l, random(0.1, 0.5))
      graphics.point(xs, ys)
    }

    // arms
    const numArms = random(50, 300)
    for (let i = 0; i < numArms; i++) { 
      const angle = map(i, 0, numArms, 0, TWO_PI)
      const dist = portDis + randomGaussian(0, baseSW*100)
      const xs = x + cos(angle) * dist
      const ys = y + sin(angle) * dist
      this.drawLightLines(undefined, createVector(xs, ys))
    }
  }
  drawLightLines(i, p) { 
    if(!focalPoint) return
    if (random() > 0.5 && !p) return
    const { x, y } = p || this.lightLines[i]
    graphics.strokeWeight(baseSW)
    graphics.noFill()
    const h = hue(this.col) 
    const s = saturation(this.col) + random(-5, 5)
    const l = random(70,100)
    const a = random(0.01, 0.5)

    if (!p) { // p means its a mini line at focal point
      //Meeting point
      const n = randomGaussian(0, 1000)
      const d = randomGaussian(0, 1000)
      graphics.stroke(h, s, l, 0.01)
      makeMaurer(x, y, n, d, baseSW * 8)
    }


    graphics.stroke(h, s, l, a)

    const range = 0
    const foc = focalPoint || defaultFocalPoint
    const ranFoc = createVector(foc.x + random(-range, range), foc.y + random(-range, range))

    const totDist = ranFoc.dist(createVector(x, y))
    const cAngRange = PI/10
    const c1Ang = atan2(ranFoc.y - y, ranFoc.x - x) + random(-cAngRange, cAngRange)
    const c1x = x + cos(c1Ang) * totDist * 0.5
    const c1y = y + sin(c1Ang) * totDist * 0.5

    const c2Ang = atan2(ranFoc.y - y, ranFoc.x - x) + random(-cAngRange, cAngRange) + PI
    const c2x = ranFoc.x + cos(c2Ang) * totDist * 0.5
    const c2y = ranFoc.y + sin(c2Ang) * totDist * 0.5

    graphics.drawingContext.shadowBlur = baseSW * 4
    graphics.drawingContext.shadowColor = color(h, s, l+5)

    graphics.bezier(x, y, c1x, c1y, c2x, c2y, ranFoc.x, ranFoc.y)

    graphics.drawingContext.shadowBlur = 0
    graphics.drawingContext.shadowColor = 0
    
    const tStep = map(totDist, 0, maxDimension, 0.01, 0.0005, true)
    const bezierPoints = getCurveVectors(x, y, c1x, c1y, c2x, c2y, ranFoc.x, ranFoc.y, tStep)

    bezierPoints.forEach(({ x, y, angle }, index) => { 
      if (x < 0 || x > width || y < 0 || y > height) return
    
      const step = easeOutSine(index/bezierPoints.length)
      const sparkNum = random(map(step, 0, 1, 150, 0)) / (p ? 4 : 1)

      //sparks
      for (let i = 0; i < sparkNum; i++) {
        graphics.stroke(h, s+random(-10,10), l+random(-10,10), random(0.01,0.3))
        const sparkRange = baseSW * 5
        graphics.point(x + randomGaussian(0, sparkRange), y + randomGaussian(0, sparkRange))
      }
    
      //dirt
      for (let i = 0; i < sparkNum/50; i++) {
        const a = random(0.6)
        graphics.stroke(h, random(70, 100), random(20, 0), a)
        const dirtRange = baseSW
        graphics.point(x + random(-dirtRange, dirtRange), y + random(-dirtRange, dirtRange))
      }
      
    })
  }
}