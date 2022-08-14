import Gettext from "node-gettext";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { DEFAULT_LOCALE } from "@mdn/yari/libs/constants/index.js";
import { h } from "../h.js";
import { asArray } from "../utils.js";
import { toText } from "./to-text.js";

const dirname = new URL(".", import.meta.url);
const localesPath = new URL(
  "../../../node_modules/@mdn/yari/markdown/localizations/",
  dirname
);

const getLocalizationMap = async () => {
  const getTextDefaultDomainName = "messages";
  const gtLocalizationMap = new Map();
  const localesOnFS = (await fs.readdir(localesPath)).map(
    (str) => str.split(".")[0]
  );

  for (const localeStr of localesOnFS) {
    const translations = JSON.parse(
      await fs.readFile(new URL(`./${localeStr}.json`, localesPath))
    );
    const gt = new Gettext();
    gt.addTranslations(localeStr, getTextDefaultDomainName, translations);
    gt.setLocale(localeStr);
    gtLocalizationMap.set(localeStr, gt);
  }

  return gtLocalizationMap;
};

const gettextLocalizationMap = await getLocalizationMap();

const extractLabel = (children, t, labelText) => {
  const firstChild = children[0];

  let childrenToAdd = [h("text", " "), ...asArray(t(children))];

  if (firstChild) {
    if (["strong", "b", "em", "i"].includes(firstChild.tagName)) {
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

  return childrenToAdd;
};

export const cards = [
  ...["note", "warning", "callout"].map((className) => [
    {
      is: ["div", "p"],
      hasClass: className,
      canHaveClass: ["blockIndicator", `${className}card`],
    },
    (node, t, { locale = DEFAULT_LOCALE }) => {
      const defaultLocaleGt = gettextLocalizationMap.get(DEFAULT_LOCALE);
      let gt = defaultLocaleGt;
      if (gettextLocalizationMap.has(locale)) {
        gt = gettextLocalizationMap.get(locale);
      }

      const labelText = [
        gt.gettext("card_" + className + "_label"),
        defaultLocaleGt.gettext("card_" + className + "_label"),
      ];

      let children = node.children;
      let childrenToAdd = [];

      if (children.length == 1 && children[0].tagName == "p") {
        // If note is surrounded by paragraph tag, use its contents
        children = children[0].children;
      }

      if (children[0].tagName == "p") {
        return h("blockquote", [
          h("paragraph", [
            h("strong", [h("text", labelText[0])]),
            ...extractLabel(children[0].children, t, labelText),
          ]),
          ...asArray(t(children.slice(1))),
        ]);
      } else {
        return h("blockquote", [
          h("paragraph", [
            h("strong", [h("text", labelText[0])]),
            ...extractLabel(children, t, labelText),
          ]),
        ]);
      }
    },
  ]),
];
