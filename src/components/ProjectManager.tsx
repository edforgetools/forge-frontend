import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";
import { ProjectData } from "@/lib/projects";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { z } from "zod";

// Validation schemas for project management
const projectNameSchema = z.object({
  name: z
    .string()
    .min(1, "Project name is required")
    .max(50, "Project name must be 50 characters or less"),
});

const projectDescriptionSchema = z.object({
  description: z
    .string()
    .max(200, "Description must be 200 characters or less")
    .optional(),
});
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Plus, Trash2, Eye } from "lucide-react";
import { projectManager } from "@/lib/projects";

interface ProjectManagerProps {
  onLoadProject?: (projectData: Record<string, unknown>) => void;
  onSaveProject?: () => {
    projectData: ProjectData;
    name: string;
    description?: string;
  };
}

export function ProjectManager({
  onLoadProject,
  onSaveProject,
}: ProjectManagerProps) {
  const { user, isAuthenticated } = useAuth();
  const { projects, loading, saveProject, deleteProject } = useProjects(
    user?.id || null
  );
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSaveProject = async () => {
    if (!onSaveProject) return;

    setSaving(true);
    setError("");

    try {
      // Validate project name and description
      const validatedName = projectNameSchema.parse({
        name: projectName.trim(),
      });
      const validatedDescription = projectDescriptionSchema.parse({
        description: projectDescription.trim(),
      });

      const { projectData } = onSaveProject();
      await saveProject(
        projectData,
        validatedName.name,
        validatedDescription.description || ""
      );
      setSaveDialogOpen(false);
      setProjectName("");
      setProjectDescription("");
    } catch (err: unknown) {
      if (err instanceof z.ZodError) {
        setError(err.issues[0]?.message || "Validation error");
      } else {
        setError(err instanceof Error ? err.message : "Failed to save project");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleLoadProject = async (projectId: string) => {
    try {
      const project = await projectManager.getProject(projectId, user!.id);
      if (project && onLoadProject) {
        onLoadProject(project.thumbnail_data);
        setLoadDialogOpen(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load project");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
      await deleteProject(projectId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete project");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">
          Sign in to save and manage your projects
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">My Projects</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLoadDialogOpen(true)}
            disabled={projects.length === 0}
          >
            <Eye className="w-[18px] h-[18px] mr-2" />
            Load
          </Button>
          <Button
            size="sm"
            onClick={() => setSaveDialogOpen(true)}
            disabled={!onSaveProject}
          >
            <Plus className="w-[18px] h-[18px] mr-2" />
            Save
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-[18px] h-[18px] animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground mb-4">No projects saved yet</p>
            <p className="text-sm text-muted-foreground text-center">
              Create your first thumbnail and save it to get started
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{project.name}</CardTitle>
                    {project.description && (
                      <CardDescription className="text-sm">
                        {project.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleLoadProject(project.id)}
                      aria-label="Load project"
                    >
                      <Eye className="w-[18px] h-[18px]" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDeleteProject(project.id)}
                      aria-label="Delete project"
                    >
                      <Trash2 className="w-[18px] h-[18px]" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {project.preview_url && (
                    <div className="aspect-video bg-muted rounded-md overflow-hidden">
                      <img
                        src={project.preview_url}
                        alt={project.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Updated {formatDate(project.updated_at)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Save Project Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Project</DialogTitle>
            <DialogDescription>
              Save your current thumbnail project to access it later
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                placeholder="Enter project name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectDescription">Description (Optional)</Label>
              <Input
                id="projectDescription"
                placeholder="Enter project description"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
              />
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setSaveDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProject}
                disabled={saving || !projectName.trim()}
              >
                {saving ? (
                  <Loader2 className="w-[18px] h-[18px] animate-spin mr-2" />
                ) : null}
                Save Project
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Load Project Dialog */}
      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Load Project</DialogTitle>
            <DialogDescription>
              Choose a saved project to load
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleLoadProject(project.id)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <h4 className="font-medium">{project.name}</h4>
                      {project.description && (
                        <p className="text-sm text-muted-foreground">
                          {project.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Updated {formatDate(project.updated_at)}
                      </p>
                    </div>
                    {project.preview_url && (
                      <div className="w-16 h-10 bg-muted rounded overflow-hidden">
                        <img
                          src={project.preview_url}
                          alt={project.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
