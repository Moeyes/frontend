import { useCallback } from 'react';
import { getPresignUrl, uploadToCloudinary } from '../services/registration.service';

// Returns an upload function compatible with FileUploadField.onUpload.
export function useCloudinaryUpload() {
  return useCallback(async (file: File): Promise<string> => {
    const presign = await getPresignUrl();
    return uploadToCloudinary(file, presign);
  }, []);
}
