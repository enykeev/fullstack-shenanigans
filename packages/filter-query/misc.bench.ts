import { baseline, bench, group, run } from "mitata";

import { Node } from "./ast";
import { traverse } from "./traversal";

function getNode() {
  const a: Node = {
    key: "some",
    token: {
      end: 4,
      start: 0,
      tag: "key",
      value: "some",
    },
    type: "accessor",
  };

  const b: Node = {
    token: {
      end: 8,
      start: 7,
      tag: "integer",
      value: "5",
    },
    type: "value",
    value: 5,
  };

  const c: Node = {
    left: a,
    right: b,
    subtype: "=",
    token: {
      end: 6,
      start: 5,
      tag: "=",
      value: "=",
    },
    type: "comparison",
  };

  a.parent = c;
  b.parent = c;

  return c;
}

// It has been argued previously that deleting a prtoperty from an object is slower than setting it to undefined.
// It's curious to see the real and modern numbers for a new runtime.
group("Deleting vs setting to undefined", () => {
  baseline("do nothing", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const a = { b: "c" };
  });

  bench("delete nodes", () => {
    const a: Record<string, string | undefined> = { b: "c" };
    delete a.b;
  });

  bench("set nodes to undefined", () => {
    const a: Record<string, string | undefined> = { b: "c" };
    a.b = undefined;
  });

  // Result: Deleting a property is about 4x slower than setting it to undefined
});

group("Deleting vs setting to undefined via tree traversal", () => {
  baseline("generate AST tree", () => {
    getNode();
  });

  bench("traverse an AST tree", () => {
    traverse(getNode(), () => {});
  });

  bench("traverse an AST tree and delete properties", () => {
    traverse(getNode(), (node) => {
      delete node.parent;
      delete node.token;
    });
  });

  bench("traverse an AST tree and set properties to undefined", () => {
    traverse(getNode(), (node) => {
      node.parent = undefined;
      node.token = undefined;
    });
  });

  // Result: Generating a tree and traversing it is so much more expensive, the difference is purely theoretical.
});

await run({
  avg: true,
  json: false,
  colors: true,
  min_max: true,
  collect: false,
  percentiles: false,
});
