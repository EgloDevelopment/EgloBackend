const WebSocket = require("ws");

const setupWebSocket = (server, app) => {
  const wss = new WebSocket.Server({ server });

  const channels = {}; // Store the subscribed channels and their connections

  wss.on("connection", (ws) => {
    ws.on("message", (message) => {
      const data = JSON.parse(message);

      // Subscribe to a channel
      if (data.action === "subscribe") {
        const channel = data.id;
        if (!channels[channel]) {
          channels[channel] = [];
        }
        channels[channel].push(ws);
      }

      // Unsubscribe from a channel
      if (data.action === "unsubscribe") {
        const channel = data.id;
        if (channels[channel]) {
          channels[channel] = channels[channel].filter(
            (client) => client !== ws
          );
        }
      }

      // Publish a message to a channel
      if (data.action === "publish") {
        const channel = data.id;
        if (channels[channel]) {
          channels[channel].forEach((client) => {
            client.send(JSON.stringify(data));
          });
        }
      }
    });
  });
};

module.exports = setupWebSocket;