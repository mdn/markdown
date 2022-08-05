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

```sh
yarn md h2m web/http --locale en-US --mode dry
```

```sh
yarn md h2m web/http --locale en-US --mode replace
```
