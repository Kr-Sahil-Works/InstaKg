export const formatLastSeen = (lastSeen) => {
  if (!lastSeen) return "online";

  const diff = Math.floor((Date.now() - new Date(lastSeen)) / 60000);

  if (diff < 1) return "just now";
  if (diff < 60) return `last seen ${diff} min ago`;

  const hours = Math.floor(diff / 60);
  if (hours < 24) return `last seen ${hours}h ago`;

  return `last seen ${Math.floor(hours / 24)}d ago`;
};
