import { test, expect, describe } from "bun:test";
import { greet } from "./greet";

describe("greet", () => {
  test("returns 'Hello, world!' when called with no argument", () => {
    expect(greet()).toBe("Hello, world!");
  });

  test("returns 'Hello, <name>!' when called with a name", () => {
    expect(greet("Alice")).toBe("Hello, Alice!");
  });

  test("returns 'Hello, world!' when called with an empty string", () => {
    expect(greet("")).toBe("Hello, world!");
  });

  test("preserves the exact name including spaces and punctuation", () => {
    expect(greet("Dr. Smith")).toBe("Hello, Dr. Smith!");
  });
});
