import { printASTMermaid } from "./debugger";
import { parse } from "./parser";

const query = `aaa.bb.c == 1.5 && (res.some !== "thing" or FALSE) && value >= -1 && value < -.16 and key in [1,'2',3.0]`;
const ast = parse(query);
// console.log(ast);

printASTMermaid(ast, query);

// ast = parse(`some == 1.5 && value !== -1`);

// console.log(ast, ast && check({ some: 1.5 }, ast))
