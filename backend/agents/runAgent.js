import Groq from "groq-sdk";

let groqClient;
function getClient() {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
}

const MODEL = "llama-3.3-70b-versatile";

export async function runAgent({ systemPrompt, tools, toolHandlers, messages }) {
  let conversation = [{ role: "system", content: systemPrompt }, ...messages];
  const MAX_TURNS = 6;

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const response = await getClient().chat.completions.create({
      model: MODEL,
      max_tokens: 1500,
      messages: conversation,
      tools,
    });

    const choice = response.choices[0];
    const toolCalls = choice.message.tool_calls;

    if (!toolCalls || toolCalls.length === 0) {
      const reply = choice.message.content || "";
      const historyOut = [...messages, { role: "assistant", content: reply }];
      return { reply, messages: historyOut };
    }

    conversation.push(choice.message);

    for (const call of toolCalls) {
      const handler = toolHandlers[call.function.name];
      let output;
      try {
        const input = JSON.parse(call.function.arguments || "{}");
        output = handler
          ? await handler(input)
          : { error: `No handler implemented for tool "${call.function.name}"` };
      } catch (err) {
        output = { error: err.message };
      }
      conversation.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(output),
      });
    }
  }

  return {
    reply: "I wasn't able to complete this within the allowed number of steps — try breaking the request down.",
    messages,
  };
}