const createTimeAndDate = (currentDate) => {
	// Get individual components of the date and time
	const formattedDate = currentDate.toLocaleDateString("en-US", {
		day: "numeric",
		month: "long",
		year: "numeric",
		hour: "numeric",
		minute: "numeric",
		second: "numeric",
	});

	return `${formattedDate}`;
};

module.exports = createTimeAndDate;
