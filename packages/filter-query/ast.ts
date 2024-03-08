import { type Token } from "./tokenizer";

export type BaseNode = {
  type: string;
  subtype?: string;
  parent?: Node;
  token?: Token;
};

export type AccessorNode = BaseNode & {
  type: "accessor";
  key?: string;
};

export type ValueNode<T> = BaseNode & {
  type: "value";
  value: T;
};

export type BooleanValueNode = BaseNode & {
  type: "booleanValue";
  value: boolean;
};

export type ComparisonNode = BaseNode & {
  type: "comparison";
  subtype: "=" | "!=" | ">" | "<" | ">=" | "<=" | "in";
  left?: Node;
  right?: Node;
};

export type BooleanNode = BaseNode & {
  type: "boolean";
  subtype: "&&" | "||";
  left?: LogicalNode;
  right?: LogicalNode;
};

export type NotNode = BaseNode & {
  type: "not";
  value?: LogicalNode;
};

export type GroupNode = BaseNode & {
  type: "group";
  value?: LogicalNode;
};

export type ListNode = BaseNode & {
  type: "list";
  children: Node[];
};

export type LogicalNode =
  | ComparisonNode
  | BooleanValueNode
  | AccessorNode
  | BooleanNode
  | NotNode
  | GroupNode;
export type Node =
  | LogicalNode
  | ValueNode<number>
  | ValueNode<string>
  | ListNode;
