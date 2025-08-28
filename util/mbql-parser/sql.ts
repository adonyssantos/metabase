import { Query, Expression } from "./ast";

export function toSQL(query: Query): string {
  const select = query.fields.map(exprToSQL).join(", ");
  const from = `table_${query.sourceTable}`;
  const where = query.filter ? ` WHERE ${exprToSQL(query.filter)}` : "";
  const limit = query.limit !== undefined ? ` LIMIT ${query.limit}` : "";
  return `SELECT ${select} FROM ${from}${where}${limit};`;
}

function exprToSQL(expr: Expression): string {
  switch (expr.type) {
    case "literal":
      return literal(expr.value);
    case "field":
      return `field_${expr.id}`;
    case "binary":
      return `${exprToSQL(expr.left)} ${expr.op} ${exprToSQL(expr.right)}`;
    case "comparison":
      if (expr.op === "=") {
        return `${exprToSQL(expr.left)} = ${exprToSQL(expr.right)}`;
      }
      if (expr.op === ">" || expr.op === "<") {
        return `${exprToSQL(expr.left)} ${expr.op} ${exprToSQL(expr.right)}`;
      }
      return `${exprToSQL(expr.left)} ${expr.op} ${exprToSQL(expr.right)}`;
    case "logical":
      return expr.args.map(exprToSQL).join(` ${expr.op.toUpperCase()} `);
    case "starts-with":
      return `${exprToSQL(expr.target)} LIKE '${expr.prefix}%'`;
    case "is-null":
      return `${exprToSQL(expr.target)} IS NULL`;
    case "raw":
      return expr.sql;
  }
}

function literal(value: any): string {
  if (typeof value === "string") return `'${value}'`;
  if (value === null) return "NULL";
  return String(value);
}
