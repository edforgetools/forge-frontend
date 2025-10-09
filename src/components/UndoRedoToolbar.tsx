import { Button } from "@/components/ui/button";
import { Undo2, Redo2, RotateCcw } from "lucide-react";
import { useCanvasStore } from "@/state/canvasStore";
import { useToast } from "@/hooks/use-toast";

interface UndoRedoToolbarProps {
  className?: string;
}

export function UndoRedoToolbar({ className }: UndoRedoToolbarProps) {
  const { undoStack, redoStack, undo, redo, clearProject } = useCanvasStore();
  const { toast } = useToast();

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  const handleUndo = () => {
    if (canUndo) {
      undo();
      toast({
        title: "Undo",
        description: "Last action undone",
      });
    }
  };

  const handleRedo = () => {
    if (canRedo) {
      redo();
      toast({
        title: "Redo",
        description: "Action redone",
      });
    }
  };

  const handleReset = () => {
    clearProject();
    toast({
      title: "Project reset",
      description: "All changes have been cleared",
    });
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleUndo}
        disabled={!canUndo}
        className="h-8 w-8 p-0"
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="w-4 h-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleRedo}
        disabled={!canRedo}
        className="h-8 w-8 p-0"
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo2 className="w-4 h-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleReset}
        className="h-8 px-2"
        title="Reset project"
      >
        <RotateCcw className="w-4 h-4 mr-1" />
        Reset
      </Button>
    </div>
  );
}
