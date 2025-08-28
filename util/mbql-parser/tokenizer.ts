export type Token =
  | { type: "braceOpen" }
  | { type: "braceClose" }
  | { type: "bracketOpen" }
  | { type: "bracketClose" }
  | { type: "colon" }
  | { type: "comma" }
  | { type: "string"; value: string }
  | { type: "number"; value: number }
  | { type: "true" }
  | { type: "false" }
  | { type: "null" };

const WHITESPACE = /\s/;

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < input.length) {
    const char = input[i];
    if (WHITESPACE.test(char)) {
      i++;
      continue;
    }
    switch (char) {
      case '{':
        tokens.push({ type: "braceOpen" });
        i++;
        continue;
      case '}':
        tokens.push({ type: "braceClose" });
        i++;
        continue;
      case '[':
        tokens.push({ type: "bracketOpen" });
        i++;
        continue;
      case ']':
        tokens.push({ type: "bracketClose" });
        i++;
        continue;
      case ':':
        tokens.push({ type: "colon" });
        i++;
        continue;
      case ',':
        tokens.push({ type: "comma" });
        i++;
        continue;
      case '"':
        let j = i + 1;
        let str = "";
        while (j < input.length && input[j] !== '"') {
          if (input[j] === '\\') {
            j++;
            str += input[j];
          } else {
            str += input[j];
          }
          j++;
        }
        tokens.push({ type: "string", value: str });
        i = j + 1;
        continue;
      default:
        if (/[-0-9]/.test(char)) {
          let numStr = char;
          let j = i + 1;
          while (j < input.length && /[0-9.]/.test(input[j])) {
            numStr += input[j++];
          }
          tokens.push({ type: "number", value: Number(numStr) });
          i = j;
          continue;
        }
        if (input.startsWith("true", i)) {
          tokens.push({ type: "true" });
          i += 4;
          continue;
        }
        if (input.startsWith("false", i)) {
          tokens.push({ type: "false" });
          i += 5;
          continue;
        }
        if (input.startsWith("null", i)) {
          tokens.push({ type: "null" });
          i += 4;
          continue;
        }
        throw new SyntaxError(`Unexpected character '${char}' at ${i}`);
    }
  }
  return tokens;
}
