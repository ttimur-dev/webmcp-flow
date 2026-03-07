export interface McpResult {
  content: Array<{ type: string; text: string }>;
  isError?: boolean;
}

export function dispatchAndWait(
  eventName: string,
  detail: Record<string, unknown>,
  successMessage: string,
  timeoutMs = 5000,
): Promise<McpResult> {
  return new Promise((resolve, reject) => {
    const requestId = Math.random().toString(36).slice(2);
    const completionEvent = `tool-completion-${requestId}`;

    const timer = setTimeout(() => {
      window.removeEventListener(completionEvent, onComplete);
      reject(new Error(`Tool timed out: ${eventName}`));
    }, timeoutMs);

    const onComplete = () => {
      clearTimeout(timer);
      window.removeEventListener(completionEvent, onComplete);
      resolve({ content: [{ type: "text", text: successMessage }] });
    };

    window.addEventListener(completionEvent, onComplete);
    window.dispatchEvent(new CustomEvent(eventName, { detail: { ...detail, requestId } }));
  });
}

export function completeToolEvent(requestId: string) {
  window.dispatchEvent(new CustomEvent(`tool-completion-${requestId}`));
}
