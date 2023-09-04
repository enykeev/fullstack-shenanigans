import { describe, expect, test } from "bun:test";

import { parse } from "./parser";

describe("Query Parser", () => {
  test("spaces", () => {
    expect(parse("")).toMatchSnapshot();
    expect(parse(" ")).toMatchSnapshot();
    expect(parse("        ")).toMatchSnapshot();
  });

  test("accessors", () => {
    expect(parse("a")).toMatchSnapshot();
    expect(parse("some")).toMatchSnapshot();
    expect(parse("some.thing")).toMatchSnapshot();
    expect(parse("a.1")).toMatchSnapshot();
    // But
    expect(() => parse("a/b")).toThrow(
      `error at position 1: no matcher for "/b"`,
    );
    // TODO
    expect(() => parse("a[1]")).toThrow(
      `token "[" should not follow node of type "accessor"`,
    );
    expect(() => parse("a_b")).toThrow(
      `error at position 1: no matcher for "_b"`,
    );
    expect(() => parse("_a")).toThrow(
      `error at position 0: no matcher for "_a"`,
    );
  });

  test("values", () => {
    expect(parse("true")).toMatchSnapshot();
    expect(parse("True")).toMatchSnapshot();
    expect(parse("TRUE")).toMatchSnapshot();
    expect(parse("false")).toMatchSnapshot();
    expect(parse("False")).toMatchSnapshot();
    expect(parse("FALSE")).toMatchSnapshot();
    // Currently, tou can't start expression with a value
    expect(() => parse("1")).toThrow(
      `expression should not start with token "integer"`,
    );
    expect(() => parse("'1'")).toThrow(
      `expression should not start with token "singleQuotedStringLiteral"`,
    );
    expect(() => parse('"1"')).toThrow(
      `expression should not start with token "doubleQuotedStringLiteral"`,
    );
  });

  test("comparisons", () => {
    expect(parse("a = 1")).toMatchSnapshot();
    expect(parse("a == 1")).toMatchSnapshot();
    expect(parse("a = 'a'")).toMatchSnapshot();
    expect(parse("a == 'a'")).toMatchSnapshot();
    expect(parse('a = "a"')).toMatchSnapshot();
    expect(parse('a == "a"')).toMatchSnapshot();

    expect(parse("a != 1")).toMatchSnapshot();
    expect(parse("a !== 1")).toMatchSnapshot();
    expect(parse("a != 'a'")).toMatchSnapshot();
    expect(parse("a !== 'a'")).toMatchSnapshot();
    expect(parse('a != "a"')).toMatchSnapshot();
    expect(parse('a !== "a"')).toMatchSnapshot();

    expect(parse("a > 1")).toMatchSnapshot();
    expect(parse("a > 'a'")).toMatchSnapshot(); // TODO: Should we disable it on parser level or let executor decide on implementation?
    expect(parse('a > "a"')).toMatchSnapshot(); // TODO: ^^
    expect(parse("a > true")).toMatchSnapshot(); // TODO: ^^

    expect(parse("a >= 1")).toMatchSnapshot();
    expect(parse("a >= 'a'")).toMatchSnapshot(); // TODO: ^^
    expect(parse('a >= "a"')).toMatchSnapshot(); // TODO: ^^
    expect(parse("a >= true")).toMatchSnapshot(); // TODO: ^^

    expect(parse("a < 1")).toMatchSnapshot();
    expect(parse("a < 'a'")).toMatchSnapshot(); // TODO: ^^
    expect(parse('a < "a"')).toMatchSnapshot(); // TODO: ^^
    expect(parse("a < true")).toMatchSnapshot(); // TODO: ^^

    expect(parse("a <= 1")).toMatchSnapshot();
    expect(parse("a <= 'a'")).toMatchSnapshot(); // TODO: ^^
    expect(parse('a <= "a"')).toMatchSnapshot(); // TODO: ^^
    expect(parse("a <= true")).toMatchSnapshot(); // TODO: ^^

    expect(parse("a in [1,2,3]")).toMatchSnapshot();
    expect(parse("a in 'abc'")).toMatchSnapshot(); // TODO: add executor support

    expect(parse("not (a in [1,2,3])")).toMatchSnapshot();
    expect(parse("!(a in [1,2,3])")).toMatchSnapshot();
    // But
    expect(() => parse("a << 1.2")).toThrow(
      `token "<" should not follow node of type "comparison"`,
    );
    expect(() => parse("a >> 1.2")).toThrow(
      `token ">" should not follow node of type "comparison"`,
    );
    expect(() => parse("a === 1.2")).toThrow(
      `error at position 2: no matcher for "=== 1.2"`,
    );
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
    // TODO
    expect(() => parse("a not in [1,2,3]")).toThrow(
      `token "!" should not follow node of type "accessor"`,
    );
  });

  test("booleans", () => {
    expect(parse("true && true")).toMatchSnapshot();
    expect(parse("false || true")).toMatchSnapshot();
    expect(parse("true && true && false")).toMatchSnapshot();
    expect(parse("false || true && false")).toMatchSnapshot();
  });

  test("complex", () => {
    let str = `aaa.bb.c == 1.5 && (res.some !== "thing" or FALSE) && value >= -1 && value < -.16 and key in [1,'2',3.0]`;
    expect(parse(str)).toMatchSnapshot();

    str = `some = 5 or thing != "else"`;
    expect(parse(str)).toMatchSnapshot();

    str = `!(true)`;
    expect(parse(str)).toMatchSnapshot();
  });

  describe("options", () => {
    test("simplify", () => {
      const str = `aaa.bb.c == 1.5 && (res.some !== "thing" or FALSE) && value >= -1 && value < -.16 and key in [1,'2',3.0]`;
      expect(parse(str, { simplify: true })).toMatchSnapshot();
    });
  });
});
