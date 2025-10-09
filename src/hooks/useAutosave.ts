import { useEffect, useCallback } from "react";
import { useCanvasStore } from "@/state/canvasStore";
import { useToast } from "@/hooks/use-toast";

const STORAGE_KEY_PREFIX = "snapthumb:v1:";
const AUTOSAVE_DELAY = 2000; // 2 seconds

export function useAutosave() {
  const { toast } = useToast();
  const state = useCanvasStore();

  // Save state to localStorage
  const saveState = useCallback(() => {
    try {
      const stateToSave = {
        projectId: state.projectId,
        crop: state.crop,
        overlays: state.overlays,
        prefs: state.prefs,
        // Don't save image/video data as it's too large
        // These will need to be re-loaded by the user
        hasImage: !!state.image,
        hasVideo: !!state.videoSrc,
        timestamp: Date.now(),
      };

      const storageKey = `${STORAGE_KEY_PREFIX}${state.projectId}`;
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Failed to save state:", error);
    }
  }, [state]);

  // Load state from localStorage
  const loadState = useCallback((projectId: string) => {
    try {
      const storageKey = `${STORAGE_KEY_PREFIX}${projectId}`;
      const saved = localStorage.getItem(storageKey);

      if (saved) {
        const parsed = JSON.parse(saved);

        // Only restore non-volatile data
        if (parsed.crop) {
          useCanvasStore.setState({ crop: parsed.crop });
        }
        if (parsed.overlays) {
          useCanvasStore.setState({ overlays: parsed.overlays });
        }
        if (parsed.prefs) {
          useCanvasStore.setState({ prefs: parsed.prefs });
        }

        return parsed;
      }
    } catch (error) {
      console.error("Failed to load state:", error);
    }
    return null;
  }, []);

  // Clear saved state
  const clearState = useCallback((projectId: string) => {
    try {
      const storageKey = `${STORAGE_KEY_PREFIX}${projectId}`;
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error("Failed to clear state:", error);
    }
  }, []);

  // Get all saved projects
  const getSavedProjects = useCallback(() => {
    try {
      const projects: Array<{
        id: string;
        timestamp: number;
        hasImage: boolean;
        hasVideo: boolean;
      }> = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(STORAGE_KEY_PREFIX)) {
          const saved = localStorage.getItem(key);
          if (saved) {
            const parsed = JSON.parse(saved);
            projects.push({
              id: parsed.projectId,
              timestamp: parsed.timestamp,
              hasImage: parsed.hasImage,
              hasVideo: parsed.hasVideo,
            });
          }
        }
      }

      return projects.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error("Failed to get saved projects:", error);
      return [];
    }
  }, []);

  // Auto-save effect
  useEffect(() => {
    const timeoutId = setTimeout(saveState, AUTOSAVE_DELAY);
    return () => clearTimeout(timeoutId);
  }, [state.crop, state.overlays, state.prefs, saveState]);

  // Check for session restore on mount
  useEffect(() => {
    const checkForRestore = () => {
      const savedProjects = getSavedProjects();
      if (savedProjects.length > 0) {
        const latestProject = savedProjects[0];
        const timeSinceLastSave =
          Date.now() - (latestProject?.timestamp ?? Date.now());

        // Only show restore toast if project was saved recently (within 1 hour)
        if (timeSinceLastSave < 60 * 60 * 1000) {
          toast({
            title: "Session restored",
            description: `Found previous work from ${new Date(
              latestProject?.timestamp ?? Date.now()
            ).toLocaleTimeString()}. Your overlays and settings have been restored.`,
          });
        }
      }
    };

    checkForRestore();
  }, [getSavedProjects, toast]);

  return {
    saveState,
    loadState,
    clearState,
    getSavedProjects,
  };
}

// Hook for managing project operations
export function useProjectManager() {
  const { toast } = useToast();
  const { projectId } = useCanvasStore();

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

  return {
    createNewProject,
    duplicateProject,
    clearProject,
    currentProjectId: projectId,
  };
}
