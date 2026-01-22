import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

const rootElement = document.getElementById("root");

const renderFatal = (title: string, details?: string) => {
  const message = details ? `${title}\n\n${details}` : title;
  console.error(message);

  if (rootElement) {
    rootElement.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
        <div style="max-width:520px;text-align:center;">
          <h1 style="margin:0 0 12px;font-size:20px;line-height:1.2;">${title}</h1>
          ${details ? `<pre style="margin:0;white-space:pre-wrap;word-break:break-word;opacity:.75;">${details}</pre>` : ""}
        </div>
      </div>
    `;
  } else {
    document.body.innerHTML = `<pre style="padding:24px;white-space:pre-wrap;">${message}</pre>`;
  }
};

// Immediate boot screen (helps on slow mobile devices)
if (rootElement) {
  rootElement.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
      <div style="text-align:center;opacity:.75;">Loading…</div>
    </div>
  `;
}

// Helper to check if error is recoverable (AbortError or ResizeObserver)
const isRecoverableError = (err: unknown): boolean => {
  if (!err) return false;
  const error = err as { name?: string; message?: string };
  
  // AbortError is recoverable
  if (error.name === 'AbortError' || 
      (typeof error.message === 'string' && error.message.includes('signal is aborted'))) {
    return true;
  }
  
  // ResizeObserver loop errors are benign browser warnings, not real errors
  if (typeof error.message === 'string' && 
      error.message.includes('ResizeObserver loop')) {
    return true;
  }
  
  return false;
};

window.addEventListener("error", (e) => {
  const err = (e as ErrorEvent).error;
  // Recoverable errors - don't crash the app
  if (isRecoverableError(err) || isRecoverableError({ message: (e as ErrorEvent).message })) {
    console.warn('[app] Recoverable error caught:', err?.message || (e as ErrorEvent).message);
    e.preventDefault();
    return;
  }
  renderFatal("App failed to load", err?.message || (e as ErrorEvent).message);
});

window.addEventListener("unhandledrejection", (e) => {
  const reason = (e as PromiseRejectionEvent).reason;
  // Recoverable errors - don't crash the app
  if (isRecoverableError(reason)) {
    console.warn('[app] Recoverable error (rejection) caught:', reason?.message);
    e.preventDefault();
    return;
  }
  renderFatal("App failed to load", reason?.message || String(reason));
});

if (!rootElement) {
  renderFatal("App failed to load", "Root element not found");
} else {
  (async () => {
    try {
      // Dynamic import ensures we can catch failures that occur while importing the app bundle.
      const mod = await import("./App");
      const App = mod.default;
      createRoot(rootElement).render(
        <React.StrictMode>
          <App />
        </React.StrictMode>
      );
    } catch (err: any) {
      renderFatal("App failed to load", err?.message || String(err));
    }
  })();
}

