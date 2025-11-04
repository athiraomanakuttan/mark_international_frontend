// Shim/normalize localStorage in non-browser runtimes.
// Some Node flags or runtimes may expose a global `localStorage` object
// that does not have the standard methods. That can cause errors like
// `localStorage.getItem is not a function` when server-side bundles attempt
// to access it. This module makes `localStorage` safe to call on the server
// by providing no-op implementations when needed.

declare const global: any;

function makeStub() {
  return {
    getItem: (_: string) => null,
    setItem: (_: string, __: string) => {},
    removeItem: (_: string) => {},
    clear: () => {},
  };
}

export function ensureSafeLocalStorage() {
  try {
    // If localStorage exists but methods are not functions, replace with stub
    if (typeof globalThis !== 'undefined') {
      const ls = (globalThis as any).localStorage;
      if (typeof ls === 'undefined' || ls === null) {
        // nothing to do — leave undefined so client checks pass
        return;
      }
      const hasGet = typeof ls.getItem === 'function';
      const hasSet = typeof ls.setItem === 'function';
      const hasRemove = typeof ls.removeItem === 'function';
      if (!hasGet || !hasSet || !hasRemove) {
        // Replace with a no-op shim so server-side code that (incorrectly)
        // calls localStorage won't throw.
        try {
          (globalThis as any).localStorage = makeStub();
        } catch (e) {
          // ignore
        }
      }
    }
  } catch (e) {
    // swallow any errors — failing safe
  }
}

// Run immediately when imported
ensureSafeLocalStorage();
