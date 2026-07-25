import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Explicit, not relying on Testing Library's auto-cleanup (which needs
// `test.globals: true` to detect Vitest's afterEach) — this project keeps
// globals off everywhere else, so this is the one place cleanup is wired
// by hand.
afterEach(() => {
  cleanup();
});
