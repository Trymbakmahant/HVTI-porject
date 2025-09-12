"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
} from "lucide-react";

interface Device {
  id: string;
  deviceId: string;
  name: string;
  location: string;
  status: string;
  lastSeen: string;
  voltageLogs: Array<{
    voltage: number;
    isHigh: boolean;
    timestamp: string;
  }>;
}

export default function Home() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDevices();
    // Refresh every 30 seconds
    const interval = setInterval(fetchDevices, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/devices");
      if (!response.ok) throw new Error("Failed to fetch devices");
      const data = await response.json();
      setDevices(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string, isHigh?: boolean) => {
    if (isHigh) return <AlertTriangle className="w-5 h-5 text-red-500" />;
    if (status === "active")
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    return <Activity className="w-5 h-5 text-yellow-500" />;
  };

  const getStatusColor = (status: string, isHigh?: boolean) => {
    if (isHigh) return "bg-red-100 text-red-800 border-red-200";
    if (status === "active")
      return "bg-green-100 text-green-800 border-green-200";
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  };

  const formatLastSeen = (lastSeen: string) => {
    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading devices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                IoT Device Management
              </h1>
              <p className="mt-2 text-gray-600">
                Monitor and manage your voltage sensing devices
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                ru Last updated: {new Date().toLocaleTimeString()}
              </div>
              <button
                onClick={fetchDevices}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading devices
                </h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {devices.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No devices found
            </h3>
            <p className="text-gray-600">
              No IoT devices are currently registered in the system.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device) => {
              const latestLog = device.voltageLogs[0];
              const isHigh = latestLog?.isHigh;

              return (
                <Link
                  key={device.id}
                  href={`/device/${device.deviceId}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 hover:border-gray-300"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {device.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          ID: {device.deviceId}
                        </p>
                      </div>
                      {getStatusIcon(device.status, isHigh)}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {device.location}
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {formatLastSeen(device.lastSeen)}
                      </div>

                      {latestLog && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Latest Voltage:
                          </span>
                          <span
                            className={`font-medium ${
                              isHigh ? "text-red-600" : "text-green-600"
                            }`}
                          >
                            {latestLog.voltage}V
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            device.status,
                            isHigh
                          )}`}
                        >
                          {isHigh ? "High Voltage" : device.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
