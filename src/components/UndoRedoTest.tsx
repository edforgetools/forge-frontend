import React, { useState } from "react";
import UndoRedoBar from "./UndoRedoBar";
import { useUndoRedoWithState } from "../hooks/useUndoRedo";

interface TestState {
  text: string;
  count: number;
  color: string;
}

export default function UndoRedoTest() {
  const [state, updateState, undoRedo] = useUndoRedoWithState<TestState>({
    text: "Hello World",
    count: 0,
    color: "#3b82f6",
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateState({ ...state, text: e.target.value });
  };

  const handleCountChange = (delta: number) => {
    updateState({ ...state, count: state.count + delta });
  };

  const handleColorChange = (color: string) => {
    updateState({ ...state, color });
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-white mb-4">Undo/Redo Test</h2>

      {/* Undo/Redo Controls */}
      <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
        <UndoRedoBar
          canUndo={undoRedo.canUndo}
          canRedo={undoRedo.canRedo}
          onUndo={undoRedo.undo}
          onRedo={undoRedo.redo}
        />
        <div className="text-sm text-gray-400">
          Press Cmd/Ctrl+Z to undo, Cmd/Ctrl+Shift+Z to redo
        </div>
      </div>

      {/* Test Controls */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Text Input (try typing and undoing):
          </label>
          <input
            type="text"
            value={state.text}
            onChange={handleTextChange}
            className="w-full px-3 py-2 border rounded bg-gray-800 text-white"
            placeholder="Type something..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Counter (try incrementing and undoing):
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => handleCountChange(-1)}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              -1
            </button>
            <span className="text-2xl font-bold text-white min-w-[3rem] text-center">
              {state.count}
            </span>
            <button
              onClick={() => handleCountChange(1)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              +1
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Color (try changing and undoing):
          </label>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={state.color}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-12 h-12 rounded border"
            />
            <div
              className="w-12 h-12 rounded border"
              style={{ backgroundColor: state.color }}
            />
            <span className="text-white">{state.color}</span>
          </div>
        </div>
      </div>

      {/* Current State Display */}
      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">
          Current State:
        </h3>
        <pre className="text-sm text-gray-300 whitespace-pre-wrap">
          {JSON.stringify(state, null, 2)}
        </pre>
      </div>

      {/* Instructions */}
      <div className="p-4 bg-blue-900 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">
          Test Instructions:
        </h3>
        <ol className="text-sm text-blue-200 space-y-1">
          <li>1. Type some text in the input field</li>
          <li>2. Press Cmd/Ctrl+Z to undo the text change</li>
          <li>3. Press Cmd/Ctrl+Shift+Z to redo the text change</li>
          <li>4. Try the same with the counter and color picker</li>
          <li>5. Verify that state rolls back and forward correctly</li>
        </ol>
      </div>
    </div>
  );
}
