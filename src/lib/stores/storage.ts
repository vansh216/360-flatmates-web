import { createJSONStorage, type StateStorage } from "zustand/middleware";

const memory = new Map<string, string>();

const memoryStorage: StateStorage = {
  getItem: (name) => memory.get(name) ?? null,
  setItem: (name, value) => {
    memory.set(name, value);
  },
  removeItem: (name) => {
    memory.delete(name);
  }
};

function getStorage(): StateStorage {
  if (typeof window === "undefined" || !window.localStorage) {
    return memoryStorage;
  }

  return window.localStorage;
}

export function createSafeJsonStorage() {
  return createJSONStorage(getStorage);
}

