import { ChatCerebras } from "@langchain/cerebras";
import { ChatFireworks } from "@langchain/fireworks";



type LLMProvider = "cerebras" | "fireworks";

interface GetLLMOptions {
  provider: LLMProvider;
  temperature?: number;
  maxTokens?: number;
}

export const getLLM = ({
  provider,
  temperature = 0.7,
  maxTokens,
}: GetLLMOptions) => {
  switch (provider) {
    case "cerebras": {
      const apiKey = process.env.CEREBRAS_API_KEY;

      if (!apiKey) {
        throw new Error("CEREBRAS_API_KEY is missing in .env");
      }

      return new ChatCerebras({
        apiKey,
        model: "llama3.1-8b",
        temperature,
        maxTokens,
        maxRetries: 2,
        streaming: true,
      });
    }

    case "fireworks": {
      const apiKey = process.env.FIREWORKS_API_KEY;

      if (!apiKey) {
        throw new Error("FIREWORKS_API_KEY is missing in .env");
      }

      return new ChatFireworks({
        apiKey,
        modelName: "accounts/fireworks/models/deepseek-v3p2",
        temperature,
        streaming: true,
      });
    }

    default:
      throw new Error(`Unsupported LLM provider: ${provider}`);
  }
};

export const fireworksModel = getLLM({ provider: "fireworks" })
export const cerebrasModel = getLLM({ provider: "cerebras" })
