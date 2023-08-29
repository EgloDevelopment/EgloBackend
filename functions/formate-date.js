function formatDate(unixTimestamp) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const date = new Date(unixTimestamp); // No need to multiply by 1000
  const month = months[date.getMonth()];
  const day = date.getDate();

  const formattedDate = `${month} ${day}`;
  return formattedDate;
}

module.exports = { formatDate }