// import { useState } from "react"; // TODO: Use for step management
import { CanvasStage } from "../components/CanvasStage";
import { FrameGrabber } from "../components/FrameGrabber";
import { Cropper } from "../components/Cropper";
import { Overlay } from "../components/Overlay";
import { ExportBar } from "../components/ExportBar";

interface AppPageProps {
  onBack: () => void;
}

export default function AppPage({ onBack }: AppPageProps) {
  // const [currentStep, setCurrentStep] = useState<
  //   "upload" | "crop" | "overlay" | "export"
  // >("upload"); // TODO: Use for step management

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              Snapthumb Editor
            </h1>
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded">
              Undo
            </button>
            <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded">
              Redo
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Tools */}
            <div className="lg:col-span-1 space-y-4">
              <FrameGrabber onFrameCaptured={() => console.log("Frame captured")} />
              <Cropper onCropComplete={() => console.log("Crop complete")} />
              <Overlay onOverlayComplete={() => console.log("Overlay complete")} />
            </div>

            {/* Center Panel - Canvas */}
            <div className="lg:col-span-2">
              <CanvasStage />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel - Export */}
      <div className="bg-white border-t border-gray-200 p-4">
        <ExportBar />
      </div>
    </div>
  );
}
