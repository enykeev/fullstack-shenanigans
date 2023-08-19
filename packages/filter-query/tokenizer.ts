export type TokenMatcher = {
  re: RegExp;
  tag: string;
};

export type Token = {
  tag: string;
  value: string;
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
    re: /^"(?<value>(?:[\\"]|[^"])+)"/,
    tag: "doubleQuotedStringLiteral",
  },
  {
    re: /^"(?<value>(?=["]))"/,
    tag: "doubleQuotedStringLiteral",
  },
  {
    re: /^'(?<value>(?:[\\']|[^'])+)'/,
    tag: "singleQuotedStringLiteral",
  },
  {
    re: /^'(?<value>(?=[']))'/,
    tag: "singleQuotedStringLiteral",
  },
];

export const generateToken = function* (
  str: string,
): Generator<Token, undefined> {
  let cursor: number = 0;
  mainLoop: while (cursor < str.length) {
    const restString = str.slice(cursor);
    for (let i = 0; i < matchers.length; i++) {
      const match = restString.match(matchers[i].re);
      if (match && match.groups) {
        const token: Token = {
          tag: matchers[i].tag,
          value: match.groups.value,
        };
        yield token;
        cursor += match[0].length;
        continue mainLoop;
      }
    }
    throw new Error(`error at position ${cursor}: ${str.slice(cursor)}`);
  }
};
