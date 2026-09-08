import { describe, expect, it } from "bun:test";
import app, { type DrizzleDoc, searchDocs } from "../src/index.ts";

describe("Drizzle MCP Worker", () => {
	const mockDocs: DrizzleDoc[] = [
		{
			path: "/docs/sqlite/batch-api",
			title: "Batch API",
			category: "sqlite",
			dialect: "sqlite",
			body: "Drizzle supports running SQL statements in a batch with SQLite and Cloudflare D1.",
		},
		{
			path: "/docs/get-started/postgresql-new",
			title: "Get Started with Drizzle and PostgreSQL",
			category: "get-started",
			dialect: "postgresql",
			body: "Connect to Postgres using node-postgres or postgres-js.",
		},
	];

	it("searches documents by query and dialect", () => {
		const results = searchDocs(mockDocs, "batch api", "sqlite");
		expect(results.length).toBeGreaterThan(0);
		expect(results[0]?.doc.title).toBe("Batch API");
	});

	it("filters by dialect strictly when provided", () => {
		const results = searchDocs(mockDocs, "batch", "postgresql");
		expect(results.length).toBe(0);
	});

	it("responds to /health endpoint", async () => {
		const res = await app.request("/health");
		expect(res.status).toBe(200);
		const json = (await res.json()) as { status: string };
		expect(json.status).toBe("ok");
	});

	it("serves the landing page on /", async () => {
		const res = await app.request("/");
		expect(res.status).toBe(200);
		const html = await res.text();
		expect(html).toContain("Drizzle ORM");
	});
});
