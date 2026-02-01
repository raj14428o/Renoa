const Device = require("../models/device");

const getLatestPublicKeyByUser = async (userId) => {
  return Device.findOne({ userId })
    .sort({ updatedAt: -1 })
    .lean();
};

const registerDevice = async ({ userId, deviceId, publicKey }) => {
  return Device.findOneAndUpdate(
    { userId, deviceId },
    {
      userId,
      deviceId,
      publicKey,
      lastSeen: new Date(),
    },
    { upsert: true, new: true }
  );
};

module.exports = {
  getLatestPublicKeyByUser,
  registerDevice,
};
