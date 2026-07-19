import { runAgent } from "./runAgent.js";

const systemPrompt = `You are the Design agent for our company's internal dashboard.
Your job: help with visual/design requests — mockup concepts, layout suggestions, brand-consistent copy for design assets, and pulling existing brand assets.
- Reference the brand guidelines tool before suggesting colors/fonts if relevant.
- You do not generate raster images yourself here — describe layouts precisely enough that a designer or an image-gen tool could execute them.
- If asked about sales, tasks, or messaging, say so and suggest the correct agent.`;

const tools = [
  {
    type: "function",
    function: {
      name: "get_brand_guidelines",
      description: "Fetch the current brand guidelines: color palette, fonts, logo usage rules.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "search_design_assets",
      description: "Search the design asset library (logos, icons, templates) by keyword.",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
      },
    },
  },
];

const toolHandlers = {
  get_brand_guidelines: async () => ({
    note: "Stub data — connect to your real brand guidelines source.",
    primary_color: "#1E3A8A",
    secondary_color: "#F59E0B",
    font_heading: "Inter, sans-serif",
    font_body: "Inter, sans-serif",
  }),
  search_design_assets: async (input) => ({
    note: "Stub data — connect to your real asset library.",
    query: input.query,
    results: [{ name: "logo-primary.svg", url: "https://example.com/assets/logo-primary.svg" }],
  }),
};

export async function askDesignAgent(messages) {
  return runAgent({ systemPrompt, tools, toolHandlers, messages });
}