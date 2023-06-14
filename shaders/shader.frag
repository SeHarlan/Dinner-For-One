#ifdef GL_ES
precision mediump float;
#endif

// precision highp float;

varying vec2 vTexCoord;

uniform sampler2D texture;
uniform float rando;
uniform vec3 bgColor;

float random(vec2 st) {
  return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453123);
}

float map(float value, float inputMin, float inputMax, float outputMin, float outputMax) {
  return outputMin + (value - inputMin) * (outputMax - outputMin) / (inputMax - inputMin);
}

//  https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83
float noise(vec2 p){
	vec2 ip = floor(p);
	vec2 u = fract(p);
	u = u*u*(3.0-2.0*u);
	
	float res = mix(
		mix(random(ip),random(ip+vec2(1.0,0.0)),u.x),
		mix(random(ip+vec2(0.0,1.0)),random(ip+vec2(1.0,1.0)),u.x),u.y);
	return res*res;
}

// CANVAS
void main() {  
    vec2 pos = vTexCoord;
    vec4 textureColor = texture2D(texture, pos);
    
    float r = rando;

    // // CANVAS TEXTURE
    float threshold = 0.05;
    bool isBG = abs(textureColor.r - bgColor.r) < threshold && abs(textureColor.g - bgColor.g) < threshold && abs(textureColor.b - bgColor.b) < threshold; 


    float noise = random(pos*10.0);

    float horLineWeight = 600.0;
    float horFreq = 900.0;
    float horAmp= 3.0 * noise; 
    float horLayer = pos.y * horLineWeight + sin(pos.y * horFreq) * 0.1;
    float horWave = sin(pos.x * horFreq) * horAmp;
    bool isHorWave = mod(floor(horLayer + horWave), 2.0) == 0.0;

    float vertLineWeight = 1000.0;
    float vertFreq = 800.0;
    float vertAmp= 2.4 * noise;
    float vertLayer = pos.x * vertLineWeight + sin(pos.x * vertFreq) * 0.1;
    float vertWave = sin(pos.y * vertFreq) * vertAmp;
    bool isVertWave = mod(floor(vertLayer + vertWave), 2.0) == 0.0;


    float amountRan = 1.0 - random(vec2(floor(pos.x*5.0), floor(pos.y*1000.0)) + rando) + (random(floor(pos*200.0)) * 0.4) ;
    float darkness;
    if (isBG) {
      darkness = 0.04 * amountRan;
    } else {
      darkness = -0.03 * amountRan;
    }
    if(isHorWave && isVertWave) textureColor.rgb += darkness;
    if(isHorWave) textureColor.rgb += darkness;
    // // CANVAS TEXTURE END

    gl_FragColor = textureColor;
}

vec2 blocks(vec2 uv, float r, float mult, float prob) {

  float xFac = random(vec2(r, uv.y*0.000001)) * mult;
  float yFac = random(vec2(uv.x*0.000002, r)) * mult;
    
  vec2 blockFactor = vec2(xFac,yFac);
  float randValue = (1.0 - random(floor(uv * blockFactor) + r) * 2.0) * 0.05;
  
  float glitchProbability = random(floor(uv * blockFactor) * 5.0 + r);
  
  vec2 offset = vec2(0.0);

  if (glitchProbability < prob) {
    offset.x = randValue;
  }
  return offset;
}

float haze(vec2 uv) {
  bool rand = random(uv + 1.0) > 0.3;
  
  if(rand) {
    return 0.0;
  } else {
    //lines
    float xFac = random(vec2(uv.x, rando)) * 4.0;
    float yFac = random(vec2(rando, uv.y)) * 4.0;

    vec2 blockFactor = vec2(xFac,yFac);
    float len = 1.0;
    return (1.0 - random(floor(uv * blockFactor) + rando) * 2.0) * len;
  }
}

// GLITCH
// void main() {
//   vec2 pos = vTexCoord;

//   vec2 off = blocks(pos, rando, 10.0, 0.1) + blocks(pos, rando+10.0, 20.0, 0.1);
//   pos += off;
//   vec4 textureColor = texture2D(texture, pos);

//   if(off.x > 0.0) {
//     textureColor.rgb+=0.03;
//   }

//   float freq = 12.0;
//   float depth = 5.0;
//   if(pos.x*depth+ pos.y*depth > depth - (sin((pos.x*freq*100.0 - pos.y*freq*-100.0)))) {
//     textureColor -= random(pos)*0.2;
//   }
//   textureColor -= haze(pos) * 0.2 ;

//       // // CANVAS TEXTURE
//     float bgR = 252.0 / 255.0;
//     float bgG = 252.0 / 255.0;
//     float bgB = 248.0 / 255.0; 
//     float threshold = 0.1;
//     bool isBG = abs(textureColor.r - bgR) < threshold && abs(textureColor.g - bgG) < threshold && abs(textureColor.b - bgB) < threshold; 


//     float noise = random(pos*10.0);

//     float horLineWeight = 400.0;//500.0;
//     float horFreq = 500.0;//600.0;
//     float horAmp= 0.5 * noise; //1.5
//     float horLayer = pos.y * horLineWeight + sin(pos.y * horFreq) * 0.1;
//     float horWave = sin(pos.x * horFreq) * horAmp;
//     bool isHorWave = mod(floor(horLayer + horWave), 2.0) == 0.0;

//     float vertLineWeight = 200.0;//300.0;
//     float vertFreq = 300.0;//400.0;
//     float vertAmp= 0.4 * noise; //1.5
//     float vertLayer = pos.x * vertLineWeight; //+ sin(pos.x * vertFreq) * 0.1;
//     float vertWave = sin(pos.y * vertFreq) * vertAmp;
//     bool isVertWave = mod(floor(vertLayer + vertWave), 2.0) == 0.0;


//     float amountRan = 1.0 + random(vec2(floor(pos.x*5.0), floor(pos.y*1000.0)) + rando) - (random(floor(pos*200.0)) * 0.4) - random(floor(pos*16.0)) * 0.2;
//     float darkness;//= 0.004 * amountRan;
//     if (isBG) {
//       darkness = 0.01 * amountRan;
//     } else {

//       float threshold = 0.2;
//       bool isBGBlended = abs(textureColor.r - bgR) < threshold && abs(textureColor.g - bgG) < threshold && abs(textureColor.b - bgB) < threshold; 

//       darkness = isBGBlended ? 0.01 : -0.002;
//       darkness *= amountRan ;
//     }
//     if(isHorWave && isVertWave) textureColor.rgb -= darkness;
//     if(isHorWave) textureColor.rgb -= darkness;
//     // // CANVAS TEXTURE END

 
//   gl_FragColor = textureColor;
// }