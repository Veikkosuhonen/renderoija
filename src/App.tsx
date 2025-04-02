import type { Component } from 'solid-js';
import { Form } from './Form';

const App: Component = () => {
  return (
    <>
      <header>
        <h1>Renderoija</h1>
      </header>
      <Form />
      <hr class="cs-hr" style={{ margin: '2rem 0' }} />
      <footer>
        <p>
          Style originally by{' '}
          <a class="cs-a" href="https://cs16.samke.me/">cs16.css</a>
        </p>
      </footer>
    </>
  );
};

export default App;
