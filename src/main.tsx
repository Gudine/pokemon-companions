import { render } from 'preact';
import { IconContext } from 'react-icons';
import { App } from './app.tsx';
import './index.css';
import '@fontsource/kodchasan';
import '@fontsource/kodchasan/700';
import '@fontsource-variable/nunito';

render(<IconContext.Provider value={{ className: "inline" }}>
  <App />
</IconContext.Provider>, document.body);
