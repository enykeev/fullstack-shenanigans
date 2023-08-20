import type { Node } from "./ast";

export function printAST(node: Node | undefined, level = 0) {
  if (!node) {
    return;
  }

  console.log("  ".repeat(level), node.type, node.subtype || "");

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

function printASTMermaidNode(
  ctx: { i: number },
  node: Node | undefined,
  from: number | string,
) {
  if (!node) {
    return;
  }

  const to = ctx.i++;

  const subtype = node.subtype?.replace("&&", "and").replace("||", "or");

  console.log(
    "  ",
    from,
    "-->",
    subtype ? `${to}[${node.type} ${subtype}]` : `${to}[${node.type}]`,
  );

  switch (node.type) {
    case "accessor":
    case "value": {
      break;
    }
    case "boolean":
    case "comparison": {
      printASTMermaidNode(ctx, node.left, to);
      printASTMermaidNode(ctx, node.right, to);
      break;
    }
    case "group": {
      printASTMermaidNode(ctx, node.value, to);
      break;
    }
    case "list": {
      for (const child of node.children) {
        printASTMermaidNode(ctx, child, to);
      }
      break;
    }
  }
}

export function printASTMermaid(node: Node | undefined, title?: string) {
  if (!node) {
    return;
  }

  if (title) {
    console.log(
      `---\ntitle: ${title
        .replaceAll("&", "#amp;")
        .replaceAll(">", "#gt;")
        .replaceAll("<", "#lt;")} \n---`,
    );
  }

  console.log("flowchart TD");
  printASTMermaidNode({ i: 0 }, node, "start");
}
