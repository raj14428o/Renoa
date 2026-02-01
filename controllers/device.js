const deviceService = require("../services/device");

// GET /public/:userId
const getPublicKey = async (req, res) => {
  try {
    const device = await deviceService.getLatestPublicKeyByUser(
      req.params.userId
    );

    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    res.json({ publicKey: device.publicKey });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch public key" });
  }
};

// POST /register
const registerDevice = async (req, res) => {
  try {
    if (!req.user) return res.sendStatus(401);

    const { deviceId, publicKey } = req.body;
    if (!deviceId || !publicKey) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    await deviceService.registerDevice({
      userId: req.user._id,
      deviceId,
      publicKey,
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to register device" });
  }
};

module.exports = {
  getPublicKey,
  registerDevice,
};
