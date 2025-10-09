import { supabase, type Database } from "./supabase";

export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
export type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];

export interface ProjectData {
  canvasState: Record<string, unknown>;
  overlays: Record<string, unknown>[];
  cropData: Record<string, unknown>;
  mediaUrl: string | null;
}

export class ProjectManager {
  async getProjects(userId: string): Promise<Project[]> {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }

    return data || [];
  }

  async getProject(projectId: string, userId: string): Promise<Project | null> {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null; // Project not found
      }
      console.error("Error fetching project:", error);
      throw error;
    }

    return data;
  }

  async saveProject(
    userId: string,
    projectData: ProjectData,
    name: string,
    description?: string,
    projectId?: string
  ): Promise<Project> {
    const projectPayload: ProjectInsert = {
      user_id: userId,
      name,
      description: description || null,
      thumbnail_data: projectData as unknown as Record<string, unknown>,
      preview_url: null, // Will be updated when thumbnail is generated
    };

    if (projectId) {
      // Update existing project
      const { data, error } = await supabase
        .from("projects")
        .update({
          ...projectPayload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", projectId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating project:", error);
        throw error;
      }

      return data;
    } else {
      // Create new project
      const { data, error } = await supabase
        .from("projects")
        .insert(projectPayload)
        .select()
        .single();

      if (error) {
        console.error("Error creating project:", error);
        throw error;
      }

      return data;
    }
  }

  async deleteProject(projectId: string, userId: string): Promise<void> {
    // First delete associated media files
    await supabase
      .from("media_files")
      .delete()
      .eq("project_id", projectId)
      .eq("user_id", userId);

    // Then delete the project
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  }

  async updateProjectPreview(
    projectId: string,
    userId: string,
    previewUrl: string
  ): Promise<void> {
    const { error } = await supabase
      .from("projects")
      .update({ preview_url: previewUrl })
      .eq("id", projectId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating project preview:", error);
      throw error;
    }
  }
}

export const projectManager = new ProjectManager();
