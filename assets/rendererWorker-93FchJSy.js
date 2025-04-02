(function(){"use strict";const m=(e,...t)=>console.log("[RENDERER] "+e,t);self.onmessage=e=>{const t=e.data;switch(t.messageType){case"submit":const s=t.job;try{g(s)}catch(o){self.postMessage({messageType:"error",error:o})}break;case"terminate":self.close();break}};const g=e=>{const{glsl:t,width:s,height:o,numFrames:n,frameTime:a}=e,f=new OffscreenCanvas(s,o),r=f.getContext("webgl2"),i=S(r,A,T+t+p),R=r.getUniformLocation(i,"iResolution"),E=r.getUniformLocation(i,"iTime"),L=r.getUniformLocation(i,"iMouse"),l=r.createBuffer();r.bindBuffer(r.ARRAY_BUFFER,l),r.bufferData(r.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,1,1,-1,1]),r.STATIC_DRAW);const d=r.getAttribLocation(i,"position");r.enableVertexAttribArray(d),r.vertexAttribPointer(d,2,r.FLOAT,!1,0,0);let c=0,h=0;const u=async()=>{if(c>=n){m("finished",c),self.postMessage({messageType:"completed",job:e});return}r.useProgram(i),r.uniform3f(R,s,o,1),r.uniform1f(E,h),r.uniform4f(L,0,0,0,0),r.drawArrays(r.TRIANGLE_FAN,0,4);const P=f.transferToImageBitmap();self.postMessage({messageType:"frame",frame:c,image:P}),c++,h+=a,requestAnimationFrame(u)};u(),m("rendering")},S=(e,t,s)=>{const o=e.createShader(e.VERTEX_SHADER);if(e.shaderSource(o,t),e.compileShader(o),!e.getShaderParameter(o,e.COMPILE_STATUS))throw new Error(e.getShaderInfoLog(o));const n=e.createShader(e.FRAGMENT_SHADER);if(e.shaderSource(n,s),e.compileShader(n),!e.getShaderParameter(n,e.COMPILE_STATUS))throw new Error(e.getShaderInfoLog(n));const a=e.createProgram();if(e.attachShader(a,o),e.attachShader(a,n),e.linkProgram(a),!e.getProgramParameter(a,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(a));return a},A=`#version 300 es

layout(location = 0) in vec2 position;

void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}
`,T=`#version 300 es
precision highp float;

out vec4 _fragColor;

uniform vec3 iResolution;
uniform float iTime;
uniform vec4 iMouse;
`,p=`
void main() {
    mainImage(_fragColor, gl_FragCoord.xy);
}
`})();
