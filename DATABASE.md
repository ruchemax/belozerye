# Database

Database file: `data/belozerye.sqlite`. It is the website's only active data
source: the site builder reads settlements, mentions, coordinates, and the full
texts of books from it.

The `content/books` directory is retained as backup source material. The builder
does not read, modify, or require it to run the website.

Rebuild the pages after editing the database:

```powershell
npm.cmd run build
```

Create a backup before major changes:

```powershell
Copy-Item data\belozerye.sqlite data\belozerye.backup.sqlite
```

## Overview

The main relationship chain is:

```text
books → fragments → mentions ← places ← place_geometries
                        ↓
       administrative units / land categories / name variants
```

One settlement can be mentioned in many fragments from different books. A row in
`mentions` connects a settlement to a specific source and its historical spelling.

## Tables

### `schema_metadata`

Service information about the database structure and creation.

| Column | Type | Description |
|---|---|---|
| `key` | `TEXT`, PK | Property key, for example `schema_version`. |
| `value` | `TEXT` | Property value. |

### `schema_migrations`

Records migrations that have been applied to the database.

| Column | Type | Description |
|---|---|---|
| `id` | `TEXT`, PK | Migration filename. |
| `applied_at` | `TEXT` | Timestamp at which the migration was applied. |

### `books`

Source books.

| Column | Type | Description |
|---|---|---|
| `id` | `TEXT`, PK | Stable book identifier. |
| `slug` | `TEXT`, unique | Book URL segment. |
| `full_title` | `TEXT` | Full title; displayed only below the main heading on a book page. |
| `short_title` | `TEXT` | Short working title; used everywhere else on the site. |
| `year` | `TEXT` | Source date or period, for example `1626/27`. |
| `archive_reference` | `TEXT`, nullable | Archival reference. |
| `publication_reference` | `TEXT`, nullable | Bibliographic reference to the published edition. |
| `raw_json` | `TEXT` | Rare display settings not represented by dedicated fields. |

### `book_documents`

The full HTML text of each book. The site builder reads this text from SQLite.

| Column | Type | Description |
|---|---|---|
| `book_id` | `TEXT`, PK, FK → `books.id` | Book to which the text belongs. |
| `html` | `TEXT` | Full HTML text of the book. |

### `fragments`

Transcription fragments within a book.

| Column | Type | Description |
|---|---|---|
| `id` | `TEXT`, PK | Fragment identifier. |
| `book_id` | `TEXT`, FK → `books.id` | Source book. |
| `source_heading_id` | `TEXT` | Technical HTML anchor of the heading in the source book. |
| `folio` | `TEXT`, nullable | Source folio. |
| `position` | `INTEGER` | Fragment order within the book. |
| `link_target_id` | `TEXT`, nullable | Target settlement for a link, when set. |
| `raw_json` | `TEXT` | Rare fragment display settings. |

### `churches`

Church cards.

| Column | Type | Description |
|---|---|---|
| `id` | `TEXT`, PK | Stable church identifier. |
| `slug` | `TEXT`, unique | Church card URL segment. |
| `name` | `TEXT` | Church name transcribed from the source. |
| `location_place_id` | `TEXT`, nullable, FK → `places.id` | Settlement with which the church is associated. |

### `church_geometries`

Geographic data for churches.

| Column | Type | Description |
|---|---|---|
| `church_id` | `TEXT`, PK, FK → `churches.id` | Church to which the geometry belongs. |
| `longitude` | `REAL` | Point longitude in WGS84. |
| `latitude` | `REAL` | Point latitude in WGS84. |
| `source` | `TEXT` | Coordinate source or editorial note. |

### `church_sources`

Links churches to the source fragments in which they are mentioned.

| Column | Type | Description |
|---|---|---|
| `church_id` | `TEXT`, PK, FK → `churches.id` | Church. |
| `fragment_id` | `TEXT`, PK, FK → `fragments.id` | Source fragment. |

Composite primary key: (`church_id`, `fragment_id`).

### `place_types`

Reference list of settlement types.

| Column | Type | Description |
|---|---|---|
| `code` | `TEXT`, PK | Machine-readable code, for example `village`. |
| `label` | `TEXT`, unique | Display label. |

### `place_statuses`

Reference list of settlement statuses.

| Column | Type | Description |
|---|---|---|
| `code` | `TEXT`, PK | Machine-readable status code. |
| `label` | `TEXT`, unique | Display label for the status. |

### `places`

Settlement cards.

| Column | Type | Description |
|---|---|---|
| `id` | `TEXT`, PK | Stable settlement identifier. |
| `slug` | `TEXT`, unique | Card URL segment. |
| `name` | `TEXT` | Main card name: taken from the most recent mention, or the first mention when years are equal. Qualifiers such as “on the river…” are omitted. |
| `name_origin` | `TEXT` | Provenance of the main name. |
| `type_code` | `TEXT`, FK → `place_types.code` | Settlement type. |
| `status_code` | `TEXT`, FK → `place_statuses.code` | Settlement status. |

### `place_names`

All additional name variants for a settlement.

| Column | Type | Description |
|---|---|---|
| `id` | `TEXT`, PK | Variant identifier. |
| `place_id` | `TEXT`, FK → `places.id` | Settlement. |
| `name` | `TEXT` | Name variant. |
| `language` | `TEXT`, nullable | Language or orthographic form of the variant. |
| `name_kind` | `TEXT` | Variant type: historical, former primary name, variant, and so on. |

