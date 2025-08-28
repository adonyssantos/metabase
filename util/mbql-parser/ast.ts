export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONArray
  | JSONObject;

export type JSONArray = JSONValue[];
export type JSONObject = { [k: string]: JSONValue };

// AST nodes for a minimal subset of MBQL
export interface FieldRef {
  readonly type: "field";
  readonly id: number;
}

export interface Binary {
  readonly type: "binary";
  readonly op: "+" | "-" | "*" | "/";
  readonly left: Expression;
  readonly right: Expression;
}

export interface StartsWith {
  readonly type: "starts-with";
  readonly target: Expression;
  readonly prefix: string;
}

export interface IsNull {
  readonly type: "is-null";
  readonly target: Expression;
}

export interface Raw {
  readonly type: "raw";
  readonly sql: string;
}

export interface Comparison {
  readonly type: "comparison";
  readonly op: "=" | ">" | "<";
  readonly left: Expression;
  readonly right: Expression;
}

export interface Logical {
  readonly type: "logical";
  readonly op: "and" | "or";
  readonly args: Expression[];
}

export interface Literal {
  readonly type: "literal";
  readonly value: string | number | boolean | null;
}

export type Expression =
  | FieldRef
  | Comparison
  | Logical
  | Literal
  | Binary
  | StartsWith
  | IsNull
  | Raw;

export interface Query {
  readonly sourceTable: number;
  readonly fields: Expression[];
  readonly filter?: Expression;
  readonly limit?: number;
}
