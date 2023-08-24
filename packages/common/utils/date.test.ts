import { describe, expect, test } from "bun:test";
import { humanTime } from "./date";

describe("Date Util", () => {
  test("humanTime", () => {
    expect(humanTime(0)).toMatchSnapshot();
    expect(humanTime(0.1)).toMatchSnapshot();
    expect(humanTime(1)).toMatchSnapshot();
    expect(humanTime(60 - 1)).toMatchSnapshot();
    expect(humanTime(60)).toMatchSnapshot();
    expect(humanTime(1.5 * 60)).toMatchSnapshot();
    expect(humanTime(60 * 60 - 1)).toMatchSnapshot();
    expect(humanTime(60 * 60)).toMatchSnapshot();
    expect(humanTime(24 * 60 * 60 - 1)).toMatchSnapshot();
    expect(humanTime(24 * 60 * 60)).toMatchSnapshot();
    expect(humanTime(7 * 24 * 60 * 60 - 1)).toMatchSnapshot();
    expect(humanTime(7 * 24 * 60 * 60)).toMatchSnapshot();
    expect(humanTime(30 * 24 * 60 * 60 - 1)).toMatchSnapshot();
    expect(humanTime(30 * 24 * 60 * 60)).toMatchSnapshot();
    expect(humanTime(52 * 7 * 24 * 60 * 60)).toMatchSnapshot();
  });
});
