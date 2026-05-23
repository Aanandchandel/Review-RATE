// Converts a server-relative path like /uploads/foo.jpg to an absolute URL.
// In production REACT_APP_API_URL is unset so the path is used as-is (nginx proxies it).
// In dev it is http://localhost:5000/api → strips /api to get the backend origin.
export function assetUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const apiUrl = process.env.REACT_APP_API_URL || '';
  const origin = apiUrl.replace(/\/api\/?$/, '');
  return `${origin}${path}`;
}
