export type TokenMatcher = {
  re: RegExp;
  tag: string;
};

export type Token = {
  tag: string;
  value: string;
  start: number;
  end: number;
};

export const matchers: TokenMatcher[] = [
  {
    re: /^(?<value>\s+)/,
    tag: "space",
  },
  {
    re: /^(?<value>true)/i,
    tag: "true",
  },
  {
    re: /^(?<value>false)/i,
    tag: "false",
  },
  {
    re: /^(?<value>[+-]*\d*\.\d+)/,
    tag: "float",
  },
  {
    re: /^(?<value>[+-]*[0-9]+)/,
    tag: "integer",
  },
  {
    re: /^(?<value>in)/,
    tag: "in",
  },
  {
    re: /^(?<value>=|==)(?=[^=])/,
    tag: "=",
  },
  {
    re: /^(?<value>!=|!==)(?=[^=])/,
    tag: "!=",
  },
  {
    re: /^(?<value>!|not(?=\s))/,
    tag: "!",
  },
  {
    re: /^(?<value>>=)/,
    tag: ">=",
  },
  {
    re: /^(?<value><=)/,
    tag: "<=",
  },
  {
    re: /^(?<value>>)/,
    tag: ">",
  },
  {
    re: /^(?<value><)/,
    tag: "<",
  },
  {
    re: /^(?<value>&&|and)(?=[^&])/,
    tag: "&&",
  },
  {
    re: /^(?<value>\|\||or)(?=[^|])/,
    tag: "||",
  },
  {
    re: /^(?<value>\()/,
    tag: "(",
  },
  {
    re: /^(?<value>\))/,
    tag: ")",
  },
  {
    re: /^(?<value>\[)/,
    tag: "[",
  },
  {
    re: /^(?<value>\])/,
    tag: "]",
  },
  {
    re: /^(?<value>,)/,
    tag: ",",
  },
  {
    re: /^(?<value>[a-zA-Z0-9.]+)/,
    tag: "key",
  },
  {
    re: /^"(?<value>.*?[^\\])"/s,
    tag: "doubleQuotedStringLiteral",
  },
  {
    re: /^'(?<value>.*?[^\\])'/s,
    tag: "singleQuotedStringLiteral",
  },
  // For `''` and `""`
  {
    re: /^"(?<value>(?:[^"]?))"/,
    tag: "doubleQuotedStringLiteral",
  },
  {
    re: /^'(?<value>(?:[^']?))'/,
    tag: "singleQuotedStringLiteral",
  },
];

export class Tokenizer {
  private str: string;
  private index = 0;

  constructor(str: string) {
    this.str = str;
  }

  get done() {
    return this.index >= this.str.length;
  }

  reset() {
    this.index = 0;
  }

  slice(from: number, to?: number) {
    return this.str.slice(from, to);
  }

  next() {
    if (this.done) {
      return;
    }

    const restString = this.slice(this.index);

    for (let i = 0; i < matchers.length; i++) {
      const match = restString.match(matchers[i].re);
      if (match && match.groups) {
        const token: Token = {
          tag: matchers[i].tag,
          value: match.groups["value"],
          start: this.index,
          end: this.index + match[0].length,
        };
        this.index = token.end;

        return token;
      }
    }

    throw new Error(
      `error at position ${this.index}: no matcher for "${this.slice(
        this.index,
      )}"`,
    );
  }
}

export const generateToken = function* (
  str: string,
): Generator<Token, undefined> {
  const tokenizer = new Tokenizer(str);
  let token;
  do {
    token = tokenizer.next();
    if (token) {
      yield token;
    }
  } while (token);
};
