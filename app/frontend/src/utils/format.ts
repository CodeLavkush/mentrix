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
