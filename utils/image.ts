/**
 * Captures a frame from a video element and returns it as a base64 string (without mime prefix).
 * @param video The source video element
 * @param canvas A canvas element used for temporary drawing
 * @returns Base64 string of the JPEG image
 */
export function captureFrameAsBase64(video: HTMLVideoElement, canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext('2d');
  if (!ctx || video.videoWidth === 0 || video.videoHeight === 0) {
    return '';
  }

  // Sync canvas size to video size
  if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }

  ctx.drawImage(video, 0, 0);
  
  // Get data URL (format: "data:image/jpeg;base64,.....")
  const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // 0.7 quality
  
  // Remove prefix to get raw base64
  return dataUrl.split(',')[1];
}

/**
 * Converts a File object to a base64 string.
 * @param file The image file
 * @returns Promise resolving to base64 string (without data URI prefix)
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        const result = reader.result as string;
        // remove data:image/xxx;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}