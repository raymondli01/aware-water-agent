import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Activity,
  Droplets,
  Gauge,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import * as c from "@/constants";
import { AnimatedNumber } from "@/components/AnimatedNumber";

type SensorType = "pressure" | "flow" | "acoustic" | string;

interface SensorRow {
  id: string;
  type: SensorType;
  value: number | string;
  unit: string;
  asset_id: string;
  asset_type: string;
  last_seen: string;
  created_at?: string;
}

interface EdgeSummary {
  id: string;
  name: string;
}

interface EdgeSensors {
  id: string;
  name: string;
  sensors: SensorRow[];
}

const SensorData = () => {
  const queryClient = useQueryClient();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Mutations
  const refreshMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_URL}/sensors/refresh`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to refresh sensors");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sensors-raw"] });
      toast.success("Sensors refreshed successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to refresh: ${error.message}`);
    },
  });

  const simulateLeakMutation = useMutation({
    mutationFn: async (edgeId: string) => {
      const response = await fetch(
        `${API_URL}/sensors/simulate-leak/${edgeId}`,
        {
          method: "POST",
        }
      );
      if (!response.ok) throw new Error("Failed to simulate leak");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sensors-raw"] });
      toast.success("Leak simulated! Sensors updated to critical levels.");
    },
    onError: (error: Error) => {
      toast.error(`Failed to simulate leak: ${error.message}`);
    },
  });

  // Data Fetching
  const { data: sensors, isLoading: isLoadingSensors } = useQuery<SensorRow[]>({
    queryKey: ["sensors-raw"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from<SensorRow>("sensors")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    refetchInterval: 5000,
  });

  const { data: edgesData, isLoading: isLoadingEdges } = useQuery<EdgeSummary[]>({
    queryKey: ["edges"],
    queryFn: async () => {
      const { data, error } = await supabase.from<EdgeSummary>("edges").select("id, name");

      if (error) throw error;
      return data;
    },
  });

  const isLoading = isLoadingSensors || isLoadingEdges;

  // Data Transformation
  const edgeNameMap = new Map(
    edgesData?.map((edge) => [edge.id, edge.name]) || []
  );

  // Group sensors by edge and keep latest reading per type
  const sensorsByEdge = sensors?.reduce<Record<string, EdgeSensors>>((acc, sensor) => {
    if (sensor.asset_type === "edge") {
      const edgeId = sensor.asset_id;
      if (!acc[edgeId]) {
        acc[edgeId] = {
          id: edgeId,
          name: edgeNameMap.get(edgeId) || edgeId.substring(0, 8),
          sensors: [],
        };
      }
      const existingTypeIndex = acc[edgeId].sensors.findIndex(
        (s) => s.type === sensor.type
      );
      if (existingTypeIndex === -1) {
        acc[edgeId].sensors.push(sensor);
      }
    }
    return acc;
  }, {});

  const sortedGroups = Object.values(sensorsByEdge || {}).sort(
    (a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true })
  );

  const edges: EdgeSensors[] = sortedGroups;

  // Sensor Card Theme Selection
  const getSensorTheme = (type: string, value: number) => {
    const isAlert =
      (type === "pressure" && value < c.PRESSURE_LOW_THRESHOLD) ||
      (type === "acoustic" && value > c.ACOUSTIC_HIGH_THRESHOLD) ||
      (type === "flow" && value > c.FLOW_HIGH_THRESHOLD);

    if (isAlert) {
      return {
        textColor: "text-red-700 dark:text-red-400",
        valueColor: "text-red-700 dark:text-red-400 font-bold",
        iconColor: "text-red-600 dark:text-red-400",
      };
    }

    switch (type) {
      case "pressure":
        return {
          textColor: "text-blue-700 dark:text-blue-300",
          valueColor: "text-foreground",
          iconColor: "text-blue-600 dark:text-blue-400",
        };
      case "acoustic":
        return {
          textColor: "text-orange-700 dark:text-orange-300",
          valueColor: "text-foreground",
          iconColor: "text-orange-600 dark:text-orange-400",
        };
      case "flow":
        return {
          textColor: "text-cyan-700 dark:text-cyan-300",
          valueColor: "text-foreground",
          iconColor: "text-cyan-600 dark:text-cyan-400",
        };
      default:
        return {
          textColor: "text-muted-foreground",
          valueColor: "text-foreground",
          iconColor: "text-muted-foreground",
        };
    }
  };

  // Renders sensor cell for a given type
  const renderSensorCell = (edgeSensors: SensorRow[], type: SensorType) => {
    const sensor = edgeSensors.find((s) => s.type === type);
    if (!sensor) return <span className="text-muted-foreground">-</span>;

    const sensorValue = typeof sensor.value === "number" ? sensor.value : Number(sensor.value);
    const theme = getSensorTheme(type, sensorValue);
    const Icon =
      type === "pressure"
        ? Gauge
        : type === "acoustic"
        ? Activity
        : type === "flow"
        ? Droplets
        : Activity;

    return (
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${theme.iconColor}`} />
        <div className="flex items-baseline gap-1">
          <span className={`${theme.valueColor} tabular-nums`}>
            {typeof sensor.value === "number" ? (
              <AnimatedNumber value={sensor.value} />
            ) : (
              sensor.value
            )}
          </span>
          <span className={`text-xs ${theme.textColor}`}>{sensor.unit}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="w-8 h-8 text-primary" />
            Sensor Telemetry
          </h1>
          <p className="text-muted-foreground">
            Real-time raw data from network sensors used for AI leak detection.
          </p>
        </div>
        <Button
          onClick={() => refreshMutation.mutate()}
          disabled={refreshMutation.isPending}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw
            className={`w-4 h-4 ${
              refreshMutation.isPending ? "animate-spin" : ""
            }`}
          />
          {refreshMutation.isPending ? "Refreshing..." : "Refresh Data"}
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading sensor data...
          </div>
        ) : edges.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No sensor data available.
          </div>
        ) : (
          <Table className="table-fixed">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[20%]">Pipe</TableHead>
                <TableHead className="w-[15%]">Pressure</TableHead>
                <TableHead className="w-[15%]">Flow</TableHead>
                <TableHead className="w-[15%]">Acoustic</TableHead>
                <TableHead className="w-[20%]">Last Update</TableHead>
                <TableHead className="text-right w-[15%]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {edges.map((edge) => {
                // Find most recent update time across sensors for this edge
                const lastUpdate = edge.sensors.reduce(
                  (latest: number, sensor: SensorRow) => {
                    const sensorTime = new Date(sensor.last_seen).getTime();
                    return sensorTime > latest ? sensorTime : latest;
                  },
                  0
                );

                const isStale =
                  new Date().getTime() - lastUpdate > 24 * 60 * 60 * 1000;

                return (
                  <TableRow key={edge.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-base">
                          {edge.name}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {edge.id}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {renderSensorCell(edge.sensors, "pressure")}
                    </TableCell>
                    <TableCell>
                      {renderSensorCell(edge.sensors, "flow")}
                    </TableCell>
                    <TableCell>
                      {renderSensorCell(edge.sensors, "acoustic")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted-foreground">
                          {lastUpdate
                            ? new Date(lastUpdate).toLocaleTimeString()
                            : "-"}
                        </span>
                        {isStale && (
                          <Badge
                            variant="outline"
                            className="w-fit text-[10px] px-1.5 py-0 h-4 border-yellow-500 text-yellow-700 bg-yellow-100"
                          >
                            STALE
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => simulateLeakMutation.mutate(edge.id)}
                        disabled={simulateLeakMutation.isPending}
                      >
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Simulate Leak
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

export default SensorData;
