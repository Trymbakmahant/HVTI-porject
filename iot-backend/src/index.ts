import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});
app.post("/poste", (req, res) => {
  try {
    console.log(req.body);
  } catch (e) {
    console.log(e);
  }
});
// Get all devices
app.get("/api/devices", async (req, res) => {
  try {
    const devices = await prisma.device.findMany({
      include: {
        voltageLogs: {
          orderBy: { timestamp: "desc" },
          take: 1,
        },
      },
    });
    res.json(devices);
  } catch (error) {
    console.error("Error fetching devices:", error);
    res.status(500).json({ error: "Failed to fetch devices" });
  }
});

// Get device by ID
app.get("/api/devices/:deviceId", async (req, res) => {
  try {
    const { deviceId } = req.params;
    const device = await prisma.device.findUnique({
      where: { deviceId },
      include: {
        voltageLogs: {
          orderBy: { timestamp: "desc" },
        },
      },
    });

    if (!device) {
      return res.status(404).json({ error: "Device not found" });
    }

    res.json(device);
  } catch (error) {
    console.error("Error fetching device:", error);
    res.status(500).json({ error: "Failed to fetch device" });
  }
});

// Create or update device (device registration)
app.post("/api/devices", async (req, res) => {
  try {
    const { deviceId, name, location } = req.body;
    console.log("device api call ", req.body);
    const device = await prisma.device.upsert({
      where: { deviceId },
      update: {
        lastSeen: new Date(),
        status: "active",
      },
      create: {
        deviceId,
        name: name || `Device ${deviceId}`,
        location: location || "Unknown",
        lastSeen: new Date(),
        status: "active",
      },
    });

    res.json(device);
  } catch (error) {
    console.error("Error creating/updating device:", error);
    res.status(500).json({ error: "Failed to create/update device" });
  }
});

// Log voltage data
app.post("/api/devices/:deviceId/voltage", async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { voltage, isHigh } = req.body;
    console.log("device log voltage call ", req.body);
    // Ensure device exists + update lastSeen
    await prisma.device.upsert({
      where: { deviceId },
      update: {
        lastSeen: new Date(),
        status: "active",
      },
      create: {
        deviceId,
        name: `Device ${deviceId}`,
        location: "Unknown",
        lastSeen: new Date(),
        status: "active",
      },
    });

    // Create voltage log
    const voltageLog = await prisma.voltageLog.create({
      data: {
        deviceId,
        voltage,
        isHigh,
      },
    });

    res.json(voltageLog);
  } catch (error) {
    console.error("Error logging voltage:", error);
    res.status(500).json({ error: "Failed to log voltage data" });
  }
});

// Get voltage logs
app.get("/api/devices/:deviceId/logs", async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { limit = "100", offset = "0" } = req.query;

    const logs = await prisma.voltageLog.findMany({
      where: { deviceId },
      orderBy: { timestamp: "desc" },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    res.json(logs);
  } catch (error) {
    console.error("Error fetching voltage logs:", error);
    res.status(500).json({ error: "Failed to fetch voltage logs" });
  }
});

// PATCH for manual status changes (admin use)
app.patch("/api/devices/:deviceId/status", async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { status } = req.body;
    console.log("device status call ", req.body);
    const device = await prisma.device.update({
      where: { deviceId },
      data: { status },
    });

    res.json(device);
  } catch (error) {
    console.error("Error updating device status:", error);
    res.status(500).json({ error: "Failed to update device status" });
  }
});

// PUT for device heartbeat (from Arduino)
app.put("/api/devices/:deviceId/status", async (req, res) => {
  try {
    const { deviceId } = req.params;
    console.log("device api call heartbeat call ");
    const device = await prisma.device.update({
      where: { deviceId },
      data: {
        status: "active",
        lastSeen: new Date(),
      },
    });

    res.json(device);
  } catch (error) {
    console.error("Error handling heartbeat:", error);
    res.status(500).json({ error: "Failed to handle heartbeat" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 IoT Backend server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
