import { runAgent } from "./runAgent.js";
import { WebClient } from "@slack/web-api";

const slackClient = process.env.SLACK_BOT_TOKEN
  ? new WebClient(process.env.SLACK_BOT_TOKEN)
  : null;

const systemPrompt = `You are the Messaging agent for our company's internal dashboard.
Your job: draft and send messages, currently via Slack (email/other channels are TODO).
- ALWAYS show the user the drafted message and get explicit confirmation before calling send_message. Never send silently.
- Keep tone matching the channel: Slack messages should be concise.
- If asked about sales, design, or tasks, say so and suggest the correct agent.`;

const tools = [
  {
    type: "function",
    function: {
      name: "send_message",
      description: "Send a message. Only call this after the user has confirmed the draft.",
      parameters: {
        type: "object",
        properties: {
          channel: { type: "string", enum: ["slack"] },
          to: { type: "string", description: "Slack channel name (e.g. #general) or user ID" },
          body: { type: "string" },
        },
        required: ["channel", "to", "body"],
      },
    },
  },
];

const toolHandlers = {
  send_message: async (input) => {
    if (input.channel !== "slack") {
      return { error: `Channel "${input.channel}" isn't wired up yet — only "slack" currently works.` };
    }
    if (!slackClient) {
      return { error: "SLACK_BOT_TOKEN is not set in .env — Slack sending is not configured yet." };
    }
    try {
      const result = await slackClient.chat.postMessage({
        channel: input.to,
        text: input.body,
      });
      return { sent: true, channel: input.to, ts: result.ts };
    } catch (err) {
      return { error: `Slack send failed: ${err.message}` };
    }
  },
};

export async function askMessagingAgent(messages) {
  return runAgent({ systemPrompt, tools, toolHandlers, messages });
}