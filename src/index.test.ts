import { test, expect } from "bun:test";
import { greet } from "./greet";

// Unit tests for greet()
test("greet with name returns 'Hello, <name>!'", () => {
  expect(greet("Alice")).toBe("Hello, Alice!");
});

test("greet with no argument returns 'Hello, world!'", () => {
  expect(greet()).toBe("Hello, world!");
});

// E2E tests for the CLI entry point
test("CLI: bun run src/index.ts Alice prints 'Hello, Alice!'", () => {
  const proc = Bun.spawnSync(["bun", "run", "src/index.ts", "Alice"], {
    cwd: import.meta.dir + "/..",
  });
  expect(proc.stdout.toString().trim()).toBe("Hello, Alice!");
  expect(proc.exitCode).toBe(0);
});

test("CLI: bun run src/index.ts (no args) prints 'Hello, world!'", () => {
  const proc = Bun.spawnSync(["bun", "run", "src/index.ts"], {
    cwd: import.meta.dir + "/..",
  });
  expect(proc.stdout.toString().trim()).toBe("Hello, world!");
  expect(proc.exitCode).toBe(0);
});

// Edge case: extra args are ignored (only first is used)
test("CLI: extra arguments beyond the first are ignored", () => {
  const proc = Bun.spawnSync(["bun", "run", "src/index.ts", "Bob", "Carol"], {
    cwd: import.meta.dir + "/..",
  });
  expect(proc.stdout.toString().trim()).toBe("Hello, Bob!");
  expect(proc.exitCode).toBe(0);
});
