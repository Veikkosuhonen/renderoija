import type { Component } from 'solid-js';
import { Form } from './Form';

const App: Component = () => {
    return (
        <>
            <footer style={{ display: "flex", gap: "3rem" }}>
                <p>
                    Brought to you by veik
                </p>
                <p>
                    <a class="cs-a" href="https://github.com/Veikkosuhonen/renderoija">Github</a>
                </p>
                <p>
                    Style {' '}
                    <a class="cs-a" href="https://cs16.samke.me/">cs16.css</a>
                </p>
                <p>
                    Muxing {' '}
                    <a class="cs-a" href="https://github.com/Vanilagy/webm-muxer">Vanilagy/webm-muxer</a>
                </p>
            </footer>
            <hr class="cs-hr" style={{ margin: '0.5rem 0' }} />
            <header style={{ "padding-top": "2rem", "padding-bottom": "2rem" }}>
                <h1>Renderoija</h1>
                <div style={{ display: 'flex', 'flex-direction': 'row', 'gap': '3rem' }}>
                    <section>
                        <p>
                            ShaderToy compatible GLSL to webm video renderer.
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
                            <li>vec4 iMouse (0, 0, 0, 0)</li>
                        </ul>
                    </section>
                </div>
            </header>
            <hr class="cs-hr" style={{ 'margin-bottom': '1rem' }} />
            <Form />
        </>
    );
};

export default App;
