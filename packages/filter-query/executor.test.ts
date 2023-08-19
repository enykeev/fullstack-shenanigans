import { describe, expect, test } from "bun:test";

import { Node } from "./ast";
import { check } from "./executor";

describe("Query Executor", () => {
  test("check simple condition", () => {
    expect(
      check(
        {},
        {
          type: "comparison",
          subtype: "=",
          left: {
            type: "value",
            value: 5,
          },
          right: {
            type: "value",
            value: 5,
          },
        },
      ),
    ).toEqual(true);
    expect(
      check(
        {},
        {
          type: "comparison",
          subtype: "=",
          left: {
            type: "value",
            value: 6,
          },
          right: {
            type: "value",
            value: 5,
          },
        },
      ),
    ).toEqual(false);
  });

  test("check accessor condition", () => {
    const obj = {
      some: 5,
    };
    expect(
      check(obj, {
        type: "comparison",
        subtype: "=",
        left: {
          type: "accessor",
          key: "some",
        },
        right: {
          type: "value",
          value: 5,
        },
      }),
    ).toEqual(true);
    expect(
      check(obj, {
        type: "comparison",
        subtype: "=",
        left: {
          type: "accessor",
          key: "some",
        },
        right: {
          type: "value",
          value: 6,
        },
      }),
    ).toEqual(false);
    expect(
      check(obj, {
        type: "comparison",
        subtype: "=",
        left: {
          type: "accessor",
          key: "non-existent",
        },
        right: {
          type: "value",
          value: 5,
        },
      }),
    ).toEqual(false);
  });

  test("check boolean conditions", () => {
    expect(
      check(
        {},
        {
          type: "boolean",
          subtype: "&&",
          left: {
            type: "value",
            value: true,
          },
          right: {
            type: "value",
            value: true,
          },
        },
      ),
    ).toEqual(true);
    expect(
      check(
        {},
        {
          type: "boolean",
          subtype: "&&",
          left: {
            type: "value",
            value: true,
          },
          right: {
            type: "value",
            value: false,
          },
        },
      ),
    ).toEqual(false);
    expect(
      check(
        {},
        {
          type: "boolean",
          subtype: "&&",
          left: {
            type: "value",
            value: false,
          },
          right: {
            type: "value",
            value: true,
          },
        },
      ),
    ).toEqual(false);
    expect(
      check(
        {},
        {
          type: "boolean",
          subtype: "&&",
          left: {
            type: "value",
            value: false,
          },
          right: {
            type: "value",
            value: false,
          },
        },
      ),
    ).toEqual(false);

    expect(
      check(
        {},
        {
          type: "boolean",
          subtype: "||",
          left: {
            type: "value",
            value: true,
          },
          right: {
            type: "value",
            value: true,
          },
        },
      ),
    ).toEqual(true);
    expect(
      check(
        {},
        {
          type: "boolean",
          subtype: "||",
          left: {
            type: "value",
            value: true,
          },
          right: {
            type: "value",
            value: false,
          },
        },
      ),
    ).toEqual(true);
    expect(
      check(
        {},
        {
          type: "boolean",
          subtype: "||",
          left: {
            type: "value",
            value: true,
          },
          right: {
            type: "value",
            value: false,
          },
        },
      ),
    ).toEqual(true);
    expect(
      check(
        {},
        {
          type: "boolean",
          subtype: "||",
          left: {
            type: "value",
            value: false,
          },
          right: {
            type: "value",
            value: false,
          },
        },
      ),
    ).toEqual(false);

    expect(
      check(
        {},
        {
          type: "not",
          value: {
            type: "value",
            value: true,
          },
        },
      ),
    ).toEqual(false);
    expect(
      check(
        {},
        {
          type: "not",
          value: {
            type: "value",
            value: false,
          },
        },
      ),
    ).toEqual(true);
  });

  test("check complex conditions", () => {
    const obj = {
      some: 5,
      thing: "else",
    };

    let condition: Node = {
      type: "boolean",
      subtype: "&&",
      left: {
        type: "comparison",
        subtype: "=",
        left: {
          type: "accessor",
          key: "some",
        },
        right: {
          type: "value",
          value: 5,
        },
      },
      right: {
        type: "comparison",
        subtype: "=",
        left: {
          type: "accessor",
          key: "thing",
        },
        right: {
          type: "value",
          value: "else",
        },
      },
    };
    expect(check(obj, condition)).toEqual(true);

    condition = {
      type: "boolean",
      subtype: "||",
      left: {
        type: "comparison",
        subtype: "=",
        left: {
          type: "accessor",
          key: "some",
        },
        right: {
          type: "value",
          value: 5,
        },
      },
      right: {
        type: "not",
        value: {
          type: "comparison",
          subtype: "=",
          left: {
            type: "accessor",
            key: "thing",
          },
          right: {
            type: "value",
            value: "else",
          },
        },
      },
    };
    expect(check(obj, condition)).toEqual(true);
  });
});
