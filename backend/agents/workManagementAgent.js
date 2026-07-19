import { runAgent } from "./runAgent.js";

const systemPrompt = `You are the Work Management agent for our company's internal dashboard.
Your job: help create, update, and check tasks/projects and deadlines.
- Before creating a task, confirm you have a clear title and owner (ask the user if missing, don't invent one).
- When asked "what's due" or similar, use list_tasks first — don't guess.
- If asked about sales, design, or messaging, say so and suggest the correct agent.`;

const tools = [
  {
    type: "function",
    function: {
      name: "list_tasks",
      description: "List tasks, optionally filtered by status or assignee.",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["open", "in_progress", "done", "all"] },
          assignee: { type: "string" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_task",
      description: "Create a new task in the work management system.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          assignee: { type: "string" },
          due_date: { type: "string", description: "YYYY-MM-DD" },
        },
        required: ["title"],
      },
    },
  },
];

const toolHandlers = {
  list_tasks: async (input) => ({
    note: "Stub data — connect to your real work management tool.",
    filters: input,
    tasks: [
      { id: "t1", title: "Finalize Q3 report", assignee: "Priya", status: "open", due_date: "2026-07-25" },
      { id: "t2", title: "Update homepage copy", assignee: "Dev", status: "in_progress", due_date: "2026-07-20" },
    ],
  }),
  create_task: async (input) => ({
    note: "Stub — connect to your real work management tool's create endpoint.",
    created: { id: "t_new", ...input, status: "open" },
  }),
};

export async function askWorkManagementAgent(messages) {
  return runAgent({ systemPrompt, tools, toolHandlers, messages });
}