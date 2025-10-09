import { supabase, type Database } from './supabase'

export type MediaFile = Database['public']['Tables']['media_files']['Row']
export type MediaFileInsert = Database['public']['Tables']['media_files']['Insert']

export class StorageManager {
  private bucketName = 'media-files'

  async uploadFile(
    file: File,
    projectId: string,
    userId: string
  ): Promise<{ url: string; fileRecord: MediaFile }> {
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${userId}/${projectId}/${fileName}`

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(this.bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading file:', uploadError)
      throw uploadError
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(this.bucketName)
      .getPublicUrl(filePath)

    // Create database record
    const fileRecord: MediaFileInsert = {
      project_id: projectId,
      user_id: userId,
      filename: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type
    }

    const { data: fileData, error: dbError } = await supabase
      .from('media_files')
      .insert(fileRecord)
      .select()
      .single()

    if (dbError) {
      console.error('Error creating file record:', dbError)
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from(this.bucketName)
        .remove([filePath])
      throw dbError
    }

    return {
      url: urlData.publicUrl,
      fileRecord: fileData
    }
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    // Get file record first
    const { data: fileRecord, error: fetchError } = await supabase
      .from('media_files')
      .select('file_path')
      .eq('id', fileId)
      .eq('user_id', userId)
      .single()

    if (fetchError) {
      console.error('Error fetching file record:', fetchError)
      throw fetchError
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(this.bucketName)
      .remove([fileRecord.file_path])

    if (storageError) {
      console.error('Error deleting file from storage:', storageError)
      // Continue with database deletion even if storage deletion fails
    }

    // Delete database record
    const { error: dbError } = await supabase
      .from('media_files')
      .delete()
      .eq('id', fileId)
      .eq('user_id', userId)

    if (dbError) {
      console.error('Error deleting file record:', dbError)
      throw dbError
    }
  }

  async getProjectFiles(projectId: string, userId: string): Promise<MediaFile[]> {
    const { data, error } = await supabase
      .from('media_files')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching project files:', error)
      throw error
    }

    return data || []
  }

  async generateSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await supabase.storage
      .from(this.bucketName)
      .createSignedUrl(filePath, expiresIn)

    if (error) {
      console.error('Error generating signed URL:', error)
      throw error
    }

    return data.signedUrl
  }
}

export const storageManager = new StorageManager()
