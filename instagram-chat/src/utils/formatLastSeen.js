export const formatLastSeen = (lastSeen) => {
  if (!lastSeen) return "online";

  const date = new Date(lastSeen);
  const now = new Date();

  const time = date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const seenDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  if (seenDay.getTime() === today.getTime()) {
    return `last seen today at ${time}`;
  }

  if (seenDay.getTime() === yesterday.getTime()) {
    return `last seen yesterday at ${time}`;
  }

  const diffDays =
    (today - seenDay) / (1000 * 60 * 60 * 24);

  if (diffDays < 7) {
    return `last seen ${date.toLocaleDateString("en-IN", {
      weekday: "long",
    })} at ${time}`;
  }

  return `last seen ${date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })} at ${time}`;
};
