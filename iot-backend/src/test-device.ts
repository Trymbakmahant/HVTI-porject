import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function simulateDevice() {
  const deviceId = "TEST_DEVICE_001";

  console.log("🔌 Starting IoT device simulation...");
  console.log("Device ID:", deviceId);
  console.log("Press Ctrl+C to stop\n");

  // Register device
  await prisma.device.upsert({
    where: { deviceId },
    update: {
      lastSeen: new Date(),
      status: "active",
    },
    create: {
      deviceId,
      name: "Test IoT Device",
      location: "Test Lab",
      lastSeen: new Date(),
      status: "active",
    },
  });

  console.log("✅ Device registered");

  // Simulate device activity
  let heartbeatCount = 0;
  let voltageAlertCount = 0;

  const heartbeat = setInterval(async () => {
    heartbeatCount++;

    // Update device last seen (heartbeat every 5 minutes)
    await prisma.device.update({
      where: { deviceId },
      data: {
        lastSeen: new Date(),
        status: "active",
      },
    });

    console.log(`💓 Heartbeat #${heartbeatCount} - Device active`);

    // Simulate voltage reading (10% chance of high voltage)
    const isHighVoltage = Math.random() < 0.1;
    const voltage = isHighVoltage
      ? 250 + Math.random() * 20 // High voltage: 250-270V
      : 220 + Math.random() * 20; // Normal voltage: 220-240V

    if (isHighVoltage) {
      voltageAlertCount++;
      console.log(`⚠️  HIGH VOLTAGE ALERT! Voltage: ${voltage.toFixed(1)}V`);

      // Log high voltage event
      await prisma.voltageLog.create({
        data: {
          deviceId,
          voltage: Math.round(voltage * 10) / 10,
          isHigh: true,
        },
      });
    } else {
      // Log normal voltage reading
      await prisma.voltageLog.create({
        data: {
          deviceId,
          voltage: Math.round(voltage * 10) / 10,
          isHigh: false,
        },
      });
    }

    console.log(
      `📊 Voltage: ${voltage.toFixed(1)}V (${
        isHighVoltage ? "HIGH" : "Normal"
      })`
    );
    console.log(`📈 Total alerts: ${voltageAlertCount}\n`);
  }, 10000); // 10 seconds for demo (instead of 5 minutes)

  // Handle graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\n🛑 Shutting down device simulation...");
    clearInterval(heartbeat);

    // Mark device as inactive
    await prisma.device.update({
      where: { deviceId },
      data: { status: "inactive" },
    });

    console.log("✅ Device marked as inactive");
    console.log(`📊 Total heartbeats: ${heartbeatCount}`);
    console.log(`⚠️  Total voltage alerts: ${voltageAlertCount}`);

    await prisma.$disconnect();
    process.exit(0);
  });
}

simulateDevice().catch(console.error);
