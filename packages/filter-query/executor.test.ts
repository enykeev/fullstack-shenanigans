import { describe, expect, test } from "bun:test";

import { check } from "./executor";
import { parse } from "./parser";

describe("Query Executor", () => {
  test("check simple condition", () => {
    expect(check({}, parse("true"))).toEqual(true);
    expect(check({}, parse("false"))).toEqual(false);
  });

  test("check accessor condition", () => {
    const obj = {
      some: 5,
    };
    expect(check(obj, parse("some = 5"))).toEqual(true);
    expect(check(obj, parse("some = 6"))).toEqual(false);
    expect(check(obj, parse("nonExistentValue = 5"))).toEqual(false);
  });

  test("check boolean conditions", () => {
    expect(check({}, parse("true && true"))).toEqual(true);
    expect(check({}, parse("true && false"))).toEqual(false);
    expect(check({}, parse("false && true"))).toEqual(false);
    expect(check({}, parse("false && false"))).toEqual(false);

    expect(check({}, parse("true || true"))).toEqual(true);
    expect(check({}, parse("true || false"))).toEqual(true);
    expect(check({}, parse("false || true"))).toEqual(true);
    expect(check({}, parse("false || false"))).toEqual(false);

    expect(check({}, parse("!true"))).toEqual(false);
    expect(check({}, parse("!false"))).toEqual(true);
    expect(check({}, parse("!!true"))).toEqual(true);
    expect(check({}, parse("!(true)"))).toEqual(false);
    expect(check({}, parse("!(true && false)"))).toEqual(true);
  });

  test("check complex conditions", () => {
    const obj = {
      some: 5,
      thing: "else",
    };

    expect(check(obj, parse('some = 5 and thing = "else"'))).toEqual(true);
    expect(check(obj, parse('some = 5 or thing != "else"'))).toEqual(true); // NOTE: since `some = 5` is already truthful, `thing != "else"` is not going to be evaluated at all
    expect(check(obj, parse('some = 6 or thing = "else"'))).toEqual(true);
  });

  test("check evaluating simplified decision trees", () => {
    const obj = {
      some: 5,
      thing: "else",
    };

    expect(
      check(obj, parse('some = 5 and thing = "else"', { simplify: true })),
    ).toEqual(true);
  });
});
