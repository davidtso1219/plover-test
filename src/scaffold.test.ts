import { describe, it, expect } from "bun:test";
import { spawnSync } from "bun";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const root = resolve(import.meta.dir, "..");

describe("scaffold: project files exist", () => {
  it("package.json is present", () => {
    expect(existsSync(resolve(root, "package.json"))).toBe(true);
  });

  it("tsconfig.json is present", () => {
    expect(existsSync(resolve(root, "tsconfig.json"))).toBe(true);
  });

  it("src/index.ts is present", () => {
    expect(existsSync(resolve(root, "src/index.ts"))).toBe(true);
  });
});

describe("scaffold: package.json contents", () => {
  const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));

  it("has @types/bun in devDependencies", () => {
    expect(pkg.devDependencies).toBeDefined();
    expect(pkg.devDependencies["@types/bun"]).toBeDefined();
  });

  it("does not list @types/bun as a production dependency", () => {
    const prodDeps = pkg.dependencies ?? {};
    expect(prodDeps["@types/bun"]).toBeUndefined();
  });
});

describe("scaffold: tsconfig.json contents", () => {
  const tsconfig = JSON.parse(readFileSync(resolve(root, "tsconfig.json"), "utf8"));
  const opts = tsconfig.compilerOptions;

  it("has strict: true", () => {
    expect(opts.strict).toBe(true);
  });

  it("uses bundler moduleResolution", () => {
    expect(opts.moduleResolution?.toLowerCase()).toBe("bundler");
  });
});

describe("scaffold: bun run src/index.ts", () => {
  it("exits with code 0", () => {
    const result = spawnSync(["bun", "run", "src/index.ts"], { cwd: root });
    expect(result.exitCode).toBe(0);
  });

  it("prints 'Hello, world!' to stdout", () => {
    const result = spawnSync(["bun", "run", "src/index.ts"], { cwd: root });
    const stdout = new TextDecoder().decode(result.stdout).trim();
    expect(stdout).toBe("Hello, world!");
  });

  it("produces no output on stderr", () => {
    const result = spawnSync(["bun", "run", "src/index.ts"], { cwd: root });
    const stderr = new TextDecoder().decode(result.stderr).trim();
    expect(stderr).toBe("");
  });
});
