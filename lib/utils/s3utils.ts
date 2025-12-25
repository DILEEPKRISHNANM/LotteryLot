import { supabase } from "@/lib/db/supabase";

export interface UploadResult {
  url: string;
  path: string;
  signedUrl?: string;
  error?: string;
}

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith("image/")) {
    return {
      valid: false,
      error: "File must be an image (JPG, PNG, GIF, WEBP)",
    };
  }

  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size must be less than ${maxSize / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

/**
 * Generate unique filename
 */
export function generateFileName(
  originalName: string,
  folder?: string
): string {
  const fileExt = originalName.split(".").pop();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const fileName = `${timestamp}-${random}.${fileExt}`;
  return folder ? `${folder}/${fileName}` : fileName;
}

/**
 * Upload file to Supabase Storage
 * @param file - File object to upload
 * @param bucket - Storage bucket name (default: 'client-logos')
 * @param folder - Optional folder path within bucket
 * @returns Upload result with path (signed URL generated separately)
 */
export async function uploadFile(
  file: File,
  bucket: string = "client-logos",
  folder?: string
): Promise<UploadResult> {
  try {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return {
        url: "",
        path: "",
        error: validation.error,
      };
    }

    // Generate unique filename
    const filePath = generateFileName(file.name, folder);

    // Upload file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      console.error("Upload error:", error);
      return {
        url: "",
        path: "",
        error: error.message || "Failed to upload file",
      };
    }

    // Generate signed URL (expires in 1 hour)
    const signedUrl = await createSignedUrl(filePath, bucket, 3600);

    return {
      url: signedUrl || "",
      path: filePath,
      signedUrl: signedUrl || "",
    };
  } catch (error: any) {
    console.error("Upload exception:", error);
    return {
      url: "",
      path: "",
      error: error.message || "Upload failed",
    };
  }
}

/**
 * Create signed URL for a file
 * @param path - File path in storage
 * @param bucket - Storage bucket name (default: 'client-logos')
 * @param expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns Signed URL string
 */
export async function createSignedUrl(
  path: string,
  bucket: string = "client-logos",
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error("Error creating signed URL:", error);
      return null;
    }

    return data.signedUrl;
  } catch (error: any) {
    console.error("Signed URL exception:", error);
    return null;
  }
}

/**
 * Create multiple signed URLs at once
 * @param paths - Array of file paths
 * @param bucket - Storage bucket name
 * @param expiresIn - Expiration time in seconds
 * @returns Object with paths as keys and signed URLs as values
 */
export async function createSignedUrls(
  paths: string[],
  bucket: string = "client-logos",
  expiresIn: number = 3600
): Promise<Record<string, string>> {
  const urls: Record<string, string> = {};

  await Promise.all(
    paths.map(async (path) => {
      const signedUrl = await createSignedUrl(path, bucket, expiresIn);
      if (signedUrl) {
        urls[path] = signedUrl;
      }
    })
  );

  return urls;
}

/**
 * Delete file from Supabase Storage
 * @param path - File path in storage
 * @param bucket - Storage bucket name (default: 'client-logos')
 */
export async function deleteFile(
  path: string,
  bucket: string = "client-logos"
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      return {
        success: false,
        error: error.message || "Failed to delete file",
      };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Delete failed",
    };
  }
}

/**
 * Delete multiple files from Supabase Storage
 * @param paths - Array of file paths to delete
 * @param bucket - Storage bucket name
 */
export async function deleteFiles(
  paths: string[],
  bucket: string = "client-logos"
): Promise<{ success: boolean; deleted: number; errors: string[] }> {
  try {
    const { data, error } = await supabase.storage.from(bucket).remove(paths);

    if (error) {
      return {
        success: false,
        deleted: 0,
        errors: [error.message || "Failed to delete files"],
      };
    }

    return {
      success: true,
      deleted: data?.length || 0,
      errors: [],
    };
  } catch (error: any) {
    return {
      success: false,
      deleted: 0,
      errors: [error.message || "Delete failed"],
    };
  }
}

/**
 * List files in a bucket/folder
 * @param bucket - Storage bucket name
 * @param folder - Optional folder path
 * @param limit - Maximum number of files to return
 * @param offset - Pagination offset
 */
export async function listFiles(
  bucket: string = "client-logos",
  folder?: string,
  limit: number = 100,
  offset: number = 0
): Promise<{
  files: FileInfo[];
  error?: string;
}> {
  try {
    const { data, error } = await supabase.storage.from(bucket).list(folder, {
      limit,
      offset,
      sortBy: { column: "created_at", order: "desc" },
    });

    if (error) {
      return {
        files: [],
        error: error.message || "Failed to list files",
      };
    }

    const files: FileInfo[] =
      data?.map((file) => ({
        name: file.name,
        size: file.metadata?.size || 0,
        type: file.metadata?.mimetype || "",
        lastModified: new Date(file.updated_at || file.created_at).getTime(),
      })) || [];

    return { files };
  } catch (error: any) {
    return {
      files: [],
      error: error.message || "List files failed",
    };
  }
}

/**
 * Check if file exists
 * @param path - File path in storage
 * @param bucket - Storage bucket name
 */
export async function fileExists(
  path: string,
  bucket: string = "client-logos"
): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path.split("/").slice(0, -1).join("/") || "", {
        search: path.split("/").pop() || "",
      });

    return !error && (data?.length || 0) > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Get file metadata
 * @param path - File path in storage
 * @param bucket - Storage bucket name
 */
export async function getFileMetadata(
  path: string,
  bucket: string = "client-logos"
): Promise<{
  size?: number;
  type?: string;
  lastModified?: number;
  error?: string;
}> {
  try {
    const folderPath = path.split("/").slice(0, -1).join("/") || "";
    const fileName = path.split("/").pop() || "";

    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folderPath, {
        search: fileName,
      });

    if (error || !data || data.length === 0) {
      return {
        error: "File not found",
      };
    }

    const file = data[0];
    return {
      size: file.metadata?.size,
      type: file.metadata?.mimetype,
      lastModified: new Date(file.updated_at || file.created_at).getTime(),
    };
  } catch (error: any) {
    return {
      error: error.message || "Failed to get metadata",
    };
  }
}

/**
 * Copy file to a new location
 * @param sourcePath - Source file path
 * @param destinationPath - Destination file path
 * @param bucket - Storage bucket name
 */
export async function copyFile(
  sourcePath: string,
  destinationPath: string,
  bucket: string = "client-logos"
): Promise<{ success: boolean; error?: string }> {
  try {
    // Download source file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(sourcePath);

    if (downloadError || !fileData) {
      return {
        success: false,
        error: downloadError?.message || "Failed to download source file",
      };
    }

    // Upload to destination
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(destinationPath, fileData, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      return {
        success: false,
        error: uploadError.message || "Failed to upload to destination",
      };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Copy failed",
    };
  }
}

/**
 * Move file (copy + delete original)
 * @param sourcePath - Source file path
 * @param destinationPath - Destination file path
 * @param bucket - Storage bucket name
 */
export async function moveFile(
  sourcePath: string,
  destinationPath: string,
  bucket: string = "client-logos"
): Promise<{ success: boolean; error?: string }> {
  try {
    // Copy file
    const copyResult = await copyFile(sourcePath, destinationPath, bucket);
    if (!copyResult.success) {
      return copyResult;
    }

    // Delete original
    const deleteResult = await deleteFile(sourcePath, bucket);
    if (!deleteResult.success) {
      return {
        success: false,
        error: "File copied but failed to delete original",
      };
    }

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Move failed",
    };
  }
}
