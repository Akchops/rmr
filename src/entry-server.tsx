import { renderToString } from 'react-dom/server';
import App from './App';

/** Build-time prerender entry: produces the static HTML shipped in dist. */
export function render(): string {
  return renderToString(<App />);
}
