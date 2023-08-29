const axios = require("axios");

async function pushNotification(id_array, icon_url, title, text) {
  const json = {
    subscribers: id_array,
    icon: icon_url,
    title: title,
    text: text,
  };

  await axios.post(process.env.ENS_URL + "/notify", json).then((response) => {
    if (response.data.success === true) {
      return true;
    } else {
      console.log(response.data);
      return false;
    }
  });
}

module.exports = { pushNotification };
