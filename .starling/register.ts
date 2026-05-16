import { hc } from "hono/client";
import { readdirSync } from "node:fs";
import { resolve, join } from "node:path";
import type { AppType } from "../../starling/src/server";

const STARLING_URL = process.env.STARLING_URL ?? "http://localhost:3000";
const PROJECT = "plover-baby";
const client = hc<AppType>(STARLING_URL);

interface WorkflowModule {
  default: {
    steps: { name: string; prompt: string; allowedTools?: string[] }[];
  };
}

async function registerWorkflows(): Promise<void> {
  const dir = resolve(import.meta.dir, "workflows");
  const files = readdirSync(dir).filter((f) => f.endsWith(".ts"));
  for (const file of files) {
    const name = file.replace(/\.ts$/, "");
    const mod = (await import(join(dir, file))) as WorkflowModule;
    const res = await client.workflows.register.$post({
      json: { project: PROJECT, name, steps: mod.default.steps },
    });
    if (!res.ok) {
      throw new Error(
        `register workflow ${name} failed: ${res.status} ${await res.text()}`,
      );
    }
    const body = await res.json();
    if (!("workflowId" in body)) {
      throw new Error(`unexpected register response: ${JSON.stringify(body)}`);
    }
    console.log(`workflow registered: ${body.workflowId}`);
  }
}

async function registerTriggers(): Promise<void> {
  // Single Starling App means one bot identity for all roles. Handoffs
  // between bots are slash-command comments (richer context than labels
  // and reads like a normal PR thread). PO can also kick off lead-plan
  // via a label for click-not-type ergonomics.
  type FilterValue =
    | string
    | number
    | boolean
    | { contains: string }
    | { regex: string }
    | null;
  interface TriggerSpec {
    workflow: string;
    on: string;
    filter: Record<string, FilterValue>;
  }
  const triggers: TriggerSpec[] = [
    {
      workflow: "lead-plan",
      on: "github:issue_comment:created",
      filter: { "comment.body": { contains: "/plan" } },
    },
    {
      workflow: "swe-implement",
      on: "github:issue_comment:created",
      filter: { "comment.body": { contains: "/swe-implement" } },
    },
    {
      workflow: "lead-review-pr",
      on: "github:issue_comment:created",
      filter: { "comment.body": { contains: "/lead-review" } },
    },
    {
      workflow: "qa-test",
      on: "github:issue_comment:created",
      filter: { "comment.body": { contains: "/qa-test" } },
    },
    {
      workflow: "lead-merge",
      on: "github:issue_comment:created",
      filter: { "comment.body": { contains: "/lead-merge" } },
    },
    {
      // Fires whenever an issue closes; the workflow checks if it's the
      // last sub-issue of a parent and, if so, pings the PO. The filter
      // narrows to Plover sub-issues only (their body references the
      // parent via "Part of #N").
      workflow: "lead-wrap-up",
      on: "github:issues:closed",
      filter: { "issue.body": { contains: "Part of #" } },
    },
  ];

  for (const t of triggers) {
    const res = await client.triggers.register.$post({
      json: { project: PROJECT, ...t },
    });
    if (!res.ok) {
      throw new Error(
        `register trigger ${t.workflow} failed: ${res.status} ${await res.text()}`,
      );
    }
    const body = await res.json();
    if (!("triggerId" in body)) {
      throw new Error(`unexpected trigger response: ${JSON.stringify(body)}`);
    }
    console.log(
      `trigger registered: ${body.triggerId} → ${t.workflow} on ${t.on} where ${JSON.stringify(t.filter)}`,
    );
  }
}

async function main(): Promise<void> {
  const cmd = process.argv[2];
  if (cmd === "register") {
    await registerWorkflows();
    await registerTriggers();
    console.log("✓ done");
    return;
  }
  console.error(`unknown command: ${cmd ?? "<none>"}\nusage: bun run register`);
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
