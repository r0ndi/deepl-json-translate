# deepl-json-translate

Translate JSON/JS/TS i18n files using DeepL, keep Handlebars-like placeholders intact, and generate/consume CSV summaries to review and correct translations. Includes optional DeepL Glossary management.

## Features

- Translate a single file or all files in `sources/` to a target language
- Preserve Handlebars-style placeholders like `{{variable}}` during translation
- Validate DeepL language support automatically
- Save outputs in JSON, CommonJS (`.js`), or TypeScript (`.ts`) format, matching the source
- Generate a CSV summary across languages for review and QA
- Parse a CSV of corrections back into nested translation files
- Create DeepL glossaries from a CSV and apply them during translation

## Folder Structure

- `sources/` — input i18n files and `glossary.csv`
- `outputs/` — translated files and generated CSVs
- `originals/` — reference language files used for CSV generation
- `src/` — scripts and services

Key scripts:
- `src/run-translation.ts` — CLI to run translation
- `src/generate-csv.ts` — build a cross-language CSV review file
- `src/parse-csv.ts` — consume CSV corrections back into files
- `src/create-glossary.ts` — create DeepL glossaries from `sources/glossary.csv`

## Installation

1. Ensure you have Node.js 18+ installed.
2. Install dependencies:

	```sh
	npm install
	```

3. Create a `.env` file in the repo root:

	```env
	DEEPL_API_KEY=your_deepl_api_key
	# Optional tuning
	DEEPL_FORMALITY=prefer_more|prefer_less|default
	DEEPL_TAG_HANDLING=html|xml
	DEEPL_PRESERVE_FORMATTING=0|1
	DEEPL_CONTEXT=Optional additional context for translation
	DEEPL_GLOSSARY_NAME=my-glossary
	```

## Supported input formats

Files with extensions `.json`, `.js`, `.ts` are supported. The output format mirrors the source:

- `.json` → JSON
- `.js` → CommonJS export via `module.exports = { ... }`
- `.ts` → TypeScript default export via `export default { ... }`

## DeepL language notes

- Target language (`ol`) must be a supported DeepL target; the tool validates this.
- Source language (`sl`) is optional. If omitted, DeepL auto-detects. Some aliases are normalized: `pt-PT`/`pt-BR` → `pt`, `en-US`/`en-GB` → `en`.

## Usage

All commands are available via npm scripts and accept CLI flags via `minimist`.

### Translate files

Translate a single file:

```sh
npm run translate -- --s=en.test.json --ol=de
```

- `--s` — source file name under `sources/` (for single-file mode)
- `--ol` — output (target) language code (e.g., `de`, `fr`, `es`, `pl`, `pt-PT`, `pt-BR`)
- `--sl` — optional source language code (e.g., `en`, `pl`); when set, used to resolve glossary and file name conversions
- `--allFiles=true` — translate all supported files in `sources/`

Examples:

```sh
# Translate en.test.json to German (outputs/de.test.json)
npm run translate -- --s=en.test.json --ol=de

# Translate all files in sources/ from English to Polish
npm run translate -- --allFiles=true --ol=pl --sl=en
```

Outputs are written to `outputs/`, with file names adjusted by language (e.g., `en.app.json` → `de.app.json`).

### Generate review CSV

Create a CSV summary to compare original, source, and translated strings across all files:

```sh
npm run generate-csv -- --src=en --out=de --ori=pl --oriName="Polish"
```

Flags:
- `--src` — source language code present in `sources/` (e.g., `en`)
- `--out` — target language code present in `outputs/` (e.g., `de`)
- `--ori` — original/reference language code present in `originals/` (e.g., `pl`)
- `--oriName` — human-readable name for the original language shown in the CSV header (default: `Polish`)

It scans all supported files in `sources/`, flattens nested keys, and emits `outputs/translation-summary.csv` with the delimiter `£` and columns:

```
"File"£"Key"£"{OriginalName}"£"Original"£"Translation"£"Correction"£"Changed"£
```

If a translation is missing in `outputs/`, the script logs a warning and skips that entry.

### Parse corrections from CSV

Read `sources/results.csv` (comma-separated) with columns `file,key,value` and write nested translation files to `outputs/`:

```sh
npm run parse-csv -- --t=de --s=en
```

- `--t` — target language code for output files
- `--s` — source language code present in input file names; used to compute output file names via replacement

The script reconstructs nested objects from dot-notated keys and writes one output file per `file` value in the CSV, with the language replaced from `--s` to `--t`.

### Manage DeepL Glossary

Create glossaries from `sources/glossary.csv` and apply automatically when translating (if `--sl` is provided):

```sh
npm run create-glossary
```

Glossary file format (`sources/glossary.csv`): each line is

```
"sourceTerm","targetTerm","sourceLang","targetLang"
```

Behavior:
- Deletes existing glossaries in your DeepL account, then creates new ones grouped by language pairs found in the CSV
- When translating, if `--sl` is provided, the script looks up a matching glossary by normalized language pair and passes its ID to DeepL

## Handlebars-style placeholders

Text segments like `{{variable}}` are converted to placeholders before translation and restored afterward. This protects templating syntax from being altered by DeepL.

## Error handling and validation

- Configuration validation ensures required flags are present and files exist
- Checks supported target languages via DeepL API
- Fails with clear messages: missing source file, no files to translate, unsupported language codes

## Examples

Translate all `sources/` to French, auto-detecting source language:

```sh
npm run translate -- --allFiles=true --ol=fr
```

Generate CSV comparing `originals/pl.*`, `sources/en.*`, and `outputs/de.*`:

```sh
npm run generate-csv -- --src=en --out=de --ori=pl --oriName="Polish"
```

Parse reviewer corrections back to `outputs/es.*` using `sources/results.csv`:

```sh
npm run parse-csv -- --t=es --s=en
```

## Tips

- Keep consistent file naming by language, e.g., `en.app.json`, `pl.app.json`
- For `.ts` sources, the tool expects a default export object structure
- Use `DEEPL_FORMALITY` and `DEEPL_TAG_HANDLING` to better fit your content (marketing vs. technical copy)
- Run `create-glossary` before translation when using or updating glossaries

## Limitations

- Only flat string values are translated; arrays are preserved, and nested objects are traversed
- CSV generation expects files present in `originals/`, `sources/`, and `outputs/` for the specified languages
- `sources/results.csv` must be comma-separated with headers `file,key,value`

## Author

Konrad Sądel @ 2024

