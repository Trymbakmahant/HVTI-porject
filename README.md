# IoT Device Management System

A complete IoT device management system with voltage monitoring capabilities. The system consists of a Next.js frontend for device monitoring and an Express.js backend with Prisma for data management.

## Features

- **Device Management**: Register and monitor IoT devices
- **Voltage Monitoring**: Track voltage readings and detect high voltage events
- **Real-time Status**: Live device status updates and heartbeat monitoring
- **Data Visualization**: Interactive charts and logs for device data
- **Responsive UI**: Modern, mobile-friendly interface

## Architecture

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, and Recharts
- **Backend**: Express.js with TypeScript and Prisma ORM
- **Database**: SQLite (easily configurable for PostgreSQL/MySQL)
- **Real-time**: Device heartbeat every 5 minutes, instant voltage alerts

## Quick Start

### 1. Backend Setup

```bash
cd iot-backend

# Install dependencies
npm install

# Set up database
npm run db:migrate

# Seed with sample data
npm run seed

# Start development server
npm run dev
```

The backend will run on `http://localhost:3001`

### 2. Frontend Setup

```bash
cd iot-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

### 3. Test Device Simulation

To simulate an IoT device sending data:

```bash
cd iot-backend
npm run test-device
```

This will create a test device that sends:

- Heartbeat every 10 seconds (simulating 5-minute intervals)
- Voltage readings with 10% chance of high voltage alerts
- Real-time data to the backend

## API Endpoints

### Device Management

- `GET /api/devices` - Get all devices
- `GET /api/devices/:deviceId` - Get specific device with logs
- `POST /api/devices` - Register/update device (heartbeat)
- `PATCH /api/devices/:deviceId/status` - Update device status

### Voltage Logging

- `POST /api/devices/:deviceId/voltage` - Log voltage reading
- `GET /api/devices/:deviceId/logs` - Get voltage logs

### Health Check

- `GET /health` - Server health status

## Database Schema

### Device

- `id`: Unique identifier
- `deviceId`: Device identifier (from IoT device)
- `name`: Human-readable device name
- `location`: Device location
- `status`: active/inactive/error
- `lastSeen`: Last heartbeat timestamp

### VoltageLog

- `id`: Unique identifier
- `deviceId`: Reference to device
- `voltage`: Voltage reading
- `isHigh`: Boolean flag for high voltage
- `timestamp`: Reading timestamp

## IoT Device Integration

Your IoT device should send data to these endpoints:

### Device Registration/Heartbeat (every 5 minutes)

```bash
POST http://localhost:3001/api/devices
Content-Type: application/json

{
  "deviceId": "YOUR_DEVICE_ID",
  "name": "Device Name",
  "location": "Device Location"
}
```

### Voltage Alert (when high voltage detected)

```bash
POST http://localhost:3001/api/devices/YOUR_DEVICE_ID/voltage
Content-Type: application/json

{
  "voltage": 250.5,
  "isHigh": true
}
```

## Development

### Backend Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run seed` - Populate database with sample data
- `npm run test-device` - Simulate IoT device

### Frontend Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Production Deployment

1. **Backend**: Deploy to your preferred platform (Railway, Heroku, AWS, etc.)
2. **Database**: Switch from SQLite to PostgreSQL/MySQL for production
3. **Frontend**: Deploy to Vercel, Netlify, or your preferred platform
4. **Environment**: Update API URLs in frontend for production backend

## Customization

- **Voltage Thresholds**: Modify high voltage detection logic in backend
- **Heartbeat Interval**: Change from 5 minutes to your preferred interval
- **UI Theme**: Customize Tailwind CSS classes for different styling
- **Database**: Switch to PostgreSQL/MySQL by updating Prisma schema and DATABASE_URL

## Troubleshooting

- **CORS Issues**: Ensure backend CORS is configured for your frontend domain
- **Database Issues**: Run `npm run db:migrate` to ensure schema is up to date
- **API Connection**: Check that backend is running on port 3001
- **Device Not Appearing**: Ensure device is sending heartbeat to `/api/devices` endpoint
