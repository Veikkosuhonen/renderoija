import { createComputed, createSignal, Show, Switch } from "solid-js";
import { submitJob } from "./submitJob";
import { Codec, EncoderJobProgressMessage, RendererJobFrameMessage, WorkerStatus } from "./types";

export const Form = () => {
    let previewCanvas: HTMLCanvasElement | undefined = undefined;

    const [glsl, setGlsl] = createSignal(defaultGLSL);
    const [width, setWidth] = createSignal(256);
    const [height, setHeight] = createSignal(256);
    const [duration, setDuration] = createSignal(1);
    const [fps, setFps] = createSignal(30);
    const [bitrate, setBitrate] = createSignal(1_000_000);
    const [codec, setCodec] = createSignal<Codec>("vp09.00.10.08");

    const [frame, setFrame] = createSignal(0);
    const numFrames = () =>duration() * fps();
    const frameTime = () => 1 / fps();
    const progress = () => (frame() / (duration() * fps())) * 100;
    const [workerStatus, setWorkerStatus] = createSignal<WorkerStatus>("idle");
    const [error, setError] = createSignal("");

    

    const onSubmit = async (e: Event) => {
        e.preventDefault();

        setError("")

        const previewCtx = previewCanvas!.getContext('bitmaprenderer')!;

        const onFrame = (e: RendererJobFrameMessage) => {
            setFrame(e.frame);
            previewCtx.transferFromImageBitmap(e.image);
        };

        const onEncodedFrame = (e: EncoderJobProgressMessage) => {
            
        }

        setWorkerStatus("working");

        try {
            const result = await submitJob({
                glsl: glsl(),
                width: width(),
                height: height(),
                numFrames: numFrames(),
                frameTime: frameTime(),
                framerate: fps(),
                bitrate: bitrate(),
                codec: codec(),
            }, onFrame, onEncodedFrame);
        
            download(result.buffer)

            setWorkerStatus("completed");
        } catch (e) {
            const err = e as Error;
            console.error(err);
            setError(err.toString());
            setWorkerStatus("error");
        }
    }

    return (
        <form onSubmit={onSubmit}>
            <div style={{ display: 'flex', 'flex-direction': 'row', 'gap': '3rem' }}>
                <section>
                    <p>
                        ShaderToy compatible GLSL renderer.
                        <br />
                        Supports only single pass shaders.
                    </p>
                </section>

                <section>
                    <p>
                        Your code must implement:
                        <br />
                        void mainImage(out vec4 fragColor, in vec2 fragCoord)
                    </p>
                </section>

                <section>
                    <p>Uniforms:</p>
                    <ul style={{ 'list-style-type': 'none', 'padding': '0' }}>
                        <li>float iTime</li>
                        <li>vec2 iResolution</li>
                        <li>vec4 iMouse</li>
                    </ul>
                </section>
            </div>

            <hr class="cs-hr" style={{ 'margin-top': '1rem', 'margin-bottom': '1rem' }} />

            <div style={{ display: 'flex', 'flex-direction': 'row', 'margin-top': '1rem', gap: '1rem' }}>
                <section>
                    <textarea
                        class="cs-input"
                        placeholder="Paste GLSL"
                        value={glsl()}
                        disabled={workerStatus() !== "idle"}
                        onInput={(e) => setGlsl(e.currentTarget.value)}
                    />
                </section>

                <section style={{ display: 'flex', 'flex-direction': 'column', gap: '1rem' }}>
                    <div>
                        <input
                            type="number"
                            class="cs-input"
                            id="width"
                            value={width()}
                            disabled={workerStatus() !== "idle"}
                            onInput={(e) => setWidth(Number(e.currentTarget.value))}
                        />
                        <label class="cs-input__label" for="width">Width (px)</label>
                    </div>

                    <div>
                        <input
                            type="number"
                            class="cs-input"
                            id="height"
                            value={height()}
                            disabled={workerStatus() !== "idle"}
                            onInput={(e) => setHeight(Number(e.currentTarget.value))}
                        />
                        <label class="cs-input__label" for="height">Height (px)</label>
                    </div>

                    <div>
                        <input
                            type="number"
                            class="cs-input"
                            id="duration"
                            value={duration()}
                            disabled={workerStatus() !== "idle"}
                            onInput={(e) => setDuration(Number(e.currentTarget.value))}
                        />
                        <label class="cs-input__label" for="duration">Duration (seconds)</label>
                    </div>

                    <div>
                        <input
                            type="number"
                            class="cs-input"
                            id="fps"
                            value={fps()}
                            disabled={workerStatus() !== "idle"}
                            onInput={(e) => setFps(Number(e.currentTarget.value))}
                        />
                        <label class="cs-input__label" for="fps">FPS</label>
                    </div>

                    <div>
                        <p>Frames: {numFrames()}</p>
                        <p>Frame time: {frameTime().toFixed(3)}s</p>
                    </div>

                    <div>
                        <input
                            type="number"
                            class="cs-input"
                            id="bitrate"
                            value={bitrate()}
                            disabled={workerStatus() !== "idle"}
                            onInput={(e) => setBitrate(Number(e.currentTarget.value))}
                        />
                        <label class="cs-input__label" for="bitrate">Bitrate</label>
                    </div>

                    <div>
                        <p>Estimated file size: {(duration() * bitrate() / 8 / 1000).toFixed()} KB</p>
                    </div>

                    <button class="cs-btn" disabled={workerStatus() !== "idle"}>Begin render</button>

                    <Show when={workerStatus() === "working"}>
                        <div class="cs-progress-bar">
                            <div style={{ width: `${progress()}%` }} class="bars"></div>
                        </div>
                        <p>Rendering frame {frame() + 1} of {numFrames()}</p>
                    </Show>

                    <Show when={workerStatus() === "completed"}>
                        <p>Render completed!</p>
                    </Show>

                    <Show when={workerStatus() === "error"}>
                        <p>Render failed!</p>
                    </Show>

                    <p>{error()}</p>
                </section>

                <section>
                    <canvas ref={previewCanvas} class="cs-canvas" id="output" width={width()} height={height()}></canvas>
                </section>
            </div>
        </form>
    );
};

const download = (buffer: ArrayBuffer) => {
    const url = window.URL.createObjectURL(new Blob([ buffer ]));
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'render.webm';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
}

const defaultGLSL = `
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = fragCoord/iResolution.xy;

    // Time varying pixel color
    vec3 col = 0.5 + 0.5*cos(iTime+uv.xyx+vec3(0,2,4));

    // Output to screen
    fragColor = vec4(col,1.0);
}
`