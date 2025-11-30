import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NetworkMap from "@/components/NetworkMap";

interface Node {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  pressure: number | null;
}

interface Edge {
  id: string;
  name: string;
  status: string;
  from_node_id: string;
  to_node_id: string;
  active_incident_count?: number;
  highest_priority_incident?: any;
  has_open_incidents?: boolean;
  has_acknowledged_incidents?: boolean;
  material?: string;
  installation_date?: string;
}

// State Initialization
const Network = () => {
  const [center] = useState<[number, number]>([37.3365, -121.8815]);
  const [isolatedEdges, setIsolatedEdges] = useState<Set<string>>(new Set());
  const [isMounted, setIsMounted] = useState(false);
  const [viewMode, setViewMode] = useState<"status" | "material" | "age">(
    "status"
  );

  // Data Fetching
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const { data: topology } = useQuery({
    queryKey: ["network-topology"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/network/topology`);
      const data = await response.json();
      return data;
    },
    refetchInterval: 30000,
  });

  const nodes = (topology?.nodes as Node[]) || [];
  const edges = (topology?.edges as Edge[]) || [];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Real-Time Edge Isolation Monitoring
  useEffect(() => {
    if (!isMounted) return;

    const channel = supabase
      .channel("network-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "edges",
        },
        (payload) => {
          if (payload.new.status === "isolated") {
            setIsolatedEdges((prev) => new Set(prev).add(payload.new.id));
            toast.warning(`Pipe ${payload.new.name} has been isolated`, {
              description: "Autonomous isolation action triggered by AI agent",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isMounted]);

  // Utility: Get Node Position
  const getNodePosition = (nodeId: string): [number, number] | null => {
    const node = nodes?.find((n) => n.id === nodeId);
    return node ? [node.x, node.y] : null;
  };

  // Utility: Determine Edge Color Based on View Mode and Status
  const getEdgeColor = (edge: Edge) => {
    if (edge.status === "isolated" || isolatedEdges.has(edge.id))
      return "#ef4444";
    if (edge.status === "closed") return "#6b7280";

    if (viewMode === "material") {
      const material = edge.material?.toLowerCase() || "unknown";
      if (material === "iron") return "#ef4444";
      if (material === "pvc") return "#0ea5e9";
      if (material === "pe") return "#22c55e";
      if (material === "copper") return "#f59e0b";
      return "#9ca3af";
    }

    if (viewMode === "age") {
      const date = edge.installation_date;
      if (!date) return "#9ca3af";
      const year = parseInt(date.split("-")[0]);
      if (year < 1990) return "#ef4444";
      if (year < 2010) return "#eab308";
      return "#22c55e";
    }

    const edgeData = edge as any;
    if (edgeData.has_acknowledged_incidents || edgeData.has_open_incidents) {
      return "#dc2626";
    }
    if (edgeData.active_incident_count === 0) {
      return "#0ea5e9";
    }
    if (edgeData.status === "critical") return "#dc2626";
    if (edgeData.status === "high") return "#ea580c";
    if (edgeData.status === "medium") return "#ca8a04";
    if (edgeData.status === "low") return "#65a30d";

    return "#0ea5e9";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Network Twin</h1>
          <p className="text-muted-foreground">
            SJSU-West District - Digital Twin Visualization
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Live Network Map</CardTitle>
            <CardDescription>
              Real-time visualization with autonomous isolation monitoring
            </CardDescription>
          </div>
          <Tabs
            value={viewMode}
            onValueChange={(v) => setViewMode(v as any)}
            className="w-[400px]"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="material">Material</TabsTrigger>
              <TabsTrigger value="age">Age</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div
            className="rounded-lg overflow-hidden border border-border"
            style={{ height: "600px" }}
          >
            {isMounted && (
              <NetworkMap
                center={center}
                nodes={nodes}
                edges={edges}
                isolatedEdges={isolatedEdges}
                getNodePosition={getNodePosition}
                getEdgeColor={getEdgeColor}
                viewMode={viewMode}
              />
            )}
            {!isMounted && (
              <div className="h-full w-full flex items-center justify-center bg-muted">
                <p className="text-muted-foreground">Loading map...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {viewMode === "status"
                ? "Pipe Status Legend"
                : viewMode === "material"
                ? "Material Risk Legend"
                : "Pipe Age Legend"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {viewMode === "status" && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#0ea5e9]" />
                  <span className="text-sm">Normal (No Incidents)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#dc2626]" />
                  <span className="text-sm">Critical Incident</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#ea580c]" />
                  <span className="text-sm">High Severity</span>
                </div>
              </>
            )}
            {viewMode === "material" && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#ef4444]" />
                  <span className="text-sm">Iron (High Risk)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#0ea5e9]" />
                  <span className="text-sm">PVC (Medium Risk)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#f59e0b]" />
                  <span className="text-sm">Copper (Med/Low Risk)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#22c55e]" />
                  <span className="text-sm">PE (Low Risk)</span>
                </div>
              </>
            )}
            {viewMode === "age" && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#ef4444]" />
                  <span className="text-sm">Old (&lt; 1990)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#eab308]" />
                  <span className="text-sm">Mid (1990-2010)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-[#22c55e]" />
                  <span className="text-sm">New (&gt; 2010)</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Network Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Nodes:</span>
              <span className="font-medium">{nodes?.length || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Pipes:</span>
              <span className="font-medium">{edges?.length || 0}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Active Incidents:</span>
              <span className="font-medium text-destructive">
                {topology?.incident_summary?.total_active_incidents || 0}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pipes Affected:</span>
              <span className="font-medium text-orange-600">
                {topology?.incident_summary?.edges_with_active_incidents || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monitoring</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Badge variant="default" className="w-full justify-center">
              Real-time Updates Active
            </Badge>
            <p className="text-xs text-muted-foreground text-center">
              Autonomous visual isolation enabled
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Network;
