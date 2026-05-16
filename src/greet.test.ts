import { test, expect, describe } from "bun:test";
import { greet } from "./greet";

describe("greet", () => {
  // Acceptance criteria happy paths
  test("returns 'Hello, alice!' for greet('alice')", () => {
    expect(greet("alice")).toBe("Hello, alice!");
  });

  test("returns 'Hello, world!' for greet('') (empty string)", () => {
    expect(greet("")).toBe("Hello, world!");
  });

  test("returns 'Hello, world!' for greet() (no argument)", () => {
    expect(greet()).toBe("Hello, world!");
  });

  // Edge cases
  test("returns 'Hello, world!' for greet(undefined) (explicit undefined)", () => {
    expect(greet(undefined)).toBe("Hello, world!");
  });

  test("treats whitespace-only name as truthy and interpolates it", () => {
    expect(greet("   ")).toBe("Hello,    !");
  });
});
