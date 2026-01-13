export const formatLastSeen = (date) => {
  if (!date) return "online";

  const diff = Math.floor((Date.now() - new Date(date)) / 60000);

  if (diff < 1) return "just now";
  if (diff < 60) return `last seen ${diff} min ago`;

  const hrs = Math.floor(diff / 60);
  if (hrs < 24) return `last seen ${hrs}h ago`;

  return `last seen ${Math.floor(hrs / 24)}d ago`;
};
