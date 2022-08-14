import trimTrailingLines from "trim-trailing-lines";
import { DEFAULT_LOCALE } from "@mdn/yari/libs/constants/index.js";

import { h, html } from "../h.js";
import { asArray, wrapText } from "../utils.js";
import { cards } from "./cards.js";
import { dl } from "./dl.js";
import { tables } from "./tables.js";
import { code, wrap } from "./rehype-remark-utils.js";
import { toText } from "./to-text.js";

/**
 * Some nodes like **strong** or __emphasis__ can't have leading/trailing spaces
 * This function extracts those and returns them as text nodes instead.
 */
const extractSpacing = (node) => {
  let pre = "";
  let post = "";

  node = {
    ...node,
    children: node.children.map((child, i) => {
      const isFirst = i == 0;
      const isLast = i + 1 == node.children.length;

      if (child.type != "text" || !(isFirst || isLast)) {
        return child;
      }

      const { value } = child;
      const isNotSpace = (s) => !!s.trim();

      if (isFirst) {
        pre = value.slice(0, value.split("").findIndex(isNotSpace));
      }
      if (isLast) {
        post = value.slice(
          value.length - value.split("").reverse().findIndex(isNotSpace)
        );
      }

      return {
        ...child,
        value: value.slice(pre.length, value.length - post.length),
      };
    }),
  };

  return [pre, node, post]
    .filter(Boolean)
    .map((s) => (typeof s == "string" ? h("text", s) : s));
};

