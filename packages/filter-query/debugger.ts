import type { Node } from "./ast";

export function printAST(node: Node | undefined, level = 0) {
  if (!node) {
    return;
  }

  console.log("  ".repeat(level), node.type, node?.subtype || "");

  switch (node.type) {
    case "accessor":
    case "value": {
      break;
    }
    case "boolean":
    case "comparison": {
      printAST(node.left, level + 1);
      printAST(node.right, level + 1);
      break;
    }
    case "group": {
      printAST(node.value, level + 1);
      break;
    }
    case "list": {
      for (const child of node.children) {
        printAST(child, level + 1);
      }
      break;
    }
  }
}
