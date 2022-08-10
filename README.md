# markdown

MDN Web Docs tool to covert HTML to Markdown.

## Prerequisites

- [git](https://git-scm.com/)
- [Node.js](https://nodejs.org) (>= 12.0.0 and < 17.0.0)
- [`yarn`](https://classic.yarnpkg.com/en/docs/install)

## Setup

1. Install dependencies with

```sh
yarn
```

2. Write a `.env` file in the repository directory which indicates where are the files of your local `mdn/content` and/or `mdn/translated-content` copies. You will need the variables `CONTENT_ROOT` and `CONTENT_TRANSLATED_ROOT`. As an example, the content of this file could look like:

```sh
CONTENT_TRANSLATED_ROOT=../translated-content/files
CONTENT_ROOT=../content/files
```

## How to use

To run the script, run `yarn h2m <folder> --locale <locale> --mode <mode>`, where `<folder>` is the target folder to convert (leave blank for all folders), `<locale>` is the target locale (default: all), and `<mode>` is the desired operating mode. This will analyze the HTML files within the specified folder and convert them to Markdown. A report file (`md-conversion-problems-report-[Timestamp].md`) will be generated in the root of this repository if there were any elements that could not be converted.

### Modes

- `dry`: Run the conversion script without producing any changes
- `keep`: Create the Markdown files but do not remove the original HTML files
- `replace`: Remove the HTML files and replace them with the Markdown files

### Examples

```sh
yarn h2m web/http --locale en-US --mode dry
```

```sh
yarn h2m --locale fr --mode replace
```
