import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
// Base layer first: component stylesheets must be able to override it.
import './styles/global.css';
import App from './App';

const root = document.getElementById('root')!;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// dist/index.html ships prerendered markup so the page works without
// JavaScript; hydrate it rather than throwing it away and re-rendering.
if (root.firstElementChild) {
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}
