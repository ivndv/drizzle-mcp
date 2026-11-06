# drizzle-mcp

## Descripción

Servidor MCP que expone la documentación oficial de Drizzle ORM a asistentes de IA. Indexa el contenido de `orm.drizzle.team/llms-full.txt` y lo sirve por HTTP para que un cliente MCP pueda buscar, listar y leer páginas sin salir de la conversación.

Corre como Cloudflare Worker y mantiene el índice en caché durante 12 horas.

## Características

- **Búsqueda por tema y dialecto**: PostgreSQL, MySQL, SQLite, D1, Turso, PlanetScale y más.
- **Lectura de páginas**: devuelve el Markdown completo de cualquier documento por su ruta.
- **Índice de categorías**: lista todas las secciones disponibles.
- **Caché de 12 horas**: evita descargar la documentación en cada petición.
- **Transporte HTTP**: compatible con el SDK de MCP para conexiones remotas.

## Endpoints

| Método | Ruta | Qué hace |
|---|---|---|
| `ALL` | `/mcp` | Endpoint MCP (JSON-RPC) |
| `GET` | `/health` | Estado, total de documentos y última actualización |
| `POST` | `/refresh` | Fuerza la recarga del índice |
| `GET` | `/` | Página de presentación |

## Herramientas MCP

| Herramienta | Qué hace |
|---|---|
| `search_docs` | Busca en la documentación por consulta, dialecto y tema |
| `get_doc` | Devuelve el Markdown completo de una página |
| `list_sections` | Lista categorías y temas disponibles |

## Uso

Conecta el cliente MCP al endpoint remoto:

```json
{
  "mcpServers": {
    "drizzle": {
      "type": "http",
      "url": "https://drizzle-mcp.liuma.app/mcp"
    }
  }
}
```

## Tecnologías Utilizadas

- **Runtime**: Cloudflare Workers
- **Framework**: Hono
- **Protocolo**: Model Context Protocol (`@modelcontextprotocol/sdk`)
- **Validación**: Zod
- **Herramientas**: Bun, Wrangler, TypeScript

## Despliegue

Desplegado en Cloudflare Workers: [drizzle-mcp](https://drizzle-mcp.liuma.app/)

## Licencia

[MIT](LICENSE) © 2026 Ivan Cruz
