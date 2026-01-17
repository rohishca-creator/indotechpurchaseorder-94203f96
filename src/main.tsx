import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error("Root element not found");
  document.body.innerHTML = '<div style="padding: 20px; text-align: center;"><h1>App failed to load</h1><p>Root element not found</p></div>';
}
