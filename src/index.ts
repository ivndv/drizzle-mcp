import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { Hono } from "hono";
import { z } from "zod";
import { renderLandingPage } from "./views/landing.js";

// Tipos para la documentación indexada
export interface DrizzleDoc {
	path: string;
	title: string;
	category: string;
	dialect?: string;
	body: string;
}

// Variables globales para la caché en memoria de la instancia del Worker
let inMemoryDocs: DrizzleDoc[] | null = null;
let lastFetchedTime = 0;
const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 horas

const DRIZZLE_DOCS_URL = "https://orm.drizzle.team/llms-full.txt";
const INTERNAL_CACHE_URL = "https://drizzle-mcp-internal.cache/llms-full.txt";

// Detecta el dialecto a partir de la ruta del documento
function detectDialect(path: string): string | undefined {
	const p = path.toLowerCase();
	if (p.includes("/pg") || p.includes("postgresql") || p.includes("postgres")) return "postgresql";
	if (p.includes("/mysql") || p.includes("planetscale") || p.includes("tidb")) return "mysql";
	if (p.includes("/sqlite") || p.includes("/d1") || p.includes("turso") || p.includes("bun-sqlite")) return "sqlite";
	if (p.includes("singlestore")) return "singlestore";
	if (p.includes("cockroach")) return "cockroach";
	if (p.includes("gel")) return "gel";
	return undefined;
}

// Detecta la categoría a partir de la ruta del documento
function detectCategory(path: string): string {
	const parts = path.replace(/^\/docs\/?/, "").split("/");
	return parts[0] || "general";
}

