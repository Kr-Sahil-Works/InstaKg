export function extractTime(dateString) {
	const date = new Date(dateString);

	let hours = date.getHours();
	const minutes = date.getMinutes();
	const ampm = hours >= 12 ? "PM" : "AM";

	hours = hours % 12 || 12;

	return `${padZero(hours)}:${padZero(minutes)} ${ampm}`;
}

function padZero(num) {
	return num.toString().padStart(2, "0");
}
