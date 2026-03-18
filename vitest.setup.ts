import "@testing-library/jest-dom";

// Mock IndexedDB
if (typeof window !== "undefined") {
  if (!window.indexedDB) {
    // @ts-expect-error
    window.indexedDB = {
      databases: () => Promise.resolve([]),
    };
  } else {
    Object.defineProperty(window.indexedDB, "databases", {
      value: () => Promise.resolve([]),
      writable: true,
      configurable: true,
    });
  }
}