// Parsea el archivo llms-full.txt en una lista de documentos estructurados
function parseDocs(rawText: string): DrizzleDoc[] {
	const sections = rawText.split(/\n(?=Source: https:\/\/orm\.drizzle\.team)/);
	const docs: DrizzleDoc[] = [];

	for (const section of sections) {
		const match = section.match(/^Source: https:\/\/orm\.drizzle\.team([^\n\r]+)/);
		if (match && match[1]) {
			const path = match[1].trim();
			const body = section.slice(match[0].length).trim();
			const titleMatch = body.match(/^#\s+([^\n\r]+)/m);
			const title = titleMatch && titleMatch[1] ? titleMatch[1].replace(/[`\\]/g, "").trim() : path;
			const dialect = detectDialect(path);
			const category = detectCategory(path);

			docs.push({
				path,
				title,
				category,
				dialect,
				body,
			});
		}
	}

	return docs;
}

// Obtiene los documentos con estrategia de dos niveles: memoria y Cloudflare Cache API
async function getDocs(forceRefresh = false): Promise<DrizzleDoc[]> {
	const now = Date.now();
	if (!forceRefresh && inMemoryDocs && now - lastFetchedTime < CACHE_TTL_MS) {
		return inMemoryDocs;
	}

	const cache = typeof caches !== "undefined" ? caches.default : null;
	const cacheKey = new Request(INTERNAL_CACHE_URL);

	if (!forceRefresh && cache) {
		const cachedRes = await cache.match(cacheKey);
		if (cachedRes) {
			const text = await cachedRes.text();
			inMemoryDocs = parseDocs(text);
			lastFetchedTime = now;
			return inMemoryDocs;
		}
	}

	// Fetch en vivo directamente a la fuente oficial de Drizzle
	const res = await fetch(DRIZZLE_DOCS_URL, {
		headers: { "User-Agent": "drizzle-mcp-worker/1.0" },
	});

	if (!res.ok) {
		if (inMemoryDocs) return inMemoryDocs;
		throw new Error(`Error al descargar documentación de Drizzle: HTTP ${res.status}`);
	}

	const rawText = await res.text();
	const parsed = parseDocs(rawText);

	inMemoryDocs = parsed;
	lastFetchedTime = now;

	// Guarda en Cache API de Cloudflare con TTL de 12 horas
	if (cache) {
		const cacheResponse = new Response(rawText, {
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				"Cache-Control": "public, max-age=43200",
			},
		});
		await cache.put(cacheKey, cacheResponse);
	}

	return parsed;
}

// Búsqueda ponderada de texto y dialecto sobre los documentos
export function searchDocs(docs: DrizzleDoc[], query: string, dialect?: string, limit = 5) {
	const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
	const results: Array<{
		doc: DrizzleDoc;
		score: number;
		snippet: string;
	}> = [];

	const targetDialect = dialect?.toLowerCase();

	for (const doc of docs) {
		// Filtro estricto de dialecto si fue especificado
		if (targetDialect) {
			const matchesDialect =
				doc.dialect === targetDialect ||
				doc.path.toLowerCase().includes(targetDialect) ||
				doc.title.toLowerCase().includes(targetDialect);
			if (!matchesDialect) continue;
		}

		let score = 0;
		const lowerTitle = doc.title.toLowerCase();
		const lowerPath = doc.path.toLowerCase();
		const lowerBody = doc.body.toLowerCase();

		let firstMatchPos = -1;

		for (const term of terms) {
			if (lowerTitle.includes(term)) score += 50;
			if (lowerPath.includes(term)) score += 30;

			const pos = lowerBody.indexOf(term);
			if (pos !== -1) {
				score += 15;
				if (firstMatchPos === -1 || pos < firstMatchPos) {
					firstMatchPos = pos;
				}
			}
		}

		if (score > 0) {
			// Extrae snippet contextual del primer término encontrado
			let snippet = "";
			if (firstMatchPos !== -1) {
				const start = Math.max(0, firstMatchPos - 80);
				const end = Math.min(doc.body.length, firstMatchPos + 180);
				snippet = (start > 0 ? "... " : "") + doc.body.slice(start, end).replace(/\s+/g, " ") + (end < doc.body.length ? " ..." : "");
			} else {
				snippet = doc.body.slice(0, 150).replace(/\s+/g, " ") + "...";
			}

			results.push({ doc, score, snippet });
		}
	}

	return results.sort((a, b) => b.score - a.score).slice(0, Math.min(limit, 15));
}

// Construye una instancia del servidor MCP con sus herramientas registradas
function buildMcpServer(docs: DrizzleDoc[]): McpServer {
	const server = new McpServer({
		name: "drizzle-orm-docs",
		version: "1.0.0",
	});

	// Herramienta de búsqueda en la documentación
	server.registerTool(
		"search_docs",
		{
			description: "Search Drizzle ORM official documentation by query, dialect, and topic.",
			inputSchema: {
				query: z.string().describe("Search query terms (e.g. 'relations query', 'd1 sqlite migrations', 'schema foreign keys')"),
				dialect: z.string().optional().describe("Filter by database dialect: 'sqlite', 'postgresql', 'mysql', 'd1', 'turso', 'singlestore'"),
				limit: z.number().optional().describe("Maximum number of results to return (default 5, max 15)"),
			},
		},
		async ({ query, dialect, limit }) => {
			const matches = searchDocs(docs, query, dialect, limit ?? 5);
			if (matches.length === 0) {
				return {
					content: [
						{
							type: "text",
							text: `No documentation found for query: "${query}"${dialect ? ` (dialect: ${dialect})` : ""}. Try broader terms or check available sections.`,
						},
					],
				};
			}

			const formatted = matches
				.map((m, idx) => {
					const url = `https://orm.drizzle.team${m.doc.path}`;
					return `${idx + 1}. **[${m.doc.title}](${url})**\n   - Path: \`${m.doc.path}\`\n   - Category: \`${m.doc.category}\`${m.doc.dialect ? ` | Dialect: \`${m.doc.dialect}\`` : ""}\n   - Excerpt: ${m.snippet}`;
				})
				.join("\n\n");

			return {
				content: [
					{
						type: "text",
						text: `Found ${matches.length} Drizzle ORM documentation results:\n\n${formatted}\n\nUse \`get_doc(path)\` to read full content of any document.`,
					},
				],
			};
		}
	);

	// Herramienta para obtener el contenido completo de un documento
	server.registerTool(
		"get_doc",
		{
			description: "Fetch full markdown content of a specific Drizzle ORM documentation page by path.",
			inputSchema: {
				path: z.string().describe("The document path or slug (e.g. '/docs/get-started/d1-new', 'd1-new', 'migrations')"),
			},
		},
		async ({ path }) => {
			const cleanPath = path.trim().toLowerCase();
			// Búsqueda exacta o coincidencia por sufijo/inclusión
			let found = docs.find((d) => d.path.toLowerCase() === cleanPath);
			if (!found) {
				found = docs.find((d) => d.path.toLowerCase().endsWith(cleanPath));
			}
			if (!found) {
				found = docs.find((d) => d.path.toLowerCase().includes(cleanPath));
			}

			if (!found) {
				const suggestions = searchDocs(docs, cleanPath, undefined, 5);
				const suggestionsText = suggestions.length > 0
					? `\n\nDid you mean one of these?\n` + suggestions.map((s) => `- \`${s.doc.path}\`: ${s.doc.title}`).join("\n")
					: "";
				return {
					content: [
						{
							type: "text",
							text: `Document not found for path: "${path}".${suggestionsText}`,
						},
					],
				};
			}

			const url = `https://orm.drizzle.team${found.path}`;
			return {
				content: [
					{
						type: "text",
						text: `# ${found.title}\nSource: ${url}\n\n${found.body}`,
					},
				],
			};
		}
	);

	// Herramienta de índice y listado de secciones principales
	server.registerTool(
		"list_sections",
		{
			description: "List all main categories and documentation topics available in Drizzle ORM.",
			inputSchema: {},
		},
		async () => {
			const categories = new Map<string, number>();
			for (const doc of docs) {
				categories.set(doc.category, (categories.get(doc.category) || 0) + 1);
			}

			const categoryList = Array.from(categories.entries())
				.sort((a, b) => b[1] - a[1])
				.map(([cat, count]) => `- **${cat}** (${count} docs)`)
				.join("\n");

			return {
				content: [
					{
						type: "text",
						text: `### Drizzle ORM Documentation Index\nTotal documents indexed: ${docs.length}\n\n**Categories:**\n${categoryList}\n\nUse \`search_docs(query)\` to search within these topics.`,
					},
				],
			};
		}
	);

	return server;
}

