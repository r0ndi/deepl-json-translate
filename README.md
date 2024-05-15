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

1. Create source file like `sources/pl.json` with json

1. Translate `sources/pl.json` to `outputs/en.json`
    ```shell
    npm run start:dev -- --sl pl --ol en-US --s pl.json --o en.json
    ```

## Arguments
- `--ol` - output language
- `--sl` - source language
- `--o` - output filename
- `--s` - source filename

## Author
Konrad Sądel @ 2024
