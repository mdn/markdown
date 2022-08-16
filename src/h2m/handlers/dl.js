import { h, isBlockContent } from "../h.js";

const DEFINITION_PREFIX = ": ";
const DEFINITION_START = h("text", DEFINITION_PREFIX);

const wrapNonBlocks = (nodes) => {
  let paragraphChildren = [];
  const result = [];
  for (const node of nodes) {
    if (isBlockContent(node)) {
      if (paragraphChildren.length) {
        result.push(h("paragraph", paragraphChildren));
        paragraphChildren = [];
      }
      result.push(node);
    } else {
      paragraphChildren.push(node);
    }
  }
  if (paragraphChildren.length) {
    result.push(h("paragraph", paragraphChildren));
  }
  return result;
};

const prefixDefinitions = ([first, ...rest]) => {
  if (!first) {
    return h("text", "");
  }

  if (first.type === "text") {
    return wrapNonBlocks([
      {
        ...first,
        value: DEFINITION_PREFIX + first.value,
      },
      ...rest,
    ]);
  }

  if (first.type === "paragraph") {
    return wrapNonBlocks([
      {
        ...first,
        children: [DEFINITION_START, ...first.children],
      },
      ...rest,
    ]);
  }

  return wrapNonBlocks([DEFINITION_START, first, ...rest]);
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
