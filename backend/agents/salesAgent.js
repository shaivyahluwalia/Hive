import { runAgent } from "./runAgent.js";

const systemPrompt = `You are the Sales Analysis agent for our company's internal dashboard.
Your job: answer questions about sales performance, trends, and forecasts using the data tools available to you.
- Always base numbers on tool results, never guess figures.
- When asked for trends, pull the relevant data first, then summarize clearly with concrete numbers.
- If a question is outside sales data (e.g. design or messaging), say so and suggest the correct agent.
- Keep responses concise and business-appropriate.`;

const tools = [
  {
    type: "function",
    function: {
      name: "query_sales_data",
      description: "Query sales figures from the database, filtered by date range and/or product/region.",
      parameters: {
        type: "object",
        properties: {
          start_date: { type: "string", description: "YYYY-MM-DD" },
          end_date: { type: "string", description: "YYYY-MM-DD" },
          group_by: { type: "string", enum: ["product", "region", "day", "month"] },
        },
        required: ["start_date", "end_date"],
      },
    },
  },
];

const toolHandlers = {
  query_sales_data: async (input) => {
    return {
      note: "Stub data — connect this to your real sales database/CRM.",
      range: `${input.start_date} to ${input.end_date}`,
      total_revenue: 128450,
      grouped_by: input.group_by || "none",
      rows: [
        { label: "Product A", revenue: 62000 },
        { label: "Product B", revenue: 41200 },
        { label: "Product C", revenue: 25250 },
      ],
    };
  },
};

export async function askSalesAgent(messages) {
  return runAgent({ systemPrompt, tools, toolHandlers, messages });
}