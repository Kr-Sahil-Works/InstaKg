function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    "#005C4B", // WhatsApp green
    "#1F7AEC", // blue
    "#7B3FE4", // purple
    "#C13584", // pink
    "#D97706", // orange
    "#059669", // teal
    "#DC2626", // red
  ];

  return colors[Math.abs(hash) % colors.length];
}

export default function Avatar({ name, size = 40 }) {
  const initial = name?.[0]?.toUpperCase() || "?";
  const bg = stringToColor(name || "");

  return (
    <div
      style={{ width: size, height: size, backgroundColor: bg }}
      className="
        flex items-center justify-center
        rounded-full
        text-white
        font-semibold
        select-none
      "
    >
      {initial}
    </div>
  );
}
