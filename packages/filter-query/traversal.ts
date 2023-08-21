import type { Node } from "./ast";

export function traverse(node: Node | undefined, fn: (node: Node) => void) {
  if (!node) {
    return;
  }

  fn(node);

  switch (node.type) {
    case "booleanValue":
    case "accessor":
    case "value": {
      break;
    }
    case "boolean":
    case "comparison": {
      traverse(node.left, fn);
      traverse(node.right, fn);
      break;
    }
    case "not":
    case "group": {
      traverse(node.value, fn);
      break;
    }
    case "list": {
      for (const child of node.children) {
        traverse(child, fn);
      }
      break;
    }
  }
}
