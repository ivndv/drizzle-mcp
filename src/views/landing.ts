// Genera el HTML de la página de aterrizaje con tema dark y configuraciones de clientes
export function renderLandingPage(origin: string): string {
	return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
	<meta charset="utf-8">
	<title>Drizzle ORM · Remote MCP Server</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="description" content="High-performance remote Model Context Protocol (MCP) server for Drizzle ORM documentation running on Cloudflare Edge.">
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
	<style>
		:root {
			--bg: #07080a;
			--surface: #0f1117;
			--surface-hover: #161922;
			--border: #1f2330;
			--border-accent: #2e3447;
			--text-primary: #f3f4f6;
			--text-secondary: #94a3b8;
			--text-muted: #64748b;
			--accent: #C5F74F;
			--accent-glow: rgba(197, 247, 79, 0.15);
			--accent-text: #050608;
			--blue-accent: #38bdf8;
		}
		* { box-sizing: border-box; margin: 0; padding: 0; }
		body {
			background-color: var(--bg);
			color: var(--text-primary);
			font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
			line-height: 1.6;
			min-height: 100vh;
			position: relative;
			overflow-x: hidden;
		}
		.grid-background {
			position: absolute;
			inset: 0;
			background-image: radial-gradient(circle at 50% 0%, rgba(197, 247, 79, 0.06) 0%, transparent 60%),
				linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
				linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
			background-size: 100% 100%, 40px 40px, 40px 40px;
			pointer-events: none;
			z-index: 0;
		}
		.container {
			max-width: 960px;
			margin: 0 auto;
			padding: 5rem 1.5rem 6rem;
			position: relative;
			z-index: 1;
		}
		.badge-row {
			display: flex;
			align-items: center;
			gap: 0.75rem;
			margin-bottom: 1.5rem;
			flex-wrap: wrap;
		}
		.badge {
			display: inline-flex;
			align-items: center;
			gap: 0.45rem;
			padding: 0.3rem 0.75rem;
			border-radius: 9999px;
			font-size: 0.8rem;
			font-weight: 600;
			border: 1px solid var(--border);
			background: var(--surface);
			color: var(--text-secondary);
		}
		.badge-pulse {
			width: 7px;
			height: 7px;
			border-radius: 50%;
			background: #22c55e;
			box-shadow: 0 0 10px #22c55e;
			animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
		}
		@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .4; } }
		.hero-title {
			font-size: clamp(2.2rem, 5vw, 3.4rem);
			font-weight: 700;
			letter-spacing: -0.035em;
			line-height: 1.15;
			margin-bottom: 1rem;
		}
		.hero-title span {
			background: linear-gradient(135deg, #ffffff 40%, var(--accent) 100%);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
		}
		.hero-subtitle {
			font-size: 1.1rem;
			color: var(--text-secondary);
			max-width: 680px;
			margin-bottom: 2.5rem;
		}
		.card {
			background: var(--surface);
			border: 1px solid var(--border);
			border-radius: 12px;
			padding: 1.75rem;
			margin-bottom: 2rem;
			box-shadow: 0 20px 40px -15px rgba(0,0,0,0.5);
			position: relative;
			overflow: hidden;
		}
		.card::before {
			content: "";
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			height: 1px;
			background: linear-gradient(90deg, transparent, var(--border-accent), transparent);
		}
		.card-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 1.25rem;
		}
		.card-title {
			font-size: 1.05rem;
			font-weight: 600;
			letter-spacing: -0.01em;
			display: flex;
			align-items: center;
			gap: 0.5rem;
		}
		.tabs {
			display: flex;
			gap: 0.5rem;
			margin-bottom: 1rem;
			border-bottom: 1px solid var(--border);
			padding-bottom: 0.5rem;
		}
		.tab-btn {
			background: transparent;
			border: none;
			color: var(--text-muted);
			font-family: inherit;
			font-size: 0.85rem;
			font-weight: 600;
			padding: 0.4rem 0.8rem;
			border-radius: 6px;
			cursor: pointer;
			transition: all 0.15s ease;
		}
		.tab-btn.active {
			background: var(--surface-hover);
			color: var(--text-primary);
			border: 1px solid var(--border);
		}
		.code-block {
			background: #06070a;
			border: 1px solid var(--border);
			border-radius: 8px;
			padding: 1.2rem;
			font-family: 'JetBrains Mono', monospace;
			font-size: 0.85rem;
			color: #e2e8f0;
			overflow-x: auto;
			position: relative;
		}
		.copy-btn {
			position: absolute;
			top: 0.75rem;
			right: 0.75rem;
			background: var(--surface);
			border: 1px solid var(--border);
			color: var(--text-secondary);
			font-family: inherit;
			font-size: 0.75rem;
			font-weight: 600;
			padding: 0.35rem 0.7rem;
			border-radius: 6px;
			cursor: pointer;
			transition: all 0.2s;
		}
		.copy-btn:hover {
			background: var(--surface-hover);
			color: var(--text-primary);
			border-color: var(--border-accent);
		}
		.tools-grid {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
			gap: 1.25rem;
			margin-top: 1rem;
		}
		.tool-item {
			background: #08090e;
			border: 1px solid var(--border);
			border-radius: 8px;
			padding: 1.25rem;
			transition: border-color 0.2s;
		}
		.tool-item:hover {
			border-color: var(--border-accent);
		}
		.tool-name {
			font-family: 'JetBrains Mono', monospace;
			font-size: 0.95rem;
			font-weight: 600;
			color: var(--accent);
			margin-bottom: 0.4rem;
		}
		.tool-desc {
			font-size: 0.85rem;
			color: var(--text-secondary);
			line-height: 1.5;
		}
		.tool-params {
			margin-top: 0.75rem;
			font-family: 'JetBrains Mono', monospace;
			font-size: 0.75rem;
			color: var(--text-muted);
		}
		.endpoints-table {
			width: 100%;
			border-collapse: collapse;
			font-size: 0.85rem;
			margin-top: 1rem;
		}
		.endpoints-table th, .endpoints-table td {
			text-align: left;
			padding: 0.75rem 1rem;
			border-bottom: 1px solid var(--border);
		}
		.endpoints-table th {
			color: var(--text-muted);
			font-weight: 600;
			text-transform: uppercase;
			font-size: 0.75rem;
			letter-spacing: 0.05em;
		}
		.method-badge {
			font-family: 'JetBrains Mono', monospace;
			font-size: 0.7rem;
			font-weight: 700;
			padding: 0.2rem 0.5rem;
			border-radius: 4px;
			display: inline-block;
		}
		.method-post { background: rgba(56, 189, 248, 0.15); color: #38bdf8; }
		.method-get { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
		.method-all { background: rgba(197, 247, 79, 0.15); color: var(--accent); }
		footer {
			margin-top: 4rem;
			text-align: center;
			font-size: 0.85rem;
			color: var(--text-muted);
			border-top: 1px solid var(--border);
			padding-top: 2rem;
		}
		footer a {
			color: var(--text-secondary);
			text-decoration: none;
			transition: color 0.15s;
		}
		footer a:hover {
			color: var(--accent);
		}
	</style>
</head>
<body>
	<div class="grid-background"></div>
	<div class="container">
		<div class="badge-row">
			<div class="badge">
				<span class="badge-pulse"></span>
				<span>Edge Operational · 487 Docs Indexed</span>
			</div>
			<div class="badge">
				<span>Streamable HTTP / JSON-RPC 2.0</span>
			</div>
			<div class="badge">
				<span>Cloudflare Workers</span>
			</div>
		</div>

		<h1 class="hero-title">Drizzle ORM <span>MCP Server</span></h1>
		<p class="hero-subtitle">
			High-performance Model Context Protocol server exposing the latest official Drizzle ORM documentation, live search, and schema guides to AI coding assistants.
		</p>

		<div class="card">
			<div class="card-header">
				<div class="card-title">⚡ Client Configurations</div>
				<span id="config-path" style="font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: var(--accent); background: rgba(197, 247, 79, 0.1); padding: 0.25rem 0.6rem; border-radius: 4px; border: 1px solid rgba(197, 247, 79, 0.2);">Standard MCP / JSON-RPC</span>
			</div>
			<div class="tabs" style="overflow-x: auto; flex-wrap: nowrap; padding-bottom: 0.6rem;">
				<button class="tab-btn active" onclick="showConfig('generic')">Standard</button>
				<button class="tab-btn" onclick="showConfig('claude')">Claude Desktop</button>
				<button class="tab-btn" onclick="showConfig('opencode')">OpenCode</button>
				<button class="tab-btn" onclick="showConfig('vscode')">VS Code</button>
				<button class="tab-btn" onclick="showConfig('gemini')">Gemini / AGY</button>
				<button class="tab-btn" onclick="showConfig('cursor')">Cursor</button>
				<button class="tab-btn" onclick="showConfig('windsurf')">Windsurf</button>
				<button class="tab-btn" onclick="showConfig('cline')">Cline / Roo</button>
			</div>
			<div class="code-block" id="code-content">
				<button class="copy-btn" onclick="copyCode()">Copy</button>
				<pre><code id="json-code">{
  "mcpServers": {
    "drizzle-orm": {
      "serverUrl": "${origin}/mcp"
    }
  }
}</code></pre>
			</div>
		</div>

		<div class="card">
			<div class="card-header">
				<div class="card-title">🛠️ Available MCP Tools</div>
			</div>
			<div class="tools-grid">
				<div class="tool-item">
					<div class="tool-name">search_docs</div>
					<div class="tool-desc">Full-text search across 487 Drizzle ORM documentation pages with contextual code snippets and relevance ranking.</div>
					<div class="tool-params">query: string · dialect?: string · limit?: number</div>
				</div>
				<div class="tool-item">
					<div class="tool-name">get_doc</div>
					<div class="tool-desc">Retrieves the complete markdown content of any documentation page, guide, or tutorial by path or keyword.</div>
					<div class="tool-params">path: string (e.g. "/docs/sqlite/batch-api")</div>
				</div>
				<div class="tool-item">
					<div class="tool-name">list_sections</div>
					<div class="tool-desc">Provides a high-level catalog of documentation categories, supported dialects, and available topic sections.</div>
					<div class="tool-params">No parameters required</div>
				</div>
			</div>
		</div>

		<div class="card">
			<div class="card-header">
				<div class="card-title">🌐 Edge Endpoints</div>
			</div>
			<table class="endpoints-table">
				<thead>
					<tr>
						<th>Method</th>
						<th>Path</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td><span class="method-badge method-all">ALL</span></td>
						<td><code>/mcp</code></td>
						<td>Streamable HTTP JSON-RPC 2.0 endpoint for MCP clients</td>
					</tr>
					<tr>
						<td><span class="method-badge method-get">GET</span></td>
						<td><code>/health</code></td>
						<td>Returns edge health, indexed doc count, and sync timestamp</td>
					</tr>
					<tr>
						<td><span class="method-badge method-post">POST</span></td>
						<td><code>/refresh</code></td>
						<td>Forces upstream cache revalidation from orm.drizzle.team</td>
					</tr>
				</tbody>
			</table>
		</div>

		<footer>
			<p>Powered by <a href="https://orm.drizzle.team" target="_blank">Drizzle ORM</a> & <a href="https://workers.cloudflare.com" target="_blank">Cloudflare Edge Workers</a> · Built with <a href="https://github.com/modelcontextprotocol" target="_blank">MCP SDK</a></p>
		</footer>
	</div>

	<script>
		const configData = {
			generic: {
				path: "Standard MCP / JSON-RPC",
				code: {
					mcpServers: {
						"drizzle-orm": {
							serverUrl: "${origin}/mcp"
						}
					}
				}
			},
			claude: {
				path: "claude_desktop_config.json",
				code: {
					mcpServers: {
						"drizzle-orm": {
							serverUrl: "${origin}/mcp"
						}
					}
				}
			},
			opencode: {
				path: "opencode.json",
				code: {
					"$schema": "https://opencode.ai/config.json",
					"mcp": {
						"drizzle-orm": {
							"type": "remote",
							"url": "${origin}/mcp"
						}
					}
				}
			},
			vscode: {
				path: ".vscode/mcp.json",
				code: {
					servers: {
						"drizzle-orm": {
							type: "http",
							url: "${origin}/mcp"
						}
					}
				}
			},
			gemini: {
				path: "~/.gemini/config/mcp_config.json",
				code: {
					mcpServers: {
						"drizzle-orm": {
							serverUrl: "${origin}/mcp"
						}
					}
				}
			},
			cursor: {
				path: ".cursor/mcp.json",
				code: {
					mcpServers: {
						"drizzle-orm": {
							url: "${origin}/mcp"
						}
					}
				}
			},
			windsurf: {
				path: "~/.codeium/windsurf/mcp_config.json",
				code: {
					mcpServers: {
						"drizzle-orm": {
							serverUrl: "${origin}/mcp"
						}
					}
				}
			},
			cline: {
				path: "cline_mcp_settings.json",
				code: {
					mcpServers: {
						"drizzle-orm": {
							url: "${origin}/mcp",
							autoApprove: []
						}
					}
				}
			}
		};

		function showConfig(key) {
			document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
			event.target.classList.add('active');
			const item = configData[key];
			document.getElementById('config-path').textContent = item.path;
			document.getElementById('json-code').textContent = JSON.stringify(item.code, null, 2);
		}

		function copyCode() {
			const text = document.getElementById('json-code').textContent;
			navigator.clipboard.writeText(text);
			const btn = document.querySelector('.copy-btn');
			btn.textContent = 'Copied!';
			setTimeout(() => btn.textContent = 'Copy', 2000);
		}
	</script>
</body>
</html>`;
}
