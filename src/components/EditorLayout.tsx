import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  ArrowLeft,
  HelpCircle,
  Upload,
  Crop,
  Download,
  Settings,
  Layers,
  FolderOpen,
} from "lucide-react";
import { UploadDropzone } from "./UploadDropzone";
import { PanelSection } from "./PanelSection";
import { CropPanel } from "./CropPanel";
import { OverlaysPanel } from "./OverlaysPanel";
import { CanvasStage } from "./CanvasStage";
import { CanvasToolbar } from "./CanvasToolbar";
import { StickyFooter } from "./StickyFooter";
import { ShortcutsSheet } from "./ShortcutsSheet";
import { UserProfile } from "./UserProfile";
import { AuthModal } from "./AuthModal";
import { ProjectManager } from "./ProjectManager";
import { StatusBar } from "./StatusBar";
import { WireGenerate } from "./WireGenerate";
import { useCanvasStore, canvasActions } from "@/state/canvasStore";
import { useModalStore, modalActions } from "@/state/modalStore";
import { useAutosave } from "@/hooks/useAutosave";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useCallback } from "react";

interface EditorLayoutProps {
  onBack: () => void;
}

export function EditorLayout({ onBack }: EditorLayoutProps) {
  const [activePanel, setActivePanel] = useState<
    "upload" | "crop" | "overlays" | "export" | "projects"
  >("upload");
  const [isDragging, setIsDragging] = useState(false);

  const { image, videoSrc, overlays, selectedId } = useCanvasStore();
  const { shortcutsOpen, authOpen, authMode } = useModalStore();
  const { isAuthenticated } = useAuth();

  // Initialize autosave
  useAutosave();
  const { toast } = useToast();
  const createNewProject = useCallback(() => {
    const newProjectId = `project_${Date.now()}`;
    useCanvasStore.setState({
      projectId: newProjectId,
      image: undefined,
      videoSrc: undefined,
      overlays: [],
      selectedId: undefined,
      crop: {
        x: 0,
        y: 0,
        w: 1280,
        h: 720,
        active: false,
      },
    });

    toast({
      title: "New project created",
      description: "Started a fresh project.",
    });

    return newProjectId;
  }, [toast]);

  const duplicateProject = useCallback(() => {
    const newProjectId = `project_${Date.now()}`;
    const currentState = useCanvasStore.getState();

    useCanvasStore.setState({
      ...currentState,
      projectId: newProjectId,
      selectedId: undefined,
    });

    toast({
      title: "Project duplicated",
      description: "Created a copy of the current project.",
    });

    return newProjectId;
  }, [toast]);

  const clearProject = useCallback(() => {
    useCanvasStore.setState({
      image: undefined,
      videoSrc: undefined,
      overlays: [],
      selectedId: undefined,
      crop: {
        x: 0,
        y: 0,
        w: 1280,
        h: 720,
        active: false,
      },
    });

    toast({
      title: "Project cleared",
      description: "Removed all content from the current project.",
    });
  }, [toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement)?.contentEditable === "true"
      ) {
        return;
      }

      // Global shortcuts
      if ((event.metaKey || event.ctrlKey) && event.key === "z") {
        event.preventDefault();
        if (event.shiftKey) {
          canvasActions.redo();
        } else {
          canvasActions.undo();
        }
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key === "s") {
        event.preventDefault();
        setActivePanel("export");
        return;
      }

      if (event.key === "Delete" && selectedId) {
        event.preventDefault();
        canvasActions.remove(selectedId);
        return;
      }

      // Arrow keys for nudging
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
          event.key
        ) &&
        selectedId
      ) {
        event.preventDefault();
        const nudgeAmount = event.shiftKey ? 10 : 1;
        const overlay = overlays.find((o) => o.id === selectedId);
        if (!overlay) return;

        let deltaX = 0;
        let deltaY = 0;

        switch (event.key) {
          case "ArrowUp":
            deltaY = -nudgeAmount;
            break;
          case "ArrowDown":
            deltaY = nudgeAmount;
            break;
          case "ArrowLeft":
            deltaX = -nudgeAmount;
            break;
          case "ArrowRight":
            deltaX = nudgeAmount;
            break;
        }

        canvasActions.updateOverlay(selectedId, {
          x: overlay.x + deltaX,
          y: overlay.y + deltaY,
        });
        return;
      }

      // Panel shortcuts
      switch (event.key.toLowerCase()) {
        case "u":
          event.preventDefault();
          setActivePanel("upload");
          break;
        case "c":
          event.preventDefault();
          canvasActions.toggleCrop();
          break;
        case "o":
          event.preventDefault();
          setActivePanel("overlays");
          break;
        case "e":
          event.preventDefault();
          setActivePanel("export");
          break;
        case "escape":
          if (shortcutsOpen) {
            modalActions.closeShortcuts();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, overlays, shortcutsOpen]);

  const hasContent = image || videoSrc;

  return (
    <div
      className="editor-layout h-[100dvh] bg-gray-50"
      data-testid="editor-layout"
      role="application"
      aria-label="Snapthumb Editor"
    >
      {/* Desktop Grid Layout - Only applies on screens ≥1280px */}
      <div className="hidden xl:block h-full">
        <div className="editor-grid h-full grid grid-cols-[320px_1fr_340px] gap-4 p-4 min-h-[100dvh] pt-[var(--header-h)]">
          {/* Header - Spans all columns */}
          <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-4 sticky top-[var(--header)] z-[var(--z-toolbar)] col-span-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="text-gray-600 hover:text-gray-900"
                  aria-label="Go back to previous page"
                  tabIndex={1}
                >
                  <ArrowLeft className="w-[18px] h-[18px] mr-2" />
                  Back
                </Button>
                <h1 className="text-xl font-semibold leading-tight text-gray-900">
                  Snapthumb Editor
                </h1>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => modalActions.openShortcuts()}
                  className="text-gray-600 hover:text-gray-900"
                  aria-label="Show keyboard shortcuts (?)"
                  tabIndex={2}
                >
                  <HelpCircle className="w-[18px] h-[18px] mr-2" />
                  Shortcuts
                </Button>
                {hasContent && (
                  <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                    {image ? "📷" : "🎬"}
                    {image ? " Image" : " Video"}
                  </div>
                )}
                <UserProfile
                  onSignInClick={() => modalActions.openAuth("signin")}
                />
              </div>
            </div>
          </header>

          {/* Left Sidebar - Tools */}
          <aside className="bg-white border border-gray-200 rounded-lg overflow-hidden sticky top-0 h-fit max-h-[calc(100vh-32px)]">
            {/* Toolbar Buttons */}
            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={activePanel === "upload" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActivePanel("upload")}
                  className="justify-start h-10"
                  aria-label="Upload panel - Upload images or videos"
                  aria-pressed={activePanel === "upload"}
                  tabIndex={3}
                >
                  <Upload className="w-[18px] h-[18px] mr-2" />
                  Upload
                </Button>
                <Button
                  variant={activePanel === "crop" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActivePanel("crop")}
                  className="justify-start h-10"
                  disabled={!hasContent}
                  aria-label="Crop panel - Crop and resize your image"
                  aria-pressed={activePanel === "crop"}
                  tabIndex={4}
                >
                  <Crop className="w-[18px] h-[18px] mr-2" />
                  Crop
                </Button>
                <Button
                  variant={activePanel === "overlays" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActivePanel("overlays")}
                  className="justify-start h-10"
                  disabled={!hasContent}
                  aria-label="Overlays panel - Add text and logo overlays"
                  aria-pressed={activePanel === "overlays"}
                  tabIndex={5}
                >
                  <Layers className="w-[18px] h-[18px] mr-2" />
                  Overlays
                </Button>
                <Button
                  variant={activePanel === "export" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActivePanel("export")}
                  className="justify-start h-10"
                  disabled={!hasContent}
                  aria-label="Export panel - Configure and download your thumbnail"
                  aria-pressed={activePanel === "export"}
                  tabIndex={6}
                >
                  <Download className="w-[18px] h-[18px] mr-2" />
                  Export
                </Button>
                {isAuthenticated && (
                  <Button
                    variant={activePanel === "projects" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActivePanel("projects")}
                    className="justify-start h-10 col-span-2"
                    aria-label="Projects panel - Manage saved projects"
                    aria-pressed={activePanel === "projects"}
                    tabIndex={7}
                  >
                    <FolderOpen className="w-[18px] h-[18px] mr-2" />
                    My Projects
                  </Button>
                )}
              </div>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-auto p-6">
              {activePanel === "upload" && (
                <Card className="shadow-sm rounded-2xl">
                  <CardContent className="p-6">
                    <UploadDropzone />
                  </CardContent>
                </Card>
              )}
              {activePanel === "crop" && hasContent && (
                <Card className="shadow-sm rounded-2xl">
                  <CropPanel />
                </Card>
              )}
              {activePanel === "overlays" && hasContent && (
                <Card className="shadow-sm rounded-2xl">
                  <OverlaysPanel />
                </Card>
              )}
              {activePanel === "export" && hasContent && (
                <Card className="shadow-sm rounded-2xl">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <PanelSection
                        title="Export Options"
                        icon={<Download className="w-[18px] h-[18px]" />}
                        showDivider={false}
                      >
                        <div className="text-center text-gray-500 py-4">
                          <div className="text-sm text-gray-600">
                            Click the Export button in the bottom-right to
                            configure and download your thumbnail.
                          </div>
                        </div>
                      </PanelSection>

                      <div className="space-y-2">
                        <button
                          onClick={createNewProject}
                          className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          aria-label="Create a new project"
                        >
                          New Project
                        </button>
                        <button
                          onClick={duplicateProject}
                          className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          aria-label="Duplicate current project"
                        >
                          Duplicate Project
                        </button>
                        <button
                          onClick={clearProject}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          aria-label="Clear current project and start over"
                        >
                          Clear Project
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {activePanel === "projects" && isAuthenticated && (
                <Card className="shadow-sm rounded-2xl">
                  <CardContent className="p-6">
                    <ProjectManager
                      onLoadProject={() => {
                        // Load project data into canvas
                        // Note: loadProject method needs to be implemented in canvasStore
                        setActivePanel("upload");
                      }}
                      onSaveProject={() => {
                        // Get current canvas state
                        const currentState = useCanvasStore.getState();
                        return {
                          projectData: {
                            canvasState: currentState,
                            overlays: currentState.overlays,
                            cropData: currentState.crop,
                            mediaUrl:
                              (typeof currentState.image === "string"
                                ? currentState.image
                                : null) ||
                              (typeof currentState.videoSrc === "string"
                                ? currentState.videoSrc
                                : null),
                          },
                          name: `Thumbnail ${new Date().toLocaleDateString()}`,
                          description: `Created on ${new Date().toLocaleDateString()}`,
                        };
                      }}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </aside>

          {/* Main Canvas Area */}
          <main className="bg-gray-100 rounded-lg overflow-hidden flex flex-col relative">
            {/* Canvas Toolbar */}
            <CanvasToolbar />

            {/* Canvas Stage with aspect-ratio box */}
            <div className="flex-1 p-6 pb-16">
              <div
                className="canvas-aspect-box w-full h-full flex items-center justify-center"
                style={{
                  aspectRatio: "16/9",
                  minHeight: "400px",
                }}
              >
                <CanvasStage onDragStateChange={setIsDragging} />
              </div>
            </div>

            {/* Status Bar - Fixed footer in canvas column */}
            {hasContent && <StatusBar />}
          </main>

          {/* Right Sidebar - Export Controls */}
          <aside className="bg-white border border-gray-200 rounded-lg overflow-hidden sticky top-0 h-fit max-h-[calc(100vh-32px)]">
            <div className="p-6 flex flex-col h-full">
              <div className="flex-1 space-y-4">
                <PanelSection
                  title="Export Controls"
                  icon={<Settings className="w-[18px] h-[18px]" />}
                  showDivider={false}
                >
                  <div className="text-center text-gray-500 py-4">
                    <div className="text-sm text-gray-600">
                      Configure and download your thumbnail below.
                    </div>
                  </div>
                </PanelSection>

                {/* Wire Generate Component */}
                {hasContent && (
                  <WireGenerate
                    onResult={(result) => {
                      console.log("Wire Generate Result:", result);
                    }}
                  />
                )}
              </div>

              {/* Export Button at bottom of right panel */}
              <div className="mt-auto">
                <StickyFooter isDragging={isDragging} />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile/Tablet Layout - Fallback for screens <1280px */}
      <div className="xl:hidden h-full">
        <div className="flex flex-col h-full bg-gray-50">
          {/* Header */}
          <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 sticky top-[var(--header)] z-[var(--z-toolbar)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="text-gray-600 hover:text-gray-900 min-h-[44px] min-w-[44px]"
                  aria-label="Go back to previous page"
                  tabIndex={1}
                >
                  <ArrowLeft className="w-[18px] h-[18px]" />
                </Button>
                <h1 className="text-xl font-semibold leading-tight text-gray-900">
                  Snapthumb Editor
                </h1>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => modalActions.openShortcuts()}
                  className="text-gray-600 hover:text-gray-900 min-h-[44px] min-w-[44px]"
                  aria-label="Show keyboard shortcuts (?)"
                  tabIndex={2}
                >
                  <HelpCircle className="w-[18px] h-[18px]" />
                </Button>
                {hasContent && (
                  <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                    {image ? "📷" : "🎬"}
                  </div>
                )}
                <UserProfile
                  onSignInClick={() => modalActions.openAuth("signin")}
                />
              </div>
            </div>
          </header>

          {/* Top Tabs for Mobile */}
          <div className="bg-white border-b border-gray-200 px-4 py-2">
            <Tabs
              value={activePanel}
              onValueChange={(value) =>
                setActivePanel(value as "upload" | "overlays" | "export")
              }
            >
              <TabsList className="grid w-full grid-cols-3 h-12">
                <TabsTrigger
                  value="upload"
                  className="min-h-[44px] text-sm font-medium"
                >
                  <Upload className="w-[18px] h-[18px] mr-2" />
                  Upload
                </TabsTrigger>
                <TabsTrigger
                  value="overlays"
                  className="min-h-[44px] text-sm font-medium"
                  disabled={!hasContent}
                >
                  <Layers className="w-[18px] h-[18px] mr-2" />
                  Overlays
                </TabsTrigger>
                <TabsTrigger
                  value="export"
                  className="min-h-[44px] text-sm font-medium"
                  disabled={!hasContent}
                >
                  <Download className="w-[18px] h-[18px] mr-2" />
                  Export
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Canvas Area - Fixed height with dvh units */}
          <div className="flex-1 bg-gray-100 p-4">
            <div className="h-[56dvh] w-full">
              {hasContent ? (
                <div className="h-full flex flex-col">
                  <CanvasToolbar />
                  <div className="flex-1 mt-2">
                    <CanvasStage onDragStateChange={setIsDragging} />
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center bg-white rounded-lg border border-gray-200">
                  <div className="text-center text-gray-500">
                    <div className="text-lg font-semibold leading-tight mb-2">
                      No content loaded
                    </div>
                    <div className="text-sm text-gray-600">
                      Tap Upload to get started
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Sheet for All Panel Content */}
          <Sheet
            open={true}
            onOpenChange={() => {
              // Don't allow closing the sheet - always show one panel
            }}
          >
            <SheetContent side="bottom" className="h-[40dvh]">
              <SheetHeader>
                <SheetTitle className="text-left">
                  {activePanel === "upload" && "Upload Media"}
                  {activePanel === "overlays" && "Add Overlays"}
                  {activePanel === "export" && "Export Options"}
                </SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-auto mt-4">
                {activePanel === "upload" && (
                  <Card className="shadow-sm rounded-2xl">
                    <CardContent className="p-6">
                      <UploadDropzone />
                    </CardContent>
                  </Card>
                )}
                {activePanel === "overlays" && hasContent && <OverlaysPanel />}
                {activePanel === "export" && hasContent && (
                  <div className="space-y-4">
                    <div className="text-center text-gray-500 py-4">
                      <div className="text-lg font-semibold leading-tight mb-2">
                        Export Options
                      </div>
                      <div className="text-sm text-gray-600">
                        Configure and download your thumbnail below.
                      </div>
                    </div>

                    {/* Wire Generate Component for Mobile */}
                    <WireGenerate
                      onResult={(result) => {
                        console.log("Wire Generate Result:", result);
                      }}
                    />

                    <StickyFooter isDragging={isDragging} />
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Modals */}
      <ShortcutsSheet
        isOpen={shortcutsOpen}
        onClose={() => modalActions.closeShortcuts()}
      />

      <AuthModal
        open={authOpen}
        onOpenChange={(open) =>
          open ? modalActions.openAuth() : modalActions.closeAuth()
        }
        defaultMode={authMode}
      />
    </div>
  );
}
