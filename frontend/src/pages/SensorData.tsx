import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, Droplets, Gauge, TrendingUp, AlertTriangle } from 'lucide-react';

const SensorData = () => {
  // Fetch sensors
  const { data: sensors, isLoading: isLoadingSensors } = useQuery({
    queryKey: ['sensors-raw'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sensors')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    refetchInterval: 5000,
  });

  // Fetch edges for name lookup
  const { data: edgesData, isLoading: isLoadingEdges } = useQuery({
    queryKey: ['edges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('edges')
        .select('id, name');
      
      if (error) throw error;
      return data;
    },
  });

  const isLoading = isLoadingSensors || isLoadingEdges;

  // Create edge name lookup map
  const edgeNameMap = new Map(edgesData?.map(edge => [edge.id, edge.name]) || []);

  // Group sensors by Edge (Pipe)
  const sensorsByEdge = sensors?.reduce((acc: any, sensor: any) => {
    if (sensor.asset_type === 'edge') {
      const edgeId = sensor.asset_id;
      if (!acc[edgeId]) {
        acc[edgeId] = {
          id: edgeId,
          name: edgeNameMap.get(edgeId) || edgeId.substring(0, 8),
          sensors: []
        };
      }
      // Only keep the latest reading for each type per edge
      const existingTypeIndex = acc[edgeId].sensors.findIndex((s: any) => s.type === sensor.type);
      if (existingTypeIndex === -1) {
        acc[edgeId].sensors.push(sensor);
      }
    }
    return acc;
  }, {});

  const edges = Object.values(sensorsByEdge || {});

  const getStatusColor = (type: string, value: number) => {
    if (type === 'pressure' && value < 55) return 'text-red-600 font-bold';
    if (type === 'acoustic' && value > 5) return 'text-red-600 font-bold';
    if (type === 'flow' && value > 110) return 'text-red-600 font-bold';
    return 'text-muted-foreground';
  };

  const getStatusBadge = (type: string, value: number) => {
    let isWarning = false;
    if (type === 'pressure' && value < 55) isWarning = true;
    if (type === 'acoustic' && value > 5) isWarning = true;
    if (type === 'flow' && value > 110) isWarning = true;

    if (isWarning) {
      return <Badge variant="destructive" className="ml-2">Alert</Badge>;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Activity className="w-8 h-8 text-primary" />
          Sensor Telemetry
        </h1>
        <p className="text-muted-foreground">
          Real-time raw data from network sensors used for AI leak detection.
        </p>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center">
              Loading sensor data...
            </CardContent>
          </Card>
        ) : edges.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No sensor data available.
            </CardContent>
          </Card>
        ) : (
          (edges as any[]).map((edge: any) => (
            <Card key={edge.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">Pipe: {edge.name}</CardTitle>
                    <Badge variant="outline" className="font-mono text-xs">{edge.id}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {edge.sensors.map((sensor: any) => (
                    <div key={sensor.id} className="flex items-center p-3 border rounded-lg bg-card/50">
                      <div className="mr-4 p-2 bg-primary/10 rounded-full">
                        {sensor.type === 'pressure' && <Gauge className="w-5 h-5 text-blue-500" />}
                        {sensor.type === 'acoustic' && <Activity className="w-5 h-5 text-orange-500" />}
                        {sensor.type === 'flow' && <Droplets className="w-5 h-5 text-cyan-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium capitalize">{sensor.type}</p>
                        <div className="flex items-center">
                          <span className={`text-xl ${getStatusColor(sensor.type, sensor.value)}`}>
                            {sensor.value}
                          </span>
                          <span className="text-sm text-muted-foreground ml-1">{sensor.unit}</span>
                          {getStatusBadge(sensor.type, sensor.value)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last updated: {new Date(sensor.last_seen).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default SensorData;
