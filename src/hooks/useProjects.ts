import { useState, useEffect, useCallback } from "react";
import { projectManager, type Project, type ProjectData } from "@/lib/projects";

export function useProjects(userId: string | null) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!userId) {
      setProjects([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedProjects = await projectManager.getProjects(userId);
      setProjects(fetchedProjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const saveProject = useCallback(
    async (
      projectData: ProjectData,
      name: string,
      description?: string,
      projectId?: string
    ) => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const savedProject = await projectManager.saveProject(
        userId,
        projectData,
        name,
        description,
        projectId
      );

      // Update local state
      if (projectId) {
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? savedProject : p))
        );
      } else {
        setProjects((prev) => [savedProject, ...prev]);
      }

      return savedProject;
    },
    [userId]
  );

  const deleteProject = useCallback(
    async (projectId: string) => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      await projectManager.deleteProject(projectId, userId);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    },
    [userId]
  );

  const getProject = useCallback(
    async (projectId: string) => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      return await projectManager.getProject(projectId, userId);
    },
    [userId]
  );

  return {
    projects,
    loading,
    error,
    saveProject,
    deleteProject,
    getProject,
    refetch: fetchProjects,
  };
}
