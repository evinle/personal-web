import { vi } from 'vitest';

/** jsdom has no matchMedia. Answers each query from `matches`; anything else doesn't match. */
export function stubMatchMedia(matches: Readonly<Record<string, boolean>> = {}) {
  const listeners = new Set<() => void>();
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: matches[query] ?? false,
    media: query,
    addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
  }));
  return { notify: () => listeners.forEach((listener) => listener()) };
}

/** jsdom has no IntersectionObserver or layout. Lets a test say whether the observed element is onscreen. */
export function stubIntersectionObserver() {
  const callbacks = new Set<IntersectionObserverCallback>();
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      private readonly callback: IntersectionObserverCallback;

      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
        callbacks.add(callback);
      }

      observe() {
        return undefined;
      }

      disconnect() {
        callbacks.delete(this.callback);
      }
    },
  );
  return {
    setOnscreen(isIntersecting: boolean) {
      const entry = { isIntersecting };
      callbacks.forEach((callback) => {
        Reflect.apply(callback, undefined, [[entry], undefined]);
      });
    },
  };
}

/** jsdom doesn't implement scrollIntoView. */
export function stubScrollIntoView() {
  const scrollIntoView = vi.fn();
  Element.prototype.scrollIntoView = scrollIntoView;
  return scrollIntoView;
}

export function setTabVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, 'visibilityState', { value: state, configurable: true });
  document.dispatchEvent(new Event('visibilitychange'));
}
