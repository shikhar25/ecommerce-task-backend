let notification;

module.exports = (io) => {
  notification = io.of("/notification");
  notification.on("connection", (socket) => {
    console.log("connected socket id : ", socket.id);

    socket.on("notification", (args) => {
      socket.broadcast.emit("notification", args);
    });

    socket.on("disconnect", () => {
      console.log("socket disconnected!!!");
    });
  });
};

// Export the notification namespace
module.exports.notificationNamespace = () => notification;