// Aplicación HTTP con Hono
const app = new Hono();

// Manejador del endpoint MCP con transporte HTTP estándar
app.all("/mcp", async (c) => {
	const req = c.req.raw;
	const docs = await getDocs();

	// Normaliza cabeceras de accept para clientes que solo envían application/json
	const accept = req.headers.get("accept") ?? "*/*";
	const headers = new Headers(req.headers);
	if (!accept.includes("text/event-stream")) {
		headers.set(
			"accept",
			accept.includes("application/json")
				? "application/json, text/event-stream"
				: "*/*, text/event-stream, application/json"
		);
	}

	const normalizedReq = new Request(req.url, {
		method: req.method,
		headers,
		body: req.body,
		// @ts-expect-error duplex exists in standard RequestInit for streaming
		duplex: "half",
	});

	const server = buildMcpServer(docs);
	const transport = new WebStandardStreamableHTTPServerTransport({
		sessionIdGenerator: undefined,
		enableJsonResponse: true,
	});

	await server.connect(transport);
	return transport.handleRequest(normalizedReq);
});

// Endpoint de salud
app.get("/health", async (c) => {
	const docs = await getDocs();
	return c.json({
		status: "ok",
		totalDocs: docs.length,
		lastFetched: new Date(lastFetchedTime).toISOString(),
		server: "drizzle-mcp-worker",
	});
});

// Endpoint para forzar refresco de caché
app.post("/refresh", async (c) => {
	const docs = await getDocs(true);
	return c.json({
		status: "refreshed",
		totalDocs: docs.length,
		updatedAt: new Date(lastFetchedTime).toISOString(),
	});
});

// Renderiza la página de aterrizaje modularizada
app.get("/", (c) => {
	const origin = new URL(c.req.url).origin;
	return c.html(renderLandingPage(origin));
});

export default app;
