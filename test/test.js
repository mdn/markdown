import assert from "node:assert/strict";
import fs from "node:fs/promises";

import { fdir } from "fdir";
import fm from "front-matter";
import yaml from "js-yaml";

import { h2m } from "../src/h2m/index.js";

const convertLocale = (l) => {
  const parts = l.split("-");
  if (parts.length === 1) return l;

  return parts[0] + "-" + parts[1].toUpperCase();
};

const files = await new fdir()
  .withBasePath()
  .filter((path) => path.endsWith(".html"))
  .crawl("./test/content")
  .withPromise();

console.log(files);

const convert = async (filedata, locale) => {
  const { body: h, attributes: metadata } = fm(filedata);
  const [markdown, { invalid, unhandled }] = await h2m(h, { locale });

  return `---\n${yaml.dump(metadata)}---\n${markdown.trim()}\n`;
};

describe("Test conversion", () => {
  for (const f of files) {
    const [, , , locale_, file] = f.split("/");

    // Convert the case of the locale, which Yari normally does for us
    const locale = convertLocale(locale_);

    it(`${locale}: ${file}`, async () => {
      const filedata = (await fs.readFile(f)).toString();
      const expected = (
        await fs.readFile(f.replace(".html", ".md"))
      ).toString();

      const actual = await convert(filedata, locale);

      assert.equal(actual, expected);
    });
  }
});
