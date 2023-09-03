import { Tokenizer } from "./tokenizer";
import type { Node } from "./ast";
import { traverse } from "./traversal";

export type ParseOpts = {
  simplify?: boolean;
};

export function parse(str: string, { simplify = false }: ParseOpts = {}) {
  let currentNode: Node | undefined;
  const tokenizer = new Tokenizer(str);
  loop: do {
    const token = tokenizer.next();
    if (!token) {
      break;
    }
    switch (token.tag) {
      case "space": {
        continue loop;
      }
      case "key": {
        switch (currentNode?.type) {
          case undefined: {
            currentNode = { type: "accessor", key: token.value, token };
            continue;
          }
          case "group": {
            const parent = currentNode;
            currentNode = { type: "accessor", key: token.value, parent, token };
            continue;
          }
          case "boolean": {
            const parent = currentNode;
            currentNode = { type: "accessor", key: token.value, parent, token };
            parent.right = currentNode;
            continue;
          }
        }
        break;
      }
      case "=":
      case "!=":
      case ">":
      case ">=":
      case "<":
      case "<=":
      case "in": {
        switch (currentNode?.type) {
          case undefined: {
            throw new Error(
              `expression should not start with token "${token.tag}"`,
            );
          }
          case "accessor": {
            const left = currentNode;
            const parent = left.parent;
            currentNode = {
              type: "comparison",
              subtype: token.tag,
              left,
              parent,
              token,
            };
            left.parent = currentNode;
            if (parent && parent.type === "boolean") {
              parent.right = currentNode;
            }
            continue;
          }
          default: {
            throw new Error(
              `token "${token.tag}" should not follow node of type "${currentNode?.type}"`,
            );
          }
        }
      }
      case "!": {
        switch (currentNode?.type) {
          case undefined: {
            currentNode = {
              type: "not",
              token,
            };
            continue;
          }
          case "not": {
            const parent = currentNode;
            currentNode = {
              type: "not",
              parent,
              token,
            };
            parent.value = currentNode;
            continue;
          }
          case "boolean": {
            const parent = currentNode;
            currentNode = {
              type: "not",
              parent,
              token,
            };
            parent.right = currentNode;
            continue;
          }
          default: {
            throw new Error(
              `token "${token.tag}" should not follow node of type "${currentNode?.type}"`,
            );
          }
        }
      }
      case "integer":
      case "float": {
        switch (currentNode?.type) {
          case undefined: {
            throw new Error(
              `expression should not start with token "${token.tag}"`,
            );
          }
          case "comparison": {
            currentNode.right = {
              type: "value",
              value: Number(token.value),
              parent: currentNode,
              token,
            };
            continue;
          }
          case "list": {
            currentNode = {
              type: "value",
              value: Number(token.value),
              parent: currentNode,
              token,
            };
            continue;
          }
          default: {
            throw new Error(
              `token "${token.tag}" should not follow node of type "${currentNode?.type}"`,
            );
          }
        }
      }
      case "singleQuotedStringLiteral":
      case "doubleQuotedStringLiteral": {
        switch (currentNode?.type) {
          case undefined: {
            throw new Error(
              `expression should not start with token "${token.tag}"`,
            );
          }
          case "comparison": {
            currentNode.right = {
              type: "value",
              value: String(token.value),
              parent: currentNode,
              token,
            };
            continue;
          }
          case "list": {
            currentNode = {
              type: "value",
              value: String(token.value),
              parent: currentNode,
              token,
            };
            continue;
          }
          default: {
            throw new Error(
              `token "${token.tag}" should not follow node of type "${currentNode?.type}"`,
            );
          }
        }
      }
      case "true": {
        switch (currentNode?.type) {
          case undefined: {
            currentNode = {
              type: "booleanValue",
              value: true,
              parent: currentNode,
              token,
            };
            continue;
          }
          case "group":
          case "not": {
            const parent = currentNode;
            currentNode = {
              type: "booleanValue",
              value: true,
              parent,
              token,
            };
            parent.value = currentNode;
            continue;
          }
          case "comparison":
          case "boolean": {
            currentNode.right = {
              type: "booleanValue",
              value: true,
              parent: currentNode,
              token,
            };
            continue;
          }
          default: {
            throw new Error(
              `token "${token.tag}" should not follow node of type "${currentNode?.type}"`,
            );
          }
        }
      }
      case "false": {
        switch (currentNode?.type) {
          case undefined: {
            currentNode = {
              type: "booleanValue",
              value: false,
              parent: currentNode,
              token,
            };
            continue;
          }
          case "group":
          case "not": {
            const parent = currentNode;
            currentNode.value = {
              type: "booleanValue",
              value: false,
              parent,
              token,
            };
            continue;
          }
          case "comparison":
          case "boolean": {
            currentNode.right = {
              type: "booleanValue",
              value: false,
              parent: currentNode,
              token,
            };
            continue;
          }
          default: {
            throw new Error(
              `token "${token.tag}" should not follow node of type "${currentNode?.type}"`,
            );
          }
        }
      }
      case "&&":
      case "||": {
        switch (currentNode?.type) {
          case undefined: {
            throw new Error(
              `expression should not start with token "${token.tag}"`,
            );
          }
          case "booleanValue":
          case "group":
          case "comparison": {
            const left = currentNode;
            const parent = left.parent;
            currentNode = {
              type: "boolean",
              subtype: token.tag,
              left,
              parent,
              token,
            };
            left.parent = currentNode;
            if (parent && parent.type === "boolean") {
              parent.right = currentNode;
            }
            if (parent && parent.type === "group") {
              parent.value = currentNode;
            }
            continue;
          }
          case "boolean": {
            const parent = currentNode;
            const left = parent.right;
            currentNode = {
              type: "boolean",
              subtype: token.tag,
              left,
              parent,
              token,
            };
            parent.right = currentNode;
            continue;
          }
          default: {
            throw new Error(
              `token "${token.tag}" should not follow node of type "${currentNode?.type}"`,
            );
          }
        }
      }
      case "(": {
        switch (currentNode?.type) {
          case undefined: {
            currentNode = { type: "group", token };
            continue;
          }
          case "not": {
            const parent = currentNode;
            currentNode = { type: "group", parent, token };
            parent.value = currentNode;
            continue;
          }
          case "boolean": {
            const parentNode = currentNode;
            currentNode = { type: "group", parent: parentNode, token };
            parentNode.right = currentNode;
            continue;
          }
          default: {
            throw new Error(
              `token "${token.tag}" should not follow node of type "${currentNode?.type}"`,
            );
          }
        }
      }
      case ")": {
        if (!currentNode) {
          throw new Error("query should not start with closed parethesis");
        }

        let prevNode: Node | undefined = undefined;
        while (currentNode.type !== "group") {
          prevNode = currentNode;
          currentNode = currentNode?.parent;
          if (!currentNode) {
            throw new Error("closed parethesis before open parenthesis");
          }
        }

        switch (prevNode?.type) {
          case undefined:
            continue;
          case "booleanValue":
          case "boolean":
          case "comparison": {
            currentNode.value = prevNode;
            continue;
          }
          default: {
            throw new Error("closed parethesis before open parenthesis");
          }
        }
      }
      case "[": {
        switch (currentNode?.type) {
          case undefined: {
            currentNode = { type: "list", children: [], token };
            continue;
          }
          case "comparison": {
            const parentNode = currentNode;
            currentNode = {
              type: "list",
              children: [],
              parent: parentNode,
              token,
            };
            parentNode.right = currentNode;
            continue;
          }
          default: {
            throw new Error(
              `token "${token.tag}" should not follow node of type "${currentNode?.type}"`,
            );
          }
        }
      }
      case ",": {
        switch (currentNode?.parent?.type) {
          case "list": {
            currentNode.parent.children.push(currentNode);
            currentNode = currentNode.parent;
            continue;
          }
          default: {
            throw new Error(
              `token "${token.tag}" should only be used inside a list`,
            );
          }
        }
      }
      case "]": {
        if (!currentNode) {
          throw new Error("query should not start with closed square bracket");
        }

        if (currentNode.type !== "list") {
          if (currentNode.parent?.type !== "list") {
            throw new Error("closed square bracket before open one");
          }
          currentNode.parent.children.push(currentNode);
          currentNode = currentNode.parent;
        }

        switch (currentNode.parent?.type) {
          case undefined: {
            continue;
          }
          case "comparison": {
            currentNode.parent.right = currentNode;
            continue;
          }
        }
        break;
      }
      default: {
        throw new Error(`unknown token "${token.tag}"`);
      }
    }
  } while (!tokenizer.done);

  while (currentNode?.parent) {
    currentNode = currentNode.parent;
  }

  if (simplify) {
    traverse(currentNode, (node: Node) => {
      delete node.parent;
      delete node.token;
    });
  }

  return currentNode;
}
