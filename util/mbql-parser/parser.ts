import { Token, tokenize } from "./tokenizer";
import { JSONValue, JSONArray, JSONObject } from "./ast";

// Recursive descent parser for JSON values
export function parseJSON(tokens: Token[], index = 0): [JSONValue, number] {
  const token = tokens[index];
  if (!token) throw new SyntaxError("Unexpected end of input");
  switch (token.type) {
    case "string":
      return [token.value, index + 1];
    case "number":
      return [token.value, index + 1];
    case "true":
      return [true, index + 1];
    case "false":
      return [false, index + 1];
    case "null":
      return [null, index + 1];
    case "braceOpen":
      return parseObject(tokens, index + 1);
    case "bracketOpen":
      return parseArray(tokens, index + 1);
    default:
      throw new SyntaxError(`Unexpected token ${token.type}`);
  }
}

function parseObject(tokens: Token[], index: number): [JSONObject, number] {
  const obj: JSONObject = {};
  let i = index;
  if (tokens[i]?.type === "braceClose") return [obj, i + 1];
  while (i < tokens.length) {
    const keyToken = tokens[i];
    if (keyToken?.type !== "string") throw new SyntaxError("Expected string key");
    const key = keyToken.value;
    if (tokens[i + 1]?.type !== "colon") throw new SyntaxError("Expected colon after key");
    const [value, next] = parseJSON(tokens, i + 2);
    obj[key] = value;
    i = next;
    const sep = tokens[i];
    if (sep?.type === "comma") {
      i++;
      continue;
    }
    if (sep?.type === "braceClose") {
      return [obj, i + 1];
    }
    throw new SyntaxError("Expected comma or closing brace");
  }
  throw new SyntaxError("Unterminated object");
}

function parseArray(tokens: Token[], index: number): [JSONArray, number] {
  const arr: JSONArray = [];
  let i = index;
  if (tokens[i]?.type === "bracketClose") return [arr, i + 1];
  while (i < tokens.length) {
    const [value, next] = parseJSON(tokens, i);
    arr.push(value);
    i = next;
    const sep = tokens[i];
    if (sep?.type === "comma") {
      i++;
      continue;
    }
    if (sep?.type === "bracketClose") {
      return [arr, i + 1];
    }
    throw new SyntaxError("Expected comma or closing bracket");
  }
  throw new SyntaxError("Unterminated array");
}

export function parse(input: string): JSONValue {
  const tokens = tokenize(input);
  const [value, index] = parseJSON(tokens);
  if (index !== tokens.length) {
    throw new SyntaxError("Unexpected trailing tokens");
  }
  return value;
}
