
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import 'pm7-ui-style-guide/src/css/variables.css'
import 'pm7-ui-style-guide/src/globals.css'
import 'pm7-ui-style-guide/src/components/menu/pm7-menu.css'
import 'pm7-ui-style-guide/src/components/dialog/pm7-dialog.css'

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
} else {
  createRoot(rootElement).render(<App />);
}
