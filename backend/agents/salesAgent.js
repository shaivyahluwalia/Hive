import { runAgent } from "./runAgent.js";
import MemoryClient from "mem0ai";

// Declare the variable, but do not initialize it yet
let memory = null;

const baseSystemPrompt = `You are the Sales Analysis agent for our company's internal dashboard.
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
  // 1. Initialize Mem0 safely INSIDE the function, ensuring process.env is loaded
  if (!memory) {
    memory = new MemoryClient({ apiKey: process.env.MEM0_API_KEY });
  }

  // 2. Extract the latest user message from the chat history
  const latestUserMessage = messages.filter(m => m.role === "user").pop()?.content || "";
  
  // A unique identifier for the user's memory bucket
  const userId = "workspace_business_user"; 

  // 3. Search Mem0 for relevant past context
  let memoryContext = "";
  try {
   const searchResults = await memory.search(latestUserMessage, { filters: { user_id: userId } });    
    if (searchResults && searchResults.length > 0) {
      const memoriesText = searchResults.map(m => `- ${m.memory}`).join("\n");
      memoryContext = `\n\nCRITICAL CONTEXT FROM PAST CONVERSATIONS:\n${memoriesText}\nUse this context to inform your response if it is relevant to the user's request.`;
      console.log("🧠 Mem0 retrieved context:", memoriesText);
    }
  } catch (err) {
    console.warn("Mem0 search failed:", err.message);
  }

  // 4. Inject the memories dynamically into the system prompt
  const systemPrompt = baseSystemPrompt + memoryContext;

  // 5. Run the Gemini AI Agent
  const result = await runAgent({ systemPrompt, tools, toolHandlers, messages });

  // 6. Save the new interaction back into Mem0
  try {
    if (result.reply) {
      await memory.add([
  { role: "user", content: latestUserMessage },
  { role: "assistant", content: result.reply || "Agent process ran." }
], { user_id: userId }); // (Note: .add() usually still accepts user_id at the top level, but if it throws the same error, wrap it in filters too!)
      console.log("💾 Mem0 saved new conversation memory.");
    }
  } catch (err) {
    console.warn("Mem0 save failed:", err.message);
  }

  return result;
}