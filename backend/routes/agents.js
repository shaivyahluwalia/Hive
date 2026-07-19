import express from "express";
import { askSalesAgent } from "../agents/salesAgent.js";
import { askDesignAgent } from "../agents/designAgent.js";
import { askWorkManagementAgent } from "../agents/workManagementAgent.js";
import { askMessagingAgent } from "../agents/messagingAgent.js";

const router = express.Router();

function agentRoute(agentFn) {
  return async (req, res) => {
    try {
      const { message, history = [] } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Request body must include a 'message' string." });
      }

      const messages = [...history, { role: "user", content: message }];
      const { reply, messages: fullMessages } = await agentFn(messages);

      res.json({ reply, history: fullMessages });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Agent request failed.", details: err.message });
    }
  };
}

router.post("/sales", agentRoute(askSalesAgent));
router.post("/design", agentRoute(askDesignAgent));
router.post("/work-management", agentRoute(askWorkManagementAgent));
router.post("/messaging", agentRoute(askMessagingAgent));

export default router;