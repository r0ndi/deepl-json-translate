# DeepL JSON Translate
Lib to translate JSON / JS object by deepl api

## Configuration and usage
1. Install the dependencies
    ```shell
    npm ci
    ```

1. Copy and configure environment variables
    ```shell
    cp .env.example .env
    ```

1. Create source file like `sources/test.json` with json

1. Translate `sources/test.json` to `outputs/test.json`
    ```shell
    npm run translate -- --sl en --ol de --s test.json
    ```

## Scripts
- `npm run translate -- --sl en --ol de --allFiles true` -> transaltions all files
- `npm run generate-csv -- --src en --out de --ori pl --oriName Polish` -> generate csv file with summary
- `npm run parse-csv -- --s en --t de` -> parse csv file with fixed translations

## Arguments
- `--ol` - output language
- `--sl` - source language
- `--s` - source filename
- `--allFiles true` - translate all files from sources directory

## Author
Konrad Sądel @ 2024
