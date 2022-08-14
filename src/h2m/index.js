import fs from "node:fs";
import cheerio from "cheerio";
import { unified } from "unified";
import parseHTML from "rehype-parse";
import gfm from "remark-gfm";
import remarkPrettier from "remark-prettier";
import {
  extractSections,
  extractSummary,
} from "@mdn/yari/build/document-extractor.js";

import { decodeKS, encodeKS, prettyAST } from "../utils/index.js";
import { transform } from "./transform.js";

const getTransformProcessor = (options) =>
  unified()
    .use(parseHTML)
    .use(transform, options)
    .use(gfm)
    .use(remarkPrettier, {
      report: false,
      options: { embeddedLanguageFormatting: "off", proseWrap: "preserve" },
    })
    .use({
      // https://github.com/remarkjs/remark/tree/main/packages/remark-stringify#options
      settings: { bullet: "-", emphasis: "_", fences: true, rule: "-" },
    });

export async function h2m(html, { exportAST, locale } = {}) {
  const encodedHTML = encodeKS(html);
  const summary = extractSummary(
    extractSections(cheerio.load(`<div id="_body">${encodedHTML}</div>`))[0]
  );

  let unhandled;
  let invalid;
  const file = await getTransformProcessor({ summary, locale })
    .use(() => (result) => {
      invalid = result.invalid;
      unhandled = result.unhandled;
      if (exportAST) {
        const ASToutput = prettyAST(result.transformed);
        if (exportAST === "print") console.info(ASToutput);
        else if (exportAST === "file") {
          const filename = `ast-${new Date()
            .toISOString()
            .replace(/:/g, "_")}.md`;
          fs.writeFileSync(filename, ASToutput);
        }
      }
      return result.transformed;
    })
    .process(encodedHTML);

  const result = String(file);

  return [decodeKS(result), { invalid, unhandled }];
}
