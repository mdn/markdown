# markdown

MDN Web Docs tool to convert HTML to Markdown.

> **Note**
> Converting HTML content to Markdown in the MDN organization [is complete as of 2023](https://github.com/mdn/mdn-community/discussions/227#discussioncomment-4013450)
> and so this repository is now archived. Many thanks to all contributors who helped build this tool and to all
> who helped our [journey to get to 100% Markdown](https://hacks.mozilla.org/2022/09/the-100-percent-markdown-expedition/).

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

We recommend reading the [conversion guide](./conversion-guide.md) for a full tutorial on Markdown conversion.

### Modes

- `dry`: Run the conversion script without producing any changes
- `keep`: Create the Markdown files but do not remove the original HTML files
- `replace`: Remove the HTML files and replace them with the Markdown files

### Examples

To perform a test run of the conversion for the `web/http` folder of the English locale:

```sh
yarn h2m web/http --locale en-US --mode dry
```

To perform a conversion of all French locale files:

```sh
yarn h2m --locale fr --mode replace
```

Or perform a conversion of specifically the `mdn` Spanish doc without converting the rest of the folder, keeping the original HTML file:

```sh
yarn mdn/index.html --locale es --mode keep
```

### `--skip-problems`

To speed up conversion, you can specify a `--skip-problems` argument to skip conversion of any files containing conversion issues:

```sh
yarn h2m conflicting/web --locale de --mode replace --skip-problems
```
