"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Zap,
  RefreshCw,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Device {
  id: string;
  deviceId: string;
  name: string;
  location: string;
  status: string;
  lastSeen: string;
  voltageLogs: Array<{
    id: string;
    voltage: number;
    isHigh: boolean;
    timestamp: string;
  }>;
}

interface VoltageLog {
  id: string;
  voltage: number;
  isHigh: boolean;
  timestamp: string;
}

export default function DeviceDetail() {
  const params = useParams();
  const router = useRouter();
  const deviceId = params.deviceId as string;

  const [device, setDevice] = useState<Device | null>(null);
  const [logs, setLogs] = useState<VoltageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "logs" | "graph">(
    "overview"
  );

  useEffect(() => {
    if (deviceId) {
      fetchDeviceData();
    }
  }, [deviceId]);

  const fetchDeviceData = async () => {
    try {
      setLoading(true);
      const [deviceResponse, logsResponse] = await Promise.all([
        fetch(`http://localhost:3001/api/devices/${deviceId}`),
        fetch(`http://localhost:3001/api/devices/${deviceId}/logs?limit=100`),
      ]);

      if (!deviceResponse.ok) throw new Error("Failed to fetch device");
      if (!logsResponse.ok) throw new Error("Failed to fetch logs");

      const deviceData = await deviceResponse.json();
      const logsData = await logsResponse.json();

      setDevice(deviceData);
      setLogs(logsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string, isHigh?: boolean) => {
    if (isHigh) return <AlertTriangle className="w-6 h-6 text-red-500" />;
    if (status === "active")
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    return <Activity className="w-6 h-6 text-yellow-500" />;
  };

  const getStatusColor = (status: string, isHigh?: boolean) => {
    if (isHigh) return "bg-red-100 text-red-800 border-red-200";
    if (status === "active")
      return "bg-green-100 text-green-800 border-green-200";
    return "bg-yellow-100 text-yellow-800 border-yellow-200";
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
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

  // Prepare chart data
  const chartData = logs
    .slice()
    .reverse()
    .map((log) => ({
      time: new Date(log.timestamp).toLocaleTimeString(),
      voltage: log.voltage,
      isHigh: log.isHigh,
    }));

  const highVoltageCount = logs.filter((log) => log.isHigh).length;
  const averageVoltage =
    logs.length > 0
      ? logs.reduce((sum, log) => sum + log.voltage, 0) / logs.length
      : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading device data...</p>
        </div>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Device not found
          </h3>
          <p className="text-gray-600 mb-4">
            {error || "The requested device could not be found."}
          </p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Devices
          </Link>
        </div>
      </div>
    );
  }

  const latestLog = device.voltageLogs[0];
  const isHigh = latestLog?.isHigh;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Devices
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {device.name}
                </h1>
                <p className="text-gray-600">Device ID: {device.deviceId}</p>
              </div>
            </div>
            <button
              onClick={fetchDeviceData}
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Device Status Card */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                {getStatusIcon(device.status, isHigh)}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Device Status
                  </h2>
                  <p className="text-gray-600">
                    Real-time monitoring information
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                  device.status,
                  isHigh
                )}`}
              >
                {isHigh ? "High Voltage Alert" : device.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-semibold text-gray-900">{device.location}</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">Last Seen</p>
                <p className="font-semibold text-gray-900">
                  {formatLastSeen(device.lastSeen)}
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-sm text-gray-600">Latest Voltage</p>
                <p
                  className={`font-semibold ${
                    isHigh ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {latestLog ? `${latestLog.voltage}V` : "N/A"}
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mx-auto mb-2">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <p className="text-sm text-gray-600">High Voltage Events</p>
                <p className="font-semibold text-gray-900">
                  {highVoltageCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "overview", label: "Overview" },
                { id: "logs", label: "Recent Logs" },
                { id: "graph", label: "Voltage Graph" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Device Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Device ID:</span>
                        <span className="font-medium">{device.deviceId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{device.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{device.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span
                          className={`font-medium ${
                            isHigh ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {isHigh ? "High Voltage Alert" : device.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Statistics
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Logs:</span>
                        <span className="font-medium">{logs.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average Voltage:</span>
                        <span className="font-medium">
                          {averageVoltage.toFixed(2)}V
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          High Voltage Events:
                        </span>
                        <span className="font-medium text-red-600">
                          {highVoltageCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Update:</span>
                        <span className="font-medium">
                          {formatLastSeen(device.lastSeen)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "logs" && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">
                  Recent Voltage Logs
                </h3>
                {logs.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">
                    No voltage logs available
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Timestamp
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Voltage
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {logs.slice(0, 20).map((log) => (
                          <tr key={log.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatTimestamp(log.timestamp)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <span
                                className={
                                  log.isHigh ? "text-red-600" : "text-green-600"
                                }
                              >
                                {log.voltage}V
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  log.isHigh
                                    ? "bg-red-100 text-red-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {log.isHigh ? "High Voltage" : "Normal"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === "graph" && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">
                  Voltage Over Time
                </h3>
                {chartData.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">
                    No data available for graphing
                  </p>
                ) : (
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <Tooltip
                          formatter={(value: number, name: string) => [
                            `${value}V`,
                            "Voltage",
                          ]}
                          labelFormatter={(label) => `Time: ${label}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="voltage"
                          stroke="#3B82F6"
                          strokeWidth={2}
                          dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
