attribute vec2 aTexCoord;
attribute vec3 aPosition;
varying vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;
  vTexCoord.y = 1.0 - vTexCoord.y;

  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = 2.0 * positionVec4.xy - 1.0;

  gl_Position = positionVec4;
}
