(function(){"use strict";const m=(e,...t)=>console.log("[RENDERER] "+e,t);self.onmessage=e=>{const t=e.data;switch(t.messageType){case"submit":const i=t.job;try{u(i)}catch(r){self.postMessage({messageType:"error",error:r})}break;case"terminate":self.close();break}};const u=e=>{const{glsl:t,width:i,height:r,numFrames:n,frameTime:a}=e,f=new OffscreenCanvas(i,r),o=f.getContext("webgl2"),s=g(o,S,A+t+T),p=o.getUniformLocation(s,"iResolution"),L=o.getUniformLocation(s,"iTime"),R=o.getUniformLocation(s,"iFrame"),l=o.getUniformLocation(s,"iMouse"),E=o.createBuffer();o.bindBuffer(o.ARRAY_BUFFER,E),o.bufferData(o.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,1,1,-1,1]),o.STATIC_DRAW);const d=o.getAttribLocation(s,"position");o.enableVertexAttribArray(d),o.vertexAttribPointer(d,2,o.FLOAT,!1,0,0);let c=0,h=0;const P=async()=>{o.useProgram(s),o.uniform3f(p,i,r,1),o.uniform1f(L,h),o.uniform1i(R,c),o.uniform4f(l,0,0,0,0),o.drawArrays(o.TRIANGLE_FAN,0,4);const v=f.transferToImageBitmap();self.postMessage({messageType:"frame",frame:c,image:v}),c++,h+=a};for(m("rendering");;){if(c>=n){m("finished",c),self.postMessage({messageType:"completed",job:e});break}P()}},g=(e,t,i)=>{const r=e.createShader(e.VERTEX_SHADER);if(e.shaderSource(r,t),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS))throw new Error(e.getShaderInfoLog(r));const n=e.createShader(e.FRAGMENT_SHADER);if(e.shaderSource(n,i),e.compileShader(n),!e.getShaderParameter(n,e.COMPILE_STATUS))throw new Error(e.getShaderInfoLog(n));const a=e.createProgram();if(e.attachShader(a,r),e.attachShader(a,n),e.linkProgram(a),!e.getProgramParameter(a,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(a));return a},S=`#version 300 es

layout(location = 0) in vec2 position;

void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}
`,A=`#version 300 es
precision highp float;

out vec4 _fragColor;

uniform vec3 iResolution;
uniform float iTime;
uniform int iFrame;
uniform vec4 iMouse;
`,T=`
void main() {
    mainImage(_fragColor, gl_FragCoord.xy);
}
`})();
