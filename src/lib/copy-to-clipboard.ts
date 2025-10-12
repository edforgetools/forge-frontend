/**
 * Copy text to clipboard utility with fallback support
 */

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        return successful;
      } catch {
        document.body.removeChild(textArea);
        return false;
      }
    }
  } catch (error) {
    console.warn("Failed to copy to clipboard:", error);
    return false;
  }
}

/**
 * Copy text to clipboard with user feedback
 */
export async function copyWithFeedback(
  text: string,
  onSuccess?: () => void,
  onError?: () => void
): Promise<boolean> {
  const success = await copyToClipboard(text);

  if (success) {
    onSuccess?.();
  } else {
    onError?.();
  }

  return success;
}
