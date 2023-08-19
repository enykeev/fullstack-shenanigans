import { generateToken } from "./tokenizer";
import type {
  BooleanNode,
  ComparisonNode,
  GroupNode,
  LogicalNode,
  Node,
} from "./ast";

export function parse(str: string) {
  let currentNode: Node | undefined;
  let leftNode: Node | undefined;
  const generator = generateToken(str);
  const run = true;
  loop: do {
    const token = generator.next().value;
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
            currentNode = { type: "accessor", key: token.value };
            continue;
          }
          case "group": {
            const parent = currentNode;
            currentNode = { type: "accessor", key: token.value, parent };
            continue;
          }
          case "boolean": {
            const parent = currentNode;
            currentNode = { type: "accessor", key: token.value, parent };
            parent.right = currentNode;
            continue;
          }
        }
        break;
      }
      case "=": {
        if (!currentNode) {
          throw new Error("expression should not start with comparison");
        }
        leftNode = currentNode;
        const parent = leftNode.parent;
        currentNode = {
          type: "comparison",
          subtype: "=",
          left: leftNode,
          parent,
        };
        leftNode.parent = currentNode;
        continue;
      }
      case "!=": {
        if (!currentNode) {
          throw new Error("expression should not start with comparison");
        }
        leftNode = currentNode;
        const parent = leftNode.parent;
        currentNode = {
          type: "comparison",
          subtype: "!=",
          left: leftNode,
          parent,
        };
        leftNode.parent = currentNode;
        continue;
      }
      case ">": {
        if (!currentNode) {
          throw new Error("expression should not start with comparison");
        }
        leftNode = currentNode;
        const parent = leftNode.parent;
        currentNode = {
          type: "comparison",
          subtype: ">",
          left: leftNode,
          parent,
        };
        leftNode.parent = currentNode;
        continue;
      }
      case ">=": {
        if (!currentNode) {
          throw new Error("expression should not start with comparison");
        }
        leftNode = currentNode;
        const parent = leftNode.parent;
        currentNode = {
          type: "comparison",
          subtype: ">=",
          left: leftNode,
          parent,
        };
        leftNode.parent = currentNode;
        continue;
      }
      case "<": {
        if (!currentNode) {
          throw new Error("expression should not start with comparison");
        }
        leftNode = currentNode;
        const parent = leftNode.parent;
        currentNode = {
          type: "comparison",
          subtype: "<",
          left: leftNode,
          parent,
        };
        leftNode.parent = currentNode;
        continue;
      }
      case "<=": {
        if (!currentNode) {
          throw new Error("expression should not start with comparison");
        }
        leftNode = currentNode;
        const parent = leftNode.parent;
        currentNode = {
          type: "comparison",
          subtype: "<=",
          left: leftNode,
          parent,
        };
        leftNode.parent = currentNode;
        continue;
      }
      case "in": {
        if (!currentNode) {
          throw new Error("expression should not start with comparison");
        }
        leftNode = currentNode;
        const parent = leftNode.parent;
        currentNode = {
          type: "comparison",
          subtype: "in",
          left: leftNode,
          parent,
        };
        leftNode.parent = currentNode;
        if (parent && parent.type === "boolean") {
          parent.right = currentNode;
        }
        continue;
      }
      case "integer":
      case "float": {
        if (!currentNode) {
          throw new Error("expression should not start with a number");
        }

        switch (currentNode.type) {
          case "comparison": {
            currentNode.right = {
              type: "value",
              value: Number(token.value),
              parent: currentNode,
            };
            continue;
          }
          case "list": {
            currentNode = {
              type: "value",
              value: Number(token.value),
              parent: currentNode,
            };
            continue;
          }
          default: {
            throw new Error(
              "numeric literal should go after comparison or be an element on the list",
            );
          }
        }
      }
      case "singleQuotedStringLiteral":
      case "doubleQuotedStringLiteral": {
        if (!currentNode) {
          throw new Error("expression should not start with string literal");
        }

        switch (currentNode.type) {
          case "comparison": {
            currentNode.right = {
              type: "value",
              value: String(token.value),
              parent: currentNode,
            };
            continue;
          }
          case "list": {
            currentNode = {
              type: "value",
              value: Number(token.value),
              parent: currentNode,
            };
            continue;
          }
          default: {
            throw new Error(
              "string literal should go after comparison or be an element on the list",
            );
          }
        }
      }
      case "true": {
        if (!currentNode) {
          throw new Error("boolean literal should go after comparison");
        }

        if (new Set(["comparison"]).has(currentNode.type)) {
          currentNode = currentNode as ComparisonNode;
          currentNode.right = {
            type: "value",
            value: true,
            parent: currentNode,
          };
          continue;
        }

        if (new Set(["boolean"]).has(currentNode.type)) {
          currentNode = currentNode as BooleanNode;
          currentNode.right = {
            type: "value",
            value: true,
            parent: currentNode,
          };
          continue;
        }
        break;
      }
      case "false": {
        if (!currentNode) {
          throw new Error("boolean literal should go after comparison");
        }

        if (new Set(["comparison"]).has(currentNode.type)) {
          currentNode = currentNode as ComparisonNode;
          currentNode.right = {
            type: "value",
            value: false,
            parent: currentNode,
          };
          continue;
        }

        if (new Set(["boolean"]).has(currentNode.type)) {
          currentNode = currentNode as BooleanNode;
          currentNode.right = {
            type: "value",
            value: false,
            parent: currentNode,
          };
          continue;
        }
        break;
      }
      case "&&": {
        if (!currentNode) {
          throw new Error("logical operation should go after logical node");
        }

        switch (currentNode.type) {
          case "group":
          case "comparison": {
            leftNode = currentNode;
            const parent = leftNode.parent;
            currentNode = {
              type: "boolean",
              subtype: "&&",
              left: leftNode,
              parent,
            };
            leftNode.parent = currentNode;
            if (parent && parent.type === "boolean") {
              parent.right = currentNode;
            }
            continue;
          }
        }
        break;
      }
      case "||": {
        if (!currentNode || !new Set(["comparison"]).has(currentNode.type)) {
          throw new Error("logical operation should go after logical node");
        }

        switch (currentNode.type) {
          case "group":
          case "comparison": {
            leftNode = currentNode;
            const parent = leftNode.parent;
            currentNode = {
              type: "boolean",
              subtype: "||",
              left: leftNode,
              parent,
            };
            leftNode.parent = currentNode;
            if (parent && parent.type === "boolean") {
              parent.right = currentNode;
            }
            continue;
          }
        }
        break;
      }
      case "(": {
        if (!currentNode) {
          currentNode = { type: "group" };
          continue;
        } else {
          if (!new Set(["boolean"]).has(currentNode.type)) {
            throw new Error("group operation should go after logical node");
          }
          const parentNode = currentNode as BooleanNode;
          currentNode = { type: "group", parent: parentNode };
          parentNode.right = currentNode;
          continue;
        }
      }
      case ")": {
        if (!currentNode) {
          throw new Error("query should not start with closed parethesis");
        }

        let prevNode: Node | undefined = undefined;
        while (currentNode.type !== "group") {
          prevNode = currentNode;
          currentNode = currentNode?.parent as GroupNode;
          if (!currentNode) {
            throw new Error("closed parethesis before open parenthesis");
          }
        }
        if (
          prevNode &&
          !new Set(["comparison", "boolean"]).has(prevNode.type)
        ) {
          throw new Error("closed parethesis before open parenthesis");
        }
        currentNode.value = prevNode as LogicalNode;
        continue;
      }
      case "[": {
        if (!currentNode) {
          currentNode = { type: "list", children: [] };
          continue;
        } else {
          if (!new Set(["comparison"]).has(currentNode.type)) {
            throw new Error("list operation should go after comparison node");
          }
          const parentNode = currentNode as ComparisonNode;
          currentNode = { type: "list", children: [], parent: parentNode };
          parentNode.right = currentNode;
          continue;
        }
      }
      case ",": {
        if (!currentNode || currentNode.parent?.type !== "list") {
          console.log(currentNode);
          throw new Error("comma should only be used inside a list");
        }

        currentNode.parent.children.push(currentNode);
        currentNode = currentNode.parent;
        continue;
      }
      case "]": {
        if (!currentNode) {
          throw new Error("query should not start with closed square bracket");
        }

        if (currentNode.type !== "list") {
          if (currentNode.parent?.type === "list") {
            currentNode.parent.children.push(currentNode);
            currentNode = currentNode.parent;
          } else {
            throw new Error("closed square bracket before open one");
          }
        }
        if (!currentNode.parent) {
          continue;
        }

        switch (currentNode.parent.type) {
          case "comparison": {
            currentNode.parent.right = currentNode;
            continue;
          }
        }
        break;
      }
      default: {
        console.log("default: ", token.tag);
        break loop;
      }
    }
  } while (run);

  while (currentNode?.parent) {
    currentNode = currentNode.parent;
  }

  return currentNode;
}
