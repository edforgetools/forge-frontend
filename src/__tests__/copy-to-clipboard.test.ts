import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { copyToClipboard, copyWithFeedback } from "@/lib/copy-to-clipboard";

// Mock clipboard API
const mockWriteText = vi.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

// Mock document.execCommand
const mockExecCommand = vi.fn();

describe("copyToClipboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset DOM
    document.body.innerHTML = "";
    // Mock window.isSecureContext
    Object.defineProperty(window, "isSecureContext", {
      value: true,
      writable: true,
    });
    // Mock document.execCommand
    Object.defineProperty(document, "execCommand", {
      value: mockExecCommand,
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should copy text using clipboard API when available", async () => {
    mockWriteText.mockResolvedValue(undefined);

    const result = await copyToClipboard("test text");

    expect(result).toBe(true);
    expect(mockWriteText).toHaveBeenCalledWith("test text");
  });

  it("should handle clipboard API errors gracefully", async () => {
    mockWriteText.mockRejectedValue(new Error("Clipboard error"));

    const result = await copyToClipboard("test text");

    expect(result).toBe(false);
    expect(mockWriteText).toHaveBeenCalledWith("test text");
  });

  it("should fallback to execCommand when clipboard API is not available", async () => {
    // Mock non-secure context
    Object.defineProperty(window, "isSecureContext", {
      value: false,
      writable: true,
    });

    mockExecCommand.mockReturnValue(true);

    const result = await copyToClipboard("test text");

    expect(result).toBe(true);
    expect(mockExecCommand).toHaveBeenCalledWith("copy");
  });

  it("should handle execCommand errors gracefully", async () => {
    // Mock non-secure context
    Object.defineProperty(window, "isSecureContext", {
      value: false,
      writable: true,
    });

    mockExecCommand.mockReturnValue(false);

    const result = await copyToClipboard("test text");

    expect(result).toBe(false);
    expect(mockExecCommand).toHaveBeenCalledWith("copy");
  });

  it("should handle execCommand exceptions", async () => {
    // Mock non-secure context
    Object.defineProperty(window, "isSecureContext", {
      value: false,
      writable: true,
    });

    mockExecCommand.mockImplementation(() => {
      throw new Error("execCommand error");
    });

    const result = await copyToClipboard("test text");

    expect(result).toBe(false);
  });

  it("should create and remove textarea element for fallback", async () => {
    // Mock non-secure context
    Object.defineProperty(window, "isSecureContext", {
      value: false,
      writable: true,
    });

    mockExecCommand.mockReturnValue(true);

    const result = await copyToClipboard("test text");

    expect(result).toBe(true);
    expect(document.body.innerHTML).toBe(""); // textarea should be removed
  });
});

describe("copyWithFeedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "isSecureContext", {
      value: true,
      writable: true,
    });
  });

  it("should call onSuccess when copy succeeds", async () => {
    mockWriteText.mockResolvedValue(undefined);
    const onSuccess = vi.fn();
    const onError = vi.fn();

    const result = await copyWithFeedback("test text", onSuccess, onError);

    expect(result).toBe(true);
    expect(onSuccess).toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it("should call onError when copy fails", async () => {
    mockWriteText.mockRejectedValue(new Error("Clipboard error"));
    const onSuccess = vi.fn();
    const onError = vi.fn();

    const result = await copyWithFeedback("test text", onSuccess, onError);

    expect(result).toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
  });

  it("should work without callbacks", async () => {
    mockWriteText.mockResolvedValue(undefined);

    const result = await copyWithFeedback("test text");

    expect(result).toBe(true);
  });
});