export const handlers = [
  // Start of non-element types
  // Need to stay above the other handlers, to ensure others only receive
  // elements as arguments (as all other `node.type`s are filtered out here)
  [(node) => node.type == "root", "root"],

  [
    (node) => node.type == "text",
    (node, t, opts) => h("text", wrapText(node.value, opts)),
  ],

  [
    (node) => node.type == "comment",
    (node, t, opts) => h("html", "<!--" + wrapText(node.value, opts) + "-->"),
  ],
  // End of non-element types

  ...tables,
  ...cards,

  [
    {
      is: ["html", "head", "body", "section", "aside", "article"],
    },
    (node, t) => wrap(t(node)),
  ],
  [
    // A div with the hidden class containing a header and <pre> tags should have the class propogate down and the header removed
    (node) =>
      node.tagName == "div" &&
      node.properties.className?.includes("hidden") &&
      node.children.every(
        (child) =>
          child.type == "element" &&
          ["h1", "h2", "h3", "h4", "h5", "h6", "pre"].includes(child.tagName)
      ),
    (node, t) => {
      const children = node.children
        .filter((child) => child.tagName === "pre")
        .map((child) => ({
          ...child,
          properties: {
            ...child.properties,
            className: [...(child.properties.className || []), "hidden"],
          },
        }));

      return t(children);
    },
  ],
  [
    // section#Quick_links is a special section for the sidebar and should be left as HTML
    { is: "section", has: { id: "Quick_links" } },
    (node, t) => html(node),
  ],

  [
    {
      is: ["h1", "h2", "h3", "h4", "h5", "h6"],
      canHaveClass: ["example", "name", "highlight-spanned"],
    },
    (node, t) => {
      const hasOnlyStrongChild =
        node.children.length == 1 && node.children[0].tagName == "strong";
      return h(
        "heading",
        t(hasOnlyStrongChild ? node.children[0] : node, {
          shouldWrap: true,
          singleLine: true,
        }),
        {
          depth: Number(node.tagName.charAt(1)) || 1,
        }
      );
    },
  ],

  [
    {
      is: "div",
      canHaveClass: [
        "callout",
        "container",
        (className) => className.startsWith("column-"),
        "twocolumns",
        "threecolumns",
        "equalColumnHeights",
        "multiColumnList",
        "align-center",
        "originaldocinfo",
      ],
    },
    (node, t) => t(node),
  ],

  [
    {
      is: ["span", "small", "cite", "nobr", "figure"],
      canHaveClass: [
        "highlight-span",
        "objectBox",
        "objectBox-string",
        "devtools-monospace",
        "message-body",
        "message-flex-body",
        "message-body-wrapper",
        "blob-code-inner",
        "blob-code-marker",
        "result_box",
        "hps",
        "js-about-module-abstr",
        (className) => className.startsWith("lang-"),
      ],
    },
    (node, t) => t(node),
  ],

  // Ignore any font-altering elements
  [
    {
      is: ["font", "sup", "sub", "small", "large"],
      canHave: ["color", "face"],
    },
    (node, t, opts) => t(node.children),
  ],

  [
    {
      is: "p",
      canHaveClass: ["brush:", "js", "summary"],
    },
    "paragraph",
  ],
  [
    "br",
    (node, t, { shouldWrap, singleLine }) =>
      shouldWrap ? (singleLine ? html(node) : h("break")) : h("text", "\n"),
  ],

  [
    {
      is: "a",
      canHave: ["href", "rel", "target", "hrefLang"],
      canHaveClass: [
        "link-https",
        "mw-redirect",
        "internal",
        "external",
        "external-icon",
        "local-anchor",
        "cta",
        "primary",
        "new",
        "button",
      ],
    },
    (node, t, { locale = DEFAULT_LOCALE }) =>
      node.properties.href && node.properties.href !== "#"
        ? h("link", t(node), {
            title:
              // Some titles are simply the same as the URL, so don't add them if they are
              node.properties.title === node.properties.href
                ? null
                : node.properties.title || null,
            url: node.properties.href.replace(
              /^((https?:\/\/)?developer\.mozilla\.org)?\/[\w-]+\/docs/,
              `/${locale}/docs`
            ),
          })
        : h("paragraph", t(node)),
  ],

  [
    {
      is: ["ul", "ol"],
      canHaveClass: ["threecolumns"],
    },
    function list(node, t) {
      const ordered = node.tagName == "ol";
      return h("list", t(node), {
        ordered,
        start: ordered ? node.properties.start || 1 : null,
        spread: false,
      });
    },
  ],

  [
    {
      is: "li",
      canHave: ["dataDefaultState"],
    },
    (node, t) => {
      const content = wrap(t(node));
      return h("listItem", content, { spread: content.length > 1 });
    },
  ],

  // Turn <code><a href="/some-link">someCode</a></code> into [`someCode`](/someLink) (other way around)
  [
    (node) =>
      node.tagName == "code" &&
      // inline code currently has padding on MDN, thus multiple adjacent tags
      // would appear to have a space in between, hence we don't convert to it.
      node.children.length == 1 &&
      node.children.some(
        (child) =>
          child.type == "element" && ["a", "strong"].includes(child.tagName)
      ),
    (node) =>
      node.children.map((child) => {
        switch (child.tagName) {
          case "a":
            return h("link", h("inlineCode", toText(child)), {
              title: child.properties.title || null,
              url: child.properties.href,
            });

          case "strong":
            return h("strong", h("inlineCode", toText(child)));

          default:
            return h("inlineCode", toText(child));
        }
      }),
  ],

  [
    { is: ["code", "samp"] },
    (node, t, opts) => {
      const targetNode =
        node.children.length == 1 && node.children[0].tagName == "var"
          ? node.children[0]
          : node;
      return h(
        "inlineCode",
        trimTrailingLines(
          wrapText(toText(targetNode, { allowedElements: ["var"] }), opts)
        )
      );
    },
  ],
  [{ is: "kbd" }, (node, t) => html(node)],

  [
    {
      is: "pre",
      canHaveClass: ["eval", "syntaxbox", "twopartsyntaxbox"],
    },
    (node, t, opts) => code(node, opts),
  ],

  ...[
    "js",
    "html",
    "http",
    "css",
    "json",
    "svg",
    "plain",
    "cpp",
    "java",
    "bash",
    "php",
    "xml",
    "glsl",
    "python",
    "sql",
    "idl",
    "shell",
    "example-good",
    "example-bad",
  ].flatMap((lang) =>
    // shows up with/without semicolon
    [
      "brush:" + lang,
      `brush:${lang};`,
      "bruh:" + lang,
      `bruh:${lang};`,
      lang,
      lang + ";",
      `lang-${lang}`,
      `language-${lang}`,
    ].map((hasClass) => [
      {
        is: "pre",
        hasClass,
        canHaveClass: [
          "brush:",
          "brush",
          "example-good",
          "example-bad",
          "hidden",
          "no-line-numbers",
          "line-numbers",
          `language-${lang}`,
          (className) => className.includes("highlight"),
          (className) => className.startsWith("[") && className.endsWith("]"),
        ],
      },
      (node, t, opts) => [
        h(
          "code",
          trimTrailingLines(
            wrapText(toText(node, { allowedElements: ["var"] }), opts)
          ),
          {
            lang: lang.startsWith("example") ? "plain" : lang,
            meta: asArray(node.properties.className)
              .filter(
                (c) =>
                  typeof c == "string" &&
                  (c.startsWith("example-") || c === "hidden")
              )
              .join(" "),
          }
        ),
      ],
    ])
  ),

  [
    {
      is: "img",
      has: "src",
      canHave: ["alt"],
      canHaveClass: "internal",
    },
    (node) => {
      const { src, title, alt } = node.properties;
      return h("image", null, {
        url: src,
        title: title || null,
        alt: alt || "",
      });
    },
  ],

  [{ is: "math", canHave: ["display"] }, (node) => html(node)],

  ["hr", (node) => h("thematicBreak")],

  ["blockquote", (node, t) => h("blockquote", wrap(t(node)))],

  [{ is: ["i", "em"] }, (node, t) => extractSpacing(h("emphasis", t(node)))],
  [
    { is: ["b", "strong", "u"] },
    (node, t) => extractSpacing(h("strong", t(node))),
  ],
  [{ is: ["s", "del"] }, (node, t) => extractSpacing(h("delete", t(node)))],

  [
    "q",
    (node, t) => [
      { type: "text", value: '"' },
      ...asArray(t(node)),
      { type: "text", value: '"' },
    ],
  ],

  dl,

  ...["summary", "seoSummary"].map((className) => [
    { hasClass: className },
    (node, t, { summary }) => {
      const trimIntoSingleLine = (text) => text.replace(/\s\s+/g, " ").trim();
      if (
        !summary ||
        trimIntoSingleLine(toText(node, { throw: false })) !=
          trimIntoSingleLine(summary)
      ) {
        return null;
      }
      return node.tagName == "div" || node.tagName == "p"
        ? h(
            "paragraph",
            t(node).flatMap((node) =>
              node.type == "paragraph" ? node.children : node
            )
          )
        : t(node);
    },
  ]),

  ["var", (node, t) => h("emphasis", t(node))],
  ["dfn", (node, t) => h("emphasis", t(node))],
  [{ is: "abbr" }, (node, t) => t(node)],
];
