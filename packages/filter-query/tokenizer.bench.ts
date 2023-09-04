import { bench, prepare, run } from "mitata";

import { Token, Tokenizer } from "./tokenizer";

let tokenizer: Tokenizer;
let result: Token | undefined;

prepare("tokenizer", () => {
  tokenizer = new Tokenizer(" ");
});

bench("tokenize a space", () => {
  do {
    result = tokenizer.next();
  } while (result);
  tokenizer.reset();
});

prepare("tokenizer", () => {
  tokenizer = new Tokenizer("'a'");
});

bench("tokenize a single quoted string", () => {
  result = tokenizer.next();
  tokenizer.reset();
});

prepare("tokenizer", () => {
  tokenizer = new Tokenizer(" ".repeat(10));
});

bench("tokenize 10 spaces", () => {
  do {
    result = tokenizer.next();
  } while (result);
  tokenizer.reset();
});

prepare("tokenizer", () => {
  tokenizer = new Tokenizer(" true".repeat(5));
});

bench("tokenize 10 early tokens", () => {
  do {
    result = tokenizer.next();
  } while (result);
  tokenizer.reset();
});

prepare("tokenizer", () => {
  tokenizer = new Tokenizer("[]".repeat(5));
});

bench("tokenize 10 late tokens", () => {
  do {
    result = tokenizer.next();
  } while (result);
  tokenizer.reset();
});

await run({
  avg: true,
  json: false,
  colors: true,
  min_max: true,
  collect: false,
  percentiles: false,
});