### `mentions`

Mentions of a settlement in a particular source fragment.

| Column | Type | Description |
|---|---|---|
| `id` | `TEXT`, PK | Mention identifier. |
| `place_id` | `TEXT`, FK → `places.id` | Mentioned settlement. |
| `fragment_id` | `TEXT`, FK → `fragments.id` | Source fragment. |
| `source_name` | `TEXT` | Name exactly as it appears in the source. |
| `historical_name_override` | `TEXT`, nullable | Editorial clarification of the historical name. |

### `place_name_states`

Historical states of a settlement name.

| Column | Type | Description |
|---|---|---|
| `id` | `TEXT`, PK | Name-state identifier. |
| `place_id` | `TEXT`, FK → `places.id` | Settlement. |
| `place_name_id` | `TEXT`, FK → `place_names.id` | Name variant. |
| `type_code` | `TEXT`, nullable, FK → `place_types.code` | Settlement type for this name state. |
| `source_mention_id` | `TEXT`, nullable, FK → `mentions.id` | Mention supporting the state. |
| `observed_year` | `TEXT`, nullable | Year in which the name was observed. |
| `display_period` | `TEXT`, nullable | Editorial display period. |
| `assertion_kind` | `TEXT` | Assertion type, for example `source` or `inferred`. |
| `position` | `INTEGER` | Display order. |

### `administrative_units`

Historical administrative units extracted from a mention's context.

| Column | Type | Description |
|---|---|---|
| `id` | `TEXT`, PK | Identifier such as `volost:<name>`. |
| `kind` | `TEXT` | Unit type: `uezd`, `volost`, `stan`, `prikaz`, or `subdivision`. |
| `name` | `TEXT` | Name as written in the source. |
| `label` | `TEXT`, nullable | Display label. |

### `mention_administrative_units`

Links a mention to its administrative context.

| Column | Type | Description |
|---|---|---|
| `mention_id` | `TEXT`, PK, FK → `mentions.id` | Mention. |
| `administrative_unit_id` | `TEXT`, FK → `administrative_units.id` | Administrative unit. |
| `context_key` | `TEXT`, PK | Context key: `uezd`, `volost`, and so on. |

Composite primary key: (`mention_id`, `context_key`).

### `mention_land_categories`

Land categories specified for a mention.

| Column | Type | Description |
|---|---|---|
| `mention_id` | `TEXT`, PK, FK → `mentions.id` | Mention. |
| `position` | `INTEGER`, PK | Category order. |
| `code` | `TEXT`, nullable | Machine-readable category code. |
| `label` | `TEXT` | Display category label. |
| `display_period` | `TEXT`, nullable | Editorial display period for the category. |

Composite primary key: (`mention_id`, `position`).

### `land_owners`

Reference list of second-level land owners.

| Column | Type | Description |
|---|---|---|
| `id` | `TEXT`, PK | Permanent owner identifier. |
| `name` | `TEXT` | Display name of the owner. |
| `location_place_id` | `TEXT`, nullable, FK → `places.id` | Settlement associated with the owner. |

### `mention_land_category_owners`

Links a land category in a particular mention to one or more owners.

| Column | Type | Description |
|---|---|---|
| `mention_id` | `TEXT`, PK, FK → `mentions.id` | Mention. |
| `land_category_position` | `INTEGER`, PK, FK | Position of the land category within the mention. |
| `land_owner_id` | `TEXT`, PK, FK → `land_owners.id` | Owner. |
| `position` | `INTEGER` | Owner display order. |

Composite primary key: (`mention_id`, `land_category_position`, `land_owner_id`).

### `place_geometries`

Geographic data for settlements.

| Column | Type | Description |
|---|---|---|
| `place_id` | `TEXT`, PK, FK → `places.id` | Settlement to which the geometry belongs. |
| `longitude` | `REAL` | Point longitude in WGS84. |
| `latitude` | `REAL` | Point latitude in WGS84. |

## Direct editing

### Web editor

For routine work, use the local web interface:

```powershell
npm.cmd run db:admin
```

Open `http://127.0.0.1:4174`. You can search records, open them, and edit their
fields, including `book_documents.html`. Before every save, the editor creates a
database copy in `data/backups/`. After a series of edits, select **Save site**
in the editor header or run `npm.cmd run build`.

### Console

Edit ordinary fields in their respective table columns; for example,
`places.name`, `mentions.source_name`, or `book_documents.html`. The
builder uses the main columns and related tables. The `raw_json` fields contain
only rare record settings; they do not duplicate the primary data.

To use the console:

```powershell
sqlite3 data\belozerye.sqlite
```

After running SQL commands, execute `.quit`, then run `npm.cmd run build`.

## Book text and source anchors

Book text exists in a single copy in `book_documents.html`. A mention is linked
to its fragment through `mentions.fragment_id`; the same identifier is used as
the HTML anchor in the generated book text.

All 239 current mentions have anchors for their fragments. The consistency check
runs as part of `npm.cmd run check`.

Cards currently show both the previous quotation and an **Open fragment in
book** button. This is a transitional verification stage: standalone quotations
will be removed after a sample check of exact anchors within records.

For future database structure changes, use the SQL files in `migrations/` and
run:

```powershell
npm.cmd run db:migrate
```

A copy of the database is created in `data/backups/` before each new migration.
