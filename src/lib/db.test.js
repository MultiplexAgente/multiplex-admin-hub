import { beforeEach, expect, mock, test } from "bun:test";

const writes = [];
const result = { data: { id: "agent-1", name: "Support" }, error: null };
const chain = {
  update(payload) { writes.push({ operation: "update", payload }); return this; },
  insert(payload) { writes.push({ operation: "insert", payload }); return this; },
  eq() { return this; },
  select() { return this; },
  maybeSingle() { return Promise.resolve(result); },
  then(resolve, reject) { return Promise.resolve(result).then(resolve, reject); },
};
mock.module("@/integrations/supabase/client", () => ({ supabase: { from: () => chain } }));
const { saveAgent, inviteTeamMember, updateTeamMember } = await import("./db");

beforeEach(() => { writes.length = 0; });

test("agent toggles omit untouched fields instead of sending undefined", async () => {
  await saveAgent({ id: "agent-1", active: false });
  expect(writes).toEqual([{ operation: "update", payload: { active: false } }]);
});

test("agent creation includes required name and company while preserving null and zero", async () => {
  await saveAgent({ name: "Support", description: null, temperature: 0 }, "company-1");
  expect(writes[0]).toEqual({ operation: "insert", payload: {
    name: "Support", description: null, temperature: 0, company_id: "company-1",
  } });
});

test("missing company blocks agent creation and invitations before sending a request", async () => {
  await expect(saveAgent({ name: "Support" }, null)).rejects.toThrow();
  await expect(inviteTeamMember("test@example.com", "operator", null)).rejects.toThrow();
  expect(writes).toEqual([]);
});

test("team updates preserve false and invitations send a non-null company", async () => {
  await updateTeamMember("member-1", { active: false });
  await inviteTeamMember("test@example.com", "operator", "company-1");
  expect(writes).toEqual([
    { operation: "update", payload: { active: false } },
    { operation: "insert", payload: { email: "test@example.com", role: "operator", active: true, company_id: "company-1" } },
  ]);
});

test("team partial updates omit undefined while preserving explicit nullable user_id", async () => {
  await updateTeamMember("member-1", { role: "viewer", active: undefined, user_id: null });
  expect(writes).toEqual([
    { operation: "update", payload: { role: "viewer", user_id: null } },
  ]);
});