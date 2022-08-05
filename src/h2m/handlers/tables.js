import { h } from "../h.js";

export const tables = [
  [{ is: "caption" }, (node, t) => t(node)],

  [
    {
      is: "table",
      canHave: ["style"],
      canHaveClass: ["standard-table", "fullwidth-table", "properties"],
    },
    (node, t) =>
      h(
        "table",
        node.children
          .flatMap((node) =>
            node.type == "element" &&
            typeof node.tagName == "string" &&
            ["thead", "tbody", "tfoot"].includes(node.tagName)
              ? node.children
              : node
          )
          .filter((node) => node.tagName == "tr")
          .flatMap((node, i) => t([node], { rowIndex: i }))
      ),
  ],

  ["tr", "tableRow"],

  [
    [
      (node, options) =>
        options.rowIndex == 0 && {
          is: "th",
          canHaveClass: "header",
          canHave: { scope: "col" },
        },
      (node, options) => options.rowIndex > 0 && "td",
    ],
    (node, t) => h("tableCell", t(node, { shouldWrap: true })),
  ],
];
