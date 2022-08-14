import { h, isBlockContent } from "../h.js";

const DEFINITION_PREFIX = ": ";
const DEFINITION_START = h("text", DEFINITION_PREFIX);

const wrapNonBlocks = (nodes) => {
  let openParagraph = null;
  const result = [];
  for (const node of nodes) {
    if (isBlockContent(node)) {
      if (openParagraph) {
        result.push(openParagraph);
        openParagraph = null;
      }
      result.push(node);
    } else {
      openParagraph = h("paragraph", []);
      openParagraph.children.push(node);
    }
  }
  if (openParagraph) {
    result.push(openParagraph);
  }
  return result;
};

const prefixDefinitions = ([first, ...rest]) => {
  if (!first) {
    return h("text", "");
  }

  return wrapNonBlocks([
    {
      ...first,
      ...(first.type === "text"
        ? {
            value: DEFINITION_PREFIX + first.value,
          }
        : { children: [DEFINITION_START, ...first.children] }),
    },
    ...rest,
  ]);

  // return wrapNonBlocks([first, ...rest]); // h("paragraph", [DEFINITION_START, first, ...rest]);
};

const toDefinitionItem = (node, terms, definitions) =>
  h(
    "listItem",
    [
      ...terms,
      h(
        "list",
        h("listItem", prefixDefinitions(definitions), { spread: true }),
        {
          spread: false,
        }
      ),
    ],
    { spread: false }
  );

export const dl = [
  { is: "dl", canHave: ["style", "id", "lang", "dir"] },
  (node, t) => {
    const children = [];
    let terms = [];
    for (const child of node.children) {
      if (child.tagName == "dt") {
        terms.push(h("paragraph", t(child)));
      } else if (child.tagName == "dd" && terms.length > 0) {
        children.push(toDefinitionItem(node, terms, t(child)));
        terms = [];
      } else {
        return null;
      }
    }
    return terms.length == 0 ? h("list", children, { spread: false }) : null;
  },
];
