function generatePhoneNumber() {
  const areaCode = Math.floor(Math.random() * 9000) + 100;
  const exchangeCode = Math.floor(Math.random() * 900) + 100;
  const subscriberNumber = Math.floor(Math.random() * 9000) + 1000;
  const phoneNumber = `${areaCode}${exchangeCode}${subscriberNumber}`;

  return phoneNumber;
}

module.exports = { generatePhoneNumber };
