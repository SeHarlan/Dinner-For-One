class Curtain {
  constructor() {
    const minHeight = minDimension * 0.03
    const maxHeight = minDimension * 0.15
    this.curtainHeight = random(minHeight, maxHeight)

    const xStart = random(margin, width * 0.33)

    const yBotMarg = margin + this.curtainHeight
    const yStart = random(margin, height - yBotMarg)

    const xEnd = random(width * 0.66, width - margin)

    const baseYEnd= yStart + curtainFlow * map(xEnd - xStart, width*0.33, width-margin*2, 0.5, 1)
    const yEnd = constrain(baseYEnd, margin, height - yBotMarg)

    this.curtainStart = createVector(xStart, yStart);

    this.curtainEnd = createVector(xEnd, yEnd);

    const cols = random() > 0.2 ? [color1, color2] : [color3, color4, color5]
    this.mainColor = random(cols)

    const ampMult = random(0.025, 0.04) * map(this.curtainHeight, minHeight, maxHeight, 1, 0.75)
    const rangMult = random(0.05, 0.3)
    this.curveRange = this.curtainHeight * rangMult
    this.curveArgs = []

    //start at extremes
    this.minY = height
    this.maxY = 0


    const space = round(map(this.curtainEnd.x - this.curtainStart.x, maxDimension / 2, maxDimension - margin * 2, 0.0004, 0.00025, true) * 100000) / 100000
    const xRat = 0.0005

    for (let t = 0; t <= 1; t += space) {
      let point = p5.Vector.lerp(this.curtainStart, this.curtainEnd, t)

      const minFreq = 0.001
      const maxFreq = 0.02
      const curtNoiseOff = this.curtainStart.y + this.curtainEnd.y + this.curtainStart.x + this.curtainEnd.x 
      const waveFreq = map(noise(point.x * xRat + curtNoiseOff), 0, 1, minFreq, maxFreq)
      const waveAmp = minDimension * ampMult

      const yRange = this.curtainHeight * 0.006
      point.y += constrain(randomGaussian(0, yRange), -yRange * 4, yRange * 4)
      const orgY = point.y
      point.y += map(sin(point.x * waveFreq), -1, 1, -waveAmp, waveAmp)

      const xRange = baseSW * 2
      const x2 = point.x + random(-xRange, xRange)

      const botMult = 0.75
      const y2 = orgY + this.curtainHeight + map(sin(point.x * waveFreq), 1, -1, waveAmp*botMult, -waveAmp*botMult)

      const cRange = baseSW * this.curveRange
      const cx1 = point.x + random(-cRange, cRange)
      const cy1 = point.y - waveAmp * 2;
      const cx4 = x2 + random(-cRange, cRange)
      const cy4 = y2 + waveAmp * 2;

      const c = this.mainColor
      const h = hue(c) 
      
      let s = saturation(c)
      s += map(this.curtainHeight, minHeight, maxHeight, -20, 0) 

      let l = lightness(c)
      l += map(this.curtainHeight, minHeight, maxHeight, -5, 0) 
      const lRange = 6
      l += map(sin(point.x * waveFreq), -1, 1, lRange, -lRange) + randomGaussian(0, lRange*0.7)

      if (point.y < this.minY) this.minY = point.y
      if(y2 > this.maxY) this.maxY = y2

      this.curveArgs.push({
        baseL: lightness(c),
        color: color(h, s, l),
        points: [cx1, cy1, point.x, point.y, x2, y2, cx4, cy4]
      })
    }
  }

  draw() {
    //border
    this.curveArgs.forEach((args, index) => {
      const offDist = baseSW
      const a = random(0.25)
      const col = color(0,0,0,a)
      graphics.fill(col)
      graphics.noStroke()
      const rad = baseSW * 2
      const points = args.points
      graphics.circle(points[2], points[3] - offDist, rad)
      graphics.circle(points[4], points[5] + offDist, rad)
    })

    //main
    graphics.noFill()
    graphics.strokeWeight(baseSW)
    this.curveArgs.forEach(args => {
      graphics.stroke(args.color)
      graphics.curve(...args.points)
    })

    //ray drops
    this.curveArgs.forEach((args, index) => {
      const c = args.color
      const h = hue(c)
      const s = saturation(c)
      const l = lightness(c)

      const lRange = args.baseL + 6
      const len = this.curveArgs.length -1
      const inBorder = index > len*0.2 && index < len*0.8
      if (l < lRange || random() < 0.995 || !inBorder) return
      graphics.stroke(h, s, l)
      const {points} = args
      const tp = createVector(points[2], points[3])
      const bp = createVector(points[4], points[5])
      const p = p5.Vector.lerp(tp, bp, random(0.2, 0.8))
      const orgY = p.y
      const spacing = baseSW * random(5,15)
      while (p.y >= 0) {

        const length = random(spacing) 
        const li = random(65, 80)//map(p.y, orgY, 0, l+5, 80) + random(20)
        graphics.stroke(h, s, li, random(0.1,0.75))
        const xRange = baseSW * map(p.y, orgY, orgY-this.curtainHeight/2, 15, 0, true)//baseSW*3

        graphics.drawingContext.shadowBlur = baseSW * 4
        graphics.drawingContext.shadowColor = color(h,s,li+10)

        const x2 = p.x + random(-xRange, xRange)
        const y2 = p.y - length
        graphics.line(p.x, p.y, p.x + random(-xRange, xRange), p.y - length)

        graphics.drawingContext.shadowBlur = 0
        graphics.drawingContext.shadowColor = 0

        const sparkNumRange = map(p.y, orgY, orgY-(height/2), 15, 3, true)
        const sparkNum = sparkNumRange * random(50)

        for (let i = 0; i < sparkNum; i++) {
          graphics.stroke(h, s + random(-10, 10), li + random(-10, 10), random(0.1, 0.3))
          const sparkRange = baseSW * sparkNumRange
          graphics.point(x2 + randomGaussian(0, sparkRange), y2 + randomGaussian(0, sparkRange))
        }

        p.y -= spacing
      }
    })
  }
}