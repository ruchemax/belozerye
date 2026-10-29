# Belozerye

[Live website](https://belozersky.uezd.workers.dev/) · Historical geography and source-reading project

**Belozerye** is a static digital history website for exploring the historical
settlements of the Belozersky Uyezd through seventeenth-century cadastral books.
It connects transcribed primary-source fragments with settlement cards, historical
name variants, administrative context, churches, and an interactive map.

The project is designed as both a public research interface and a reproducible
publishing workflow: editorial data is maintained in SQLite and used to generate
the complete static website.

## Highlights

- Browse three historical source books and navigate their structured fragments.
- Explore 200+ settlement cards with citations back to the exact source passage.
- View settlements and churches on an OpenLayers map with filtering, grouping,
  labels, and clustered markers.
- Preserve historical spellings, name states, administrative units, land
  categories, and landowners as separate relational data.
- Generate SEO metadata, canonical URLs, Open Graph metadata, `sitemap.xml`,
  `robots.txt`, and a custom 404 page during the build.
- Run consistency checks for source anchors, generated links, names, data-model
  rules, release metadata, and English code comments.

## Technology

| Area | Technology |
| --- | --- |
| Front end | Semantic HTML, modern CSS, vanilla JavaScript |
| Maps | [OpenLayers 10](https://openlayers.org/) with OpenStreetMap tiles |
| Data | SQLite, accessed through Node.js `node:sqlite` |
| Static-site generation | Custom Node.js ES module scripts |
| Local editorial tools | Node.js HTTP server and database administration UI |
| Hosting | Cloudflare Workers static assets |
| Quality assurance | Custom Node.js audit scripts run through npm |

No front-end framework or client-side database is used. The browser receives a
fully generated static site plus compact map data; the source database remains a
build-time editorial asset.

## Architecture

```text
SQLite database + HTML templates
             |
             v
    Node.js static-site builder
             |
             v
 dist/ — deployable static website
             |
             v
 Cloudflare Workers
```

`data/belozerye.sqlite` is the only active editorial data source. The builder
reads it together with files in `templates/` and writes the deployable site to
`dist/`. Files in `content/books/` are retained as archival source material and
are not used by the build.

## Database model

The core relationship is:

```text
books → fragments → mentions ↔ places ↔ place_geometries
                         |
                         ├─ historical name states and variants
                         ├─ administrative units
                         └─ land categories and owners
```

Additional tables describe churches, church coordinates, and their links to
source fragments. Reference tables define settlement types and statuses.

This normalization makes it possible for one settlement to have multiple source
mentions, historical spellings, locations, and administrative contexts without
duplicating the underlying record. The full schema, field descriptions, foreign
keys, editing guidance, and migration notes are in [DATABASE.md](DATABASE.md).

## Repository layout

```text
data/          SQLite database and local backups
templates/     Source templates and shared map-marker configuration
scripts/       Builder, local database editor, migrations, and quality checks
migrations/    Versioned SQL database migrations
content/books/ Archived source-book HTML (not read by the builder)
dist/          Generated site ready for deployment
```

## Local development

### Requirements

- Node.js 22 or later (the project uses the built-in `node:sqlite` module)
- npm

Install dependencies if the environment requires them:

```bash
npm install
```

Build the website:

```bash
npm run build
```

The generated website is written to `dist/`. Serve that directory with any
static HTTP server for local preview.

Run the full project verification suite:

```bash
npm run check
```

The checks verify that generated files match the database, source anchors and
citations exist, internal links resolve, name-model rules hold, and the release
output has working local references and essential metadata.

## Editing data

Start the local administration interface:

```bash
npm run db:admin
```

Open [http://127.0.0.1:4174](http://127.0.0.1:4174), make editorial changes,
then rebuild the site. Create a copy of `data/belozerye.sqlite` before major
edits. See [DATABASE.md](DATABASE.md) for the schema and editing workflow.

## Deployment

Cloudflare Workers is configured in `wrangler.jsonc` to publish `dist/`, serve
the custom 404 page, and use clean trailing-slash URLs. The `_headers` file in
`dist/` applies baseline security headers to the static site.

Before deployment, run:

```bash
npm run check
```

## License and source material

This repository contains a research-oriented transcription and data model for
historical sources. Verify the rights and citation requirements for individual
source texts, images, and map tiles before reusing them outside this project.
