import Gettext from "node-gettext";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { DEFAULT_LOCALE } from "@mdn/yari/libs/constants/index.js";
import { h } from "../h.js";
import { asArray } from "../utils.js";
import { toText } from "./to-text.js";

const gettextLocalizationMap = (() => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const require = createRequire(import.meta.url);
  const getTextDefaultDomainName = "messages";
  let gtLocalizationMap = new Map();
  let localesOnFS = fs
    .readdirSync(path.join(__dirname, "../../localizations"))
    .map((str) => str.split(".")[0]);
  localesOnFS.forEach((localeStr) => {
    const translations = require("../../localizations/" + localeStr + ".json");
    const gt = new Gettext();
    gt.addTranslations(localeStr, getTextDefaultDomainName, translations);
    gt.setLocale(localeStr);
    gtLocalizationMap.set(localeStr, gt);
  });
  return gtLocalizationMap;
})();

export const cards = [
  ...["note", "warning", "callout"].map((className) => [
    {
      is: "div",
      hasClass: className,
      canHaveClass: ["blockIndicator"],
    },
    (node, t, { locale = DEFAULT_LOCALE }) => {
      const defaultLocaleGt = gettextLocalizationMap.get(DEFAULT_LOCALE);
      let gt = defaultLocaleGt;
      if (gettextLocalizationMap.has(locale)) {
        gt = gettextLocalizationMap.get(locale);
      }

      let children = node.children;

      if (children.length == 1 && children[0].tagName == "p") {
        // If note is surrounded by paragraph tag, use its contents
        children = children[0].children;
      }

      const labelText = [
        gt.gettext("card_" + className + "_label"),
        defaultLocaleGt.gettext("card_" + className + "_label"),
      ];

      const firstChild = children[0];

      let childrenToAdd = [h("text", " "), ...asArray(t(children))];

      if (firstChild) {
        if (firstChild.tagName == "strong") {
          if (labelText.includes(toText(firstChild).trim())) {
            // First child is already the proper label
            childrenToAdd = asArray(t(children.slice(1)));
          } else if (labelText.includes(toText(firstChild).trim() + ":")) {
            // The colon is outside of the first child
            childrenToAdd = [
              h("text", " "),
              ...asArray(
                t([
                  {
                    ...children[1],
                    value: children[1].value.replace(/^:\s+/, " "),
                  },
                  ...children.slice(2),
                ])
              ),
            ];
          } else if (
            firstChild.value &&
            labelText.some((t) => firstChild.value.startsWith(t))
          ) {
            // No strong tag, but the text is preceded with the proper label
            childrenToAdd = [
              h("text", " "),
              ...asArray(
                t([
                  {
                    ...children[0],
                    value: children[0].value.replace(
                      new RegExp(`^${labelText.join("|")} `, "g"),
                      ""
                    ),
                  },
                  ...children.slice(1),
                ])
              ),
            ];
          }
        }
      }

      return h("blockquote", [
        h("paragraph", [
          h("strong", [h("text", labelText[0])]),
          ...childrenToAdd,
        ]),
      ]);
    },
  ]),
];
