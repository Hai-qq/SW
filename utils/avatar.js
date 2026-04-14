function normalizeAvatarUrl(value) {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  const lower = trimmed.toLowerCase();
  if (!/^https?:\/\//.test(lower)) {
    return '';
  }

  const hostMatch = lower.match(/^https?:\/\/([^\/?#:]+)/);
  const hostname = hostMatch ? hostMatch[1] : '';
  if (hostname === 'example.com' || hostname.endsWith('.example.com')) {
    return '';
  }

  return trimmed;
}

module.exports = {
  normalizeAvatarUrl
};
