import { describe, expect, test } from "bun:test";
import { filter } from ".";

describe("Public API", () => {
  test("filter", () => {
    const collection = [
      {
        name: "Moody Hurst",
        age: 23,
        city: "Idamay",
      },
      {
        name: "Dunn Kline",
        age: 41,
        city: "Blairstown",
      },
      {
        name: "Holt Petersen",
        age: 31,
        city: "Cherokee",
      },
      {
        name: "Frank Davis",
        age: 29,
        city: "Cherokee",
      },
      {
        name: "Lucille Cummings",
        age: 18,
        city: "Bentonville",
      },
    ];

    expect(filter(collection, "name = 'Moody Hurst'")).toEqual([collection[0]]);
    expect(filter(collection, "age > 30")).toEqual([
      collection[1],
      collection[2],
    ]);
    expect(filter(collection, "city != 'Cherokee'")).toEqual([
      collection[0],
      collection[1],
      collection[4],
    ]);
    expect(filter(collection, 'city == "Cherokee" && age < 30')).toEqual([
      collection[3],
    ]);
    expect(filter(collection, "age < 20 || age > 40")).toEqual([
      collection[1],
      collection[4],
    ]);
    //expect(filter(collection, "city in ['Bentonville', 'Idamay']")).toEqual([collection[0], collection[4]]) // TODO
    //expect(filter(collection, "name startsWith 'Frank'")).toEqual([collection[3]]) // TODO
    //expect(filter(collection, "name endsWith 's'")).toEqual([collection[3], collection[4]]) // TODO
    //expect(filter(collection, "name contains 'mm'")).toEqual([collection[4]]) // TODO
  });
});
