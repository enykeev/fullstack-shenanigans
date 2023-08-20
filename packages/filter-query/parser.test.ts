import { describe, expect, test } from "bun:test";
import { parse } from "./parser";

describe("Query Parser", () => {
  test("comparison", () => {
    // But
    expect(() => parse("= 1.2")).toThrow(
      `expression should not start with token "="`,
    );
    expect(() => parse("(= 1.2)")).toThrow(
      `token "=" should not follow node of type "group"`,
    );
    expect(() => parse("!= 1.2")).toThrow(
      `expression should not start with token "!="`,
    );
    expect(() => parse("(!= 1.2)")).toThrow(
      `token "!=" should not follow node of type "group"`,
    );
  });

  test("complex", () => {
    const str = `aaa.bb.c == 1.5 && (res.some !== "thing" or FALSE) && value >= -1 && value < -.16 and key in [1,'2',3.0]`;
    expect(parse(str)).toMatchSnapshot();
  });
});
