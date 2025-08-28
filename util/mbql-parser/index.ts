import { parse } from "./parser";
import { buildQuery } from "./mbql";
import { toSQL } from "./sql";

export function mbqlToSQL(input: string): string {
  const json = parse(input);
  const query = buildQuery(json);
  return toSQL(query);
}

if (require.main === module) {
  const example = JSON.stringify({
    "source-table": 2,
    fields: [["field", 3, null]],
    filter: [">", ["field", 4, null], 10],
    limit: 100,
  });
  console.log(mbqlToSQL(example));
}
