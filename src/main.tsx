
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import 'pm7-ui-style-guide/src/css/variables.css'
import 'pm7-ui-style-guide/src/globals.css'
import 'pm7-ui-style-guide/src/components/menu/pm7-menu.css'
import './index.css'

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
} else {
  createRoot(rootElement).render(<App />);
}
