import { describe, expect, test } from "bun:test";

import { generateToken } from "./tokenizer";

describe("Tokenizer", () => {
  test("empty string", () => {
    expect([...generateToken("")]).toMatchSnapshot();
  });

  test("space", () => {
    expect([...generateToken(" ")]).toMatchSnapshot();
  });

  test("boolean literals", () => {
    expect([...generateToken("true")]).toMatchSnapshot();
    expect([...generateToken("True")]).toMatchSnapshot();
    expect([...generateToken("TRUE")]).toMatchSnapshot();
    expect([...generateToken("false")]).toMatchSnapshot();
    expect([...generateToken("False")]).toMatchSnapshot();
    expect([...generateToken("FALSE")]).toMatchSnapshot();
  });

  test("integers", () => {
    expect([...generateToken("1")]).toMatchSnapshot();
    expect([...generateToken("-1")]).toMatchSnapshot();
    expect([...generateToken("+1")]).toMatchSnapshot();
    expect([...generateToken("50")]).toMatchSnapshot();
    expect([...generateToken("999999999999999999999")]).toMatchSnapshot();
  });

  test("floats", () => {
    expect([...generateToken("1.2")]).toMatchSnapshot();
    expect([...generateToken("-1.2")]).toMatchSnapshot();
    expect([...generateToken("+1.2")]).toMatchSnapshot();
    expect([...generateToken("49.99")]).toMatchSnapshot();
    expect([
      ...generateToken("999999999999999999999.999999999"),
    ]).toMatchSnapshot();
  });

  test("comparators", () => {
    expect([...generateToken("a = 1")]).toMatchSnapshot();
    expect([...generateToken("a == 1")]).toMatchSnapshot();
    expect([...generateToken("a != 1")]).toMatchSnapshot();
    expect([...generateToken("a !== 1")]).toMatchSnapshot();
    expect([...generateToken("a > 1")]).toMatchSnapshot();
    expect([...generateToken("a >= 1")]).toMatchSnapshot();
    expect([...generateToken("a < 1")]).toMatchSnapshot();
    expect([...generateToken("a <= 1")]).toMatchSnapshot();
  });

  test("booleans", () => {
    expect([...generateToken("a && b")]).toMatchSnapshot();
    expect([...generateToken("a and b")]).toMatchSnapshot();
    expect([...generateToken("a || b")]).toMatchSnapshot();
    expect([...generateToken("a or b")]).toMatchSnapshot();
    expect([...generateToken("!a")]).toMatchSnapshot();
    expect([...generateToken("not a")]).toMatchSnapshot();
    // But
    expect([...generateToken("nota")]).toMatchSnapshot(); // A KEY instead of a NOT
  });

  test("parens", () => {
    expect([...generateToken("(a && b)")]).toMatchSnapshot();
    expect([...generateToken("( a && b )")]).toMatchSnapshot();
    expect([...generateToken("(a)")]).toMatchSnapshot();
    expect([...generateToken("(1)")]).toMatchSnapshot();
    expect([...generateToken("( 1 )")]).toMatchSnapshot();
    expect([...generateToken(" (1) ")]).toMatchSnapshot();
    expect([...generateToken("f()")]).toMatchSnapshot();
    expect([...generateToken("((()))")]).toMatchSnapshot();
    expect([...generateToken("[a]")]).toMatchSnapshot();
    expect([...generateToken("[ a ]")]).toMatchSnapshot();
    expect([...generateToken("[1]")]).toMatchSnapshot();
    expect([...generateToken("[ 1 ]")]).toMatchSnapshot();
    expect([...generateToken(" [1] ")]).toMatchSnapshot();
    expect([...generateToken("f[]")]).toMatchSnapshot();
    expect([...generateToken("[[[]]]")]).toMatchSnapshot();
  });

  test("lists", () => {
    expect([...generateToken("[]")]).toMatchSnapshot();
    expect([...generateToken("[1,2]")]).toMatchSnapshot();
    expect([...generateToken("[1, 2]")]).toMatchSnapshot();
    expect([...generateToken("[ 1, 2 ]")]).toMatchSnapshot();
    expect([...generateToken("[,,,]")]).toMatchSnapshot();
    expect([...generateToken("[1,2,]")]).toMatchSnapshot();
  });

  test("keys", () => {
    expect([...generateToken("a")]).toMatchSnapshot();
    expect([...generateToken("a1")]).toMatchSnapshot();
    // But
    expect([...generateToken("1a")]).toMatchSnapshot(); // Integer followed by the key rather than a singular key
  });

  test("strings", () => {
    expect([...generateToken(`'a'`)]).toMatchSnapshot();
    expect([...generateToken(`'fizzbuzz'`)]).toMatchSnapshot();
    expect([...generateToken(`'a\n\na'`)]).toMatchSnapshot();
    // eslint-disable-next-line no-useless-escape
    expect([...generateToken(`'a\'\\'\\\'\\\\''`)]).toMatchSnapshot();
    expect([...generateToken(`'1'`)]).toMatchSnapshot();
    expect([...generateToken(`'!@#$%^&*()'`)]).toMatchSnapshot();
    expect([...generateToken(`''`)]).toMatchSnapshot();
    expect([...generateToken(`' '`)]).toMatchSnapshot();
    expect([...generateToken(` '   ' `)]).toMatchSnapshot();

    expect([...generateToken(`"a"`)]).toMatchSnapshot();
    expect([...generateToken(`"fizzbuzz"`)]).toMatchSnapshot();
    expect([...generateToken(`"a\n\na"`)]).toMatchSnapshot();
    // eslint-disable-next-line no-useless-escape
    expect([...generateToken(`"a\'\\'\\\'\\\\'"`)]).toMatchSnapshot();
    expect([...generateToken(`"1"`)]).toMatchSnapshot();
    expect([...generateToken(`"!@#$%^&*()"`)]).toMatchSnapshot();
    expect([...generateToken(`""`)]).toMatchSnapshot();
    expect([...generateToken(`" "`)]).toMatchSnapshot();
    expect([...generateToken(` "   " `)]).toMatchSnapshot();
  });

  test("complex", () => {
    const str = `aaa.bb.c == 1.5 && (res.some !== "thing" or FALSE) && value >= -1 && value < -.16 and key in [1,'2',3.0]`;
    expect([...generateToken(str)]).toMatchSnapshot();
  });
});
