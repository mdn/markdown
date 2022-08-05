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
      const firstChildIsLabel =
        firstChild && labelText.includes(toText(firstChild));

      return h("blockquote", [
        h("paragraph", [
          h("strong", [h("text", labelText[0])]),
          ...[!firstChildIsLabel && h("text", " ")],
          ...asArray(t(firstChildIsLabel ? children.splice(1) : children)),
        ]),
      ]);
    },
  ]),
];
