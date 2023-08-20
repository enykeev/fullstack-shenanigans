import { describe, expect, test } from "bun:test";
import { parse } from "./parser";

describe("Query Parser", () => {
  test("complex", () => {
    expect(
      parse(
        `aaa.bb.c == 1.5 && (res.some !== "thing" or FALSE) && value >= -1 && value < -.16 and key in [1,'2',3.0]`,
      ),
    ).toMatchSnapshot();
  });
});
