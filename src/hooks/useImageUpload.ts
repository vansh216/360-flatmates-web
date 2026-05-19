import { useCallback } from "react";
import { convertToWebP } from "@/lib/image-utils";

export function useImageUpload() {
  const upload = useCallback(async (file: File): Promise<string> => {
    try {
      // Compress to WebP with 1600 max dimension and 0.82 quality
      return await convertToWebP(file, 1600, 0.82);
    } catch (error) {
      console.error("WebP conversion failed, falling back to original upload:", error);
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  }, []);

  return { upload };
}

