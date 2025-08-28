import { mbqlToSQL } from "./index";

// Example MBQL query demonstrating many MBQL features
const example = {
  database: 1,
  type: "query" as const,
  query: {
    "source-table": 2,
    joins: [
      {
        alias: "cust",
        "source-table": 10,
        fields: [
          ["field", 21, { "join-alias": "cust" }],
          ["field", 22, { "join-alias": "cust" }],
        ],
        condition: ["=", ["field", 3, null], ["field", 20, { "join-alias": "cust" }]],
        strategy: "left-join",
      },
      {
        alias: "act",
        "source-query": {
          "source-table": 11,
          filter: ["=", ["field", 23, null], true],
        },
        condition: ["=", ["field", 3, null], ["field", 30, { "join-alias": "act" }]],
        strategy: "inner-join",
      },
    ],
    expressions: {
      total_price: ["*", ["field", 9, null], ["field", 10, null]],
      discounted_total: ["-", ["expression", "total_price"], ["field", 11, null]],
    },
    fields: [
      ["field", 3, { alias: "id" }],
      ["expression", "total_price"],
    ],
    aggregation: [
      ["sum", ["expression", "discounted_total"], { name: "total_after_discount" }],
      ["count", "*", { name: "row_count" }],
    ],
    breakout: [
      ["field", 6, { "temporal-unit": "month" }],
      ["field", 3, null],
    ],
    filter: [
      "and",
      ["=", ["field", 5, null], "completed"],
      [">", ["field", 9, null], 10],
      [
        "between",
        ["field", 6, { "temporal-unit": "day" }],
        ["datetime-add", ["now"], -30, "day"],
        ["now"],
      ],
      ["inside", ["field", 17, null], ["polygon", [0, 0], [0, 10], [10, 10], [10, 0]]],
      ["time-interval", ["field", 6, null], -1, "year", { "include-current": true }],
      [
        "or",
        ["starts-with", ["field", 7, null], "A"],
        ["is-null", ["field", 8, { "join-alias": "cust" }]],
      ],
    ],
    "order-by": [
      ["desc", ["aggregation", 0]],
      ["asc", ["field", 6, { "temporal-unit": "month" }]],
    ],
    limit: 100,
    page: 1,
  },
};

try {
  const sql = mbqlToSQL(JSON.stringify(example.query));
  console.log(sql);
} catch (err) {
  console.error("Failed to translate example:", (err as Error).message);
}
