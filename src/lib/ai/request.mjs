/**
 * Centralized request body builder and validator for all outgoing LLM completions.
 *
 * Ensures uniform structure, parameter bounds, stream options, and message
 * validation across all LLM consumers (blog assist, translation, and future features).
 */

export class LlmRequestError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "LlmRequestError";
    this.status = status;
  }
}

/**
 * Validates and normalizes chat messages array:
 * Each message must have a valid role ('system', 'user', 'assistant') and string content.
 */
export function validateMessages(messages) {
  if (!Array.isArray(messages)) {
    throw new LlmRequestError("Messages must be an array.");
  }
  return messages.map((msg, idx) => {
    if (!msg || typeof msg !== "object") {
      throw new LlmRequestError(`Message at index ${idx} must be an object.`);
    }
    const role = String(msg.role || "").trim().toLowerCase();
    if (!["system", "user", "assistant"].includes(role)) {
      throw new LlmRequestError(`Invalid message role "${msg.role}" at index ${idx}.`);
    }
    if (typeof msg.content !== "string") {
      throw new LlmRequestError(`Message content at index ${idx} must be a string.`);
    }
    return {
      role,
      content: msg.content,
    };
  });
}

/**
 * Builds a standardized, centrally managed request body for OpenAI-compatible chat completions.
 *
 * @param {object} config Provider config ({ model, disableThinking })
 * @param {Array} messages Validated chat messages
 * @param {object} options
 * @param {number} [options.maxTokens]
 * @param {boolean} [options.stream=false]
 * @param {number} [options.temperature=0.3]
 * @param {number} [options.topP=0.9]
 * @param {object} [options.extra] Additional vendor-specific options
 * @returns {object} Normalized request body
 */
export function createLlmRequestBody(config, messages, {
  maxTokens,
  stream = false,
  temperature = 0.3,
  topP = 0.9,
  extra = {},
} = {}) {
  const model = String(config.model || "").trim();
  if (!model) {
    throw new LlmRequestError("LLM model must be specified in config.");
  }

  const validMessages = validateMessages(messages);

  const body = {
    model,
    messages: validMessages,
    temperature: typeof temperature === "number" ? Math.min(Math.max(temperature, 0), 2) : 0.3,
    top_p: typeof topP === "number" ? Math.min(Math.max(topP, 0), 1) : 0.9,
    stream: Boolean(stream),
    ...(typeof maxTokens === "number" && maxTokens > 0 ? { max_tokens: Math.floor(maxTokens) } : {}),
    ...(stream ? { stream_options: { include_usage: true } } : {}),
    ...(config.disableThinking ? { chat_template_kwargs: { enable_thinking: false } } : {}),
    ...extra,
  };

  return body;
}
