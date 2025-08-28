import { JSONValue, Query, FieldRef, Expression, Literal, Binary, StartsWith, IsNull, Raw } from "./ast";

export function buildQuery(json: JSONValue): Query {
  if (typeof json !== "object" || json === null || Array.isArray(json)) {
    throw new Error("Query must be a JSON object");
  }
  const obj = json as { [k: string]: any };
  const sourceTable = expectNumber(obj["source-table"], "source-table");

  const expressions: Record<string, Expression> = {};
  if (obj.expressions && typeof obj.expressions === "object") {
    for (const [name, expr] of Object.entries(obj.expressions)) {
      expressions[name] = buildExpression(expr, expressions);
    }
  }

  const fields = Array.isArray(obj.fields)
    ? obj.fields.map((f: any) => buildExpression(f, expressions))
    : [];
  const filter = obj.filter ? buildExpression(obj.filter, expressions) : undefined;
  const limit = obj.limit !== undefined ? expectNumber(obj.limit, "limit") : undefined;
  return { sourceTable, fields, filter, limit };
}

function buildExpression(value: any, ctx: Record<string, Expression> = {}): Expression {
  if (Array.isArray(value)) {
    const [op, ...rest] = value;
    switch (op) {
      case "field":
        return { type: "field", id: expectNumber(rest[0], "field id") } as FieldRef;
      case "expression": {
        const name = String(rest[0]);
        if (!ctx[name]) throw new Error(`Unknown expression ${name}`);
        return ctx[name];
      }
      case "=":
      case ">":
      case "<":
        return {
          type: "comparison",
          op,
          left: buildExpression(rest[0], ctx),
          right: buildExpression(rest[1], ctx),
        };
      case "and":
      case "or":
        return { type: "logical", op, args: rest.map(r => buildExpression(r, ctx)) };
      case "+":
      case "-":
      case "*":
      case "/":
        return {
          type: "binary",
          op,
          left: buildExpression(rest[0], ctx),
          right: buildExpression(rest[1], ctx),
        } as Binary;
      case "starts-with":
        return {
          type: "starts-with",
          target: buildExpression(rest[0], ctx),
          prefix: String(rest[1]),
        } as StartsWith;
      case "is-null":
        return { type: "is-null", target: buildExpression(rest[0], ctx) } as IsNull;
      default:
        return { type: "raw", sql: "1=1" } as Raw;
    }
  }
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null
  ) {
    return { type: "literal", value } as Literal;
  }
  throw new Error("Unsupported expression type");
}

function expectNumber(value: any, name: string): number {
  if (typeof value !== "number") throw new Error(`Expected number for ${name}`);
  return value;
}
