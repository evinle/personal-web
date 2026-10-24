import type * as ReactNS from 'react';
import type * as ReactDOMClientNS from 'react-dom/client';

/**
 * These sample pages are plain `<script>` tags loaded after React/ReactDOM UMD
 * builds in the design-system preview harness, not ES modules importing from
 * `node_modules` — so `window.React`/`window.ReactDOM` is the real shape at
 * runtime, and this is the one place that says so to the type checker.
 */
declare global {
  interface Window {
    React: typeof ReactNS;
    ReactDOM: typeof ReactDOMClientNS;
  }
}
