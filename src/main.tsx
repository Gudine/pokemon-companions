import { render } from 'preact';
import { IconContext } from 'react-icons';
import { App } from './app.tsx';
import './index.css';

render(<IconContext.Provider value={{ className: "inline" }}>
  <App />
</IconContext.Provider>, document.body);
