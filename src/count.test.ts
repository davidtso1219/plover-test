import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import { existsSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";

const DATA_FILE = join(import.meta.dir, "..", "todos.json");
const CWD = join(import.meta.dir, "..");

function cleanup() {
  if (existsSync(DATA_FILE)) unlinkSync(DATA_FILE);
}

describe("CLI: count command", () => {
  beforeEach(cleanup);
  afterEach(cleanup);

  test("count with no todos.json prints 0 and exits 0", () => {
    const proc = Bun.spawnSync(["bun", "run", "src/index.ts", "count"], { cwd: CWD });
    expect(proc.exitCode).toBe(0);
    expect(proc.stdout.toString().trim()).toBe("0");
  });

  test("count with empty todos.json prints 0 and exits 0", () => {
    writeFileSync(DATA_FILE, "");
    const proc = Bun.spawnSync(["bun", "run", "src/index.ts", "count"], { cwd: CWD });
    expect(proc.exitCode).toBe(0);
    expect(proc.stdout.toString().trim()).toBe("0");
  });

  test("add then count prints 1", () => {
    Bun.spawnSync(["bun", "run", "src/index.ts", "add", "buy milk"], { cwd: CWD });
    const proc = Bun.spawnSync(["bun", "run", "src/index.ts", "count"], { cwd: CWD });
    expect(proc.exitCode).toBe(0);
    expect(proc.stdout.toString().trim()).toBe("1");
  });

  test("three adds then count prints 3", () => {
    Bun.spawnSync(["bun", "run", "src/index.ts", "add", "first"], { cwd: CWD });
    Bun.spawnSync(["bun", "run", "src/index.ts", "add", "second"], { cwd: CWD });
    Bun.spawnSync(["bun", "run", "src/index.ts", "add", "third"], { cwd: CWD });
    const proc = Bun.spawnSync(["bun", "run", "src/index.ts", "count"], { cwd: CWD });
    expect(proc.exitCode).toBe(0);
    expect(proc.stdout.toString().trim()).toBe("3");
  });

  test("count after done reflects new total", () => {
    Bun.spawnSync(["bun", "run", "src/index.ts", "add", "buy milk"], { cwd: CWD });
    Bun.spawnSync(["bun", "run", "src/index.ts", "add", "walk dog"], { cwd: CWD });
    Bun.spawnSync(["bun", "run", "src/index.ts", "done", "1"], { cwd: CWD });
    const proc = Bun.spawnSync(["bun", "run", "src/index.ts", "count"], { cwd: CWD });
    expect(proc.exitCode).toBe(0);
    expect(proc.stdout.toString().trim()).toBe("1");
  });
});
