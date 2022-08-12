import fs from "fs";
import path from "path";
import os from "os";
import fm from "front-matter";
import { createRequire } from "module";
import chalk from "chalk";
import cliProgress from "cli-progress";
import { Document, execGit } from "@mdn/yari/content/index.js";
import { saveFile } from "@mdn/yari/content/document.js";
import { VALID_LOCALES } from "@mdn/yari/libs/constants/index.js";
import { getRoot } from "@mdn/yari/content/utils.js";

import { h2m } from "./h2m/index.js";
import { prettyAST } from "./utils/index.js";
import { toSelector } from "./h2m/utils.js";

const require = createRequire(import.meta.url);
const { program } = require("@caporal/core");

function tryOrExit(f) {
  return async ({ options = {}, ...args }) => {
    try {
      await f({ options, ...args });
    } catch (error) {
      if (options.verbose || options.v) {
        console.error(chalk.red(error.stack));
      }
      throw error;
    }
  };
}

function saveProblemsReport(problems) {
  const now = new Date();
  const report = [
    `# Report from ${now.toLocaleString()}`,

    "## All unhandled elements",
    ...Array.from(
      Array.from(problems)
        .flatMap(([, { invalid, unhandled }]) => [
          ...invalid.map((e) => e.source),
          ...unhandled,
        ])
        .map((node) => (node.type == "element" ? toSelector(node) : node.type))
        .reduce(
          (top, label) => top.set(label, (top.get(label) || 0) + 1),
          new Map()
        )
    )
      .sort(([, c1], [, c2]) => (c1 > c2 ? -1 : 1))
      .map(([label, count]) => `- ${label} (${count})`),

    "## Details per Document",
  ];
  let problemCount = 0;
  for (const [url, { offset, invalid, unhandled }] of Array.from(problems)) {
    problemCount += invalid.length + unhandled.length;
    report.push(`### [${url}](https://developer.mozilla.org${url})`);

    const elementWithPosition = (node) => {
      const { type, position } = node;
      const label = type == "element" ? toSelector(node) : type;
      if (position) {
        const {
          start: { line, column },
        } = position;
        return `${label} (${line + offset}:${column})`;
      }
      return label;
    };

    if (invalid.length > 0) {
      report.push(
        "#### Invalid AST transformations",
        ...invalid
          .filter(({ source }) => !!source)
          .map(({ source, targetType, unexpectedChildren }) =>
            [
              `##### ${elementWithPosition(source)} => ${targetType}`,
              "```",
              unexpectedChildren.map((node) => prettyAST(node)),
              "```",
            ].join("\n")
          )
      );
    }

    if (unhandled.length > 0) {
      report.push(
        "### Missing conversion rules",
        ...unhandled.map((node) => "- " + elementWithPosition(node))
      );
    }
  }
  if (problemCount > 0) {
    const reportFileName = `md-conversion-problems-report-${now.toISOString()}.md`;
    console.info(
      `Could not automatically convert ${problemCount} elements. Saving report to ${reportFileName}`
    );
    fs.writeFileSync(reportFileName, report.join("\n"));
  }
}

function buildLocaleMap(locale) {
  let localesMap = new Map();
  if (locale !== "all") {
    localesMap = new Map([[locale.toLowerCase(), locale]]);
  }
  return localesMap;
}

// opposite of slugToFolder
function folderToSlugLC(folder) {
  return folder
    .slice(0, -1) // remove the trailing slash
    .replace(/_question_/g, "?")
    .replace(/_colon_/g, ":")
    .replace(/_doublecolon_/g, "::")
    .replace(/_star_/g, "*")
    .replace(/\\/g, "/") // replace windows path separator
    .toLowerCase();
}

program
  .bin("yarn md")
  .name("md")
  .version("0.0.1")
  .disableGlobalOption("--silent")
  .cast(false)

  .option("--mode <mode>", "Mode to be run in", {
    default: "keep",
    validator: ["dry", "keep", "replace"],
  })
  .option("--print-ast", "Prints MD AST", {
    default: false,
    validator: program.BOOLEAN,
  })
  .option("--locale", "Targets a specific locale", {
    default: "all",
    validator: Array.from(VALID_LOCALES.values()).concat("all"),
  })
  .argument("[folder]", "convert by folder")
  .action(
    tryOrExit(async ({ args, options }) => {
      let folder = (args.folder || "").replace(/\\|\//g, path.sep); // correct path separator
      if (folder.length !== 0 && !folder.endsWith(path.sep)) { // if folder is specified, find folder only
        folder += path.sep;
      }
      console.info(
        `Starting HTML to Markdown conversion in ${options.mode} mode`
      );
      const documents = Document.findAll({
        // replace '\' with '\\' to make this regexp works on Windows
        folderSearch: os.platform() === "win32" ? folder.replace(/\\/g, "\\\\") : folder,
        locales: buildLocaleMap(options.locale),
      });

      const progressBar = new cliProgress.SingleBar(
        {},
        cliProgress.Presets.shades_classic
      );
      progressBar.start(documents.count);

      const slugPrefixLC = folderToSlugLC(folder);

      const problems = new Map();
      try {
        for (let doc of documents.iter()) {
          progressBar.increment();
          if (
            doc.isMarkdown ||
            // findAll's folderSearch is fuzzy which we don't want here
            !doc.metadata.slug.toLowerCase().startsWith(slugPrefixLC)
          ) {
            continue;
          }
          if (options.verbose) {
            console.info(doc.metadata.slug);
          }
          const { body: h, attributes: metadata } = fm(doc.rawContent);
          const [markdown, { invalid, unhandled }] = await h2m(h, {
            printAST: options.printAst,
            locale: doc.metadata.locale,
          });

          if (invalid.length > 0 || unhandled.length > 0) {
            problems.set(doc.url, {
              offset: doc.fileInfo.frontMatterOffset,
              invalid,
              unhandled,
            });
          }

          if (options.mode == "replace" || options.mode == "keep") {
            if (options.mode == "replace") {
              const gitRoot = getRoot(options.locale);
              execGit(
                [
                  "mv",
                  doc.fileInfo.path,
                  doc.fileInfo.path.replace(/\.html$/, ".md"),
                ],
                {},
                gitRoot
              );
            }
            saveFile(
              doc.fileInfo.path.replace(/\.html$/, ".md"),
              markdown,
              metadata
            );
          }
        }
      } finally {
        progressBar.stop();
      }

      saveProblemsReport(problems);
    })
  );

program.run();
