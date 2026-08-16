/**
 * Formats a file size in bytes to a human-readable normalized string (B, KB, MB, GB, TB).
 * Examples:
 *   512 -> "512 B"
 *   1048576 -> "1 MB"
 *   15728640 -> "15 MB"
 *   2684354560 -> "2.5 GB"
 */
export const formatFileSize = (bytes?: number | null): string => {
  if (bytes === undefined || bytes === null || isNaN(bytes) || bytes <= 0) {
    return '0 B';
  }

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const clampedIndex = Math.min(i, sizes.length - 1);

  if (clampedIndex === 0) {
    return `${bytes} B`;
  }

  const formattedValue = (bytes / Math.pow(k, clampedIndex)).toFixed(1);
  // Clean up trailing .0 (e.g. 1.0 MB -> 1 MB, but 1.5 MB remains 1.5 MB)
  const cleanValue = formattedValue.endsWith('.0') ? formattedValue.slice(0, -2) : formattedValue;

  return `${cleanValue} ${sizes[clampedIndex]}`;
};

/**
 * Resolves an avatar URL safely across Docker internal hostnames and relative API endpoints.
 */
export const getSafeAvatarUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  
  // If it is a relative API path (/api/v1/auth/avatar/...), prefix with backend base URL
  if (url.startsWith('/')) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
    const serverOrigin = apiBase.replace(/\/api\/v1\/?$/, '');
    return `${serverOrigin}${url}`;
  }

  // If the URL points to MinIO S3 avatar path, strip any expired/invalid AWS signatures
  if (url.includes('/users/avatars/')) {
    const cleanPath = url.split('?')[0];
    return cleanPath
      .replace('http://minio:9000', 'http://localhost:9000')
      .replace('https://minio:9000', 'http://localhost:9000')
      .replace('http://mentrix-minio:9000', 'http://localhost:9000')
      .replace('https://mentrix-minio:9000', 'http://localhost:9000');
  }

  return url
    .replace('http://minio:9000', 'http://localhost:9000')
    .replace('https://minio:9000', 'http://localhost:9000')
    .replace('http://mentrix-minio:9000', 'http://localhost:9000')
    .replace('https://mentrix-minio:9000', 'http://localhost:9000');
};
