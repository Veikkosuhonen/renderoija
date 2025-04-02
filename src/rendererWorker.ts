import { RendererHostMessage, JobParams } from "./types";

const log = (msg: string, ...rest: any) => console.log("[RENDERER] " + msg, rest)

self.onmessage = (event) => {
    const message = event.data as RendererHostMessage;
    switch (message.messageType) {
        case "submit":
            const job = message.job as JobParams;
            try {
                render(job);
            } catch (e) {
                self.postMessage({ messageType: "error", error: e });
            }
            break;
        case "terminate":
            self.close();
            break;
    }
};

/**
 * 
 */
const render = (job: JobParams) => {
    const { glsl, width, height, numFrames, frameTime } = job;

    const canvas = new OffscreenCanvas(width, height);
    const gl = canvas.getContext('webgl2')!;

    const program = createShaderProgram(gl, vertexShaderSource, fragmentShaderPrelude + glsl + fragmentShaderPostlude);

    // Set up uniforms
    const iResolutionLocation = gl.getUniformLocation(program, "iResolution")!;
    const iTimeLocation = gl.getUniformLocation(program, "iTime")!;
    const iMouseLocation = gl.getUniformLocation(program, "iMouse")!;

    // Set up attributes
    const positionBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, 1, 1, -1, 1]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    let frame = 0;
    let time = 0;

    const renderFrame = async () => {
        gl.useProgram(program);

        gl.uniform3f(iResolutionLocation, width, height, 1);
        gl.uniform1f(iTimeLocation, time);
        gl.uniform4f(iMouseLocation, 0, 0, 0, 0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

        const image = canvas.transferToImageBitmap();

        self.postMessage({ messageType: "frame", frame, image });

        frame++;
        time += frameTime;
    };

    log("rendering")

    while (true) {
        if (frame >= numFrames) {
            log("finished", frame)
            self.postMessage({ messageType: "completed", job });
            break;
        }
        renderFrame();
    }
};

const createShaderProgram = (gl: WebGL2RenderingContext, vertexShaderSource: string, fragmentShaderSource: string) => {
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(vertexShader)!);
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(fragmentShader)!);
    }

    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(program)!);
    }

    return program;
}

const vertexShaderSource = `#version 300 es

layout(location = 0) in vec2 position;

void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShaderPrelude = `#version 300 es
precision highp float;

out vec4 _fragColor;

uniform vec3 iResolution;
uniform float iTime;
uniform vec4 iMouse;
`;

const fragmentShaderPostlude = `
void main() {
    mainImage(_fragColor, gl_FragCoord.xy);
}
`;