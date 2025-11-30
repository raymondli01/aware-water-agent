import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Activity, Droplets, Gauge, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';
import * as c from '@/constants';

const SensorData = () => {
  const queryClient = useQueryClient();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Refresh mutation
  const refreshMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_URL}/sensors/refresh`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to refresh sensors');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sensors-raw'] });
      toast.success('Sensors refreshed successfully');
    },
    onError: (error) => {
      toast.error(`Failed to refresh: ${error.message}`);
    },
  });

  // Simulate Leak mutation
  const simulateLeakMutation = useMutation({
    mutationFn: async (edgeId: string) => {
      const response = await fetch(`${API_URL}/sensors/simulate-leak/${edgeId}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to simulate leak');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sensors-raw'] });
      toast.success('Leak simulated! Sensors updated to critical levels.');
    },
    onError: (error) => {
      toast.error(`Failed to simulate leak: ${error.message}`);
    },
  });

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

  // Sort groups by name
  const sortedGroups = Object.values(sensorsByEdge || {}).sort((a: any, b: any) => 
    a.name.localeCompare(b.name, undefined, { numeric: true })
  );

  // Sensor type order
  const typeOrder: Record<string, number> = {
    'pressure': 1,
    'flow': 2,
    'acoustic': 3
  };

  // Sort sensors within each group
  sortedGroups.forEach((group: any) => {
    group.sensors.sort((a: any, b: any) => {
      const orderA = typeOrder[a.type] || 99;
      const orderB = typeOrder[b.type] || 99;
      return orderA - orderB;
    });
  });

  const edges = sortedGroups;

  const getSensorTheme = (type: string, value: number) => {
    const isAlert = (type === 'pressure' && value < c.PRESSURE_LOW_THRESHOLD) || 
                    (type === 'acoustic' && value > c.ACOUSTIC_HIGH_THRESHOLD) || 
                    (type === 'flow' && value > c.FLOW_HIGH_THRESHOLD);

    if (isAlert) {
      return {
        bg: 'bg-red-50 dark:bg-red-950/30',
        border: 'border-red-200 dark:border-red-800',
        iconBg: 'bg-red-100 dark:bg-red-900/50',
        iconColor: 'text-red-600 dark:text-red-400',
        textColor: 'text-red-700 dark:text-red-300',
        valueColor: 'text-red-700 dark:text-red-400'
      };
    }

    switch (type) {
      case 'pressure':
        return {
          bg: 'bg-blue-50/50 dark:bg-blue-950/20',
          border: 'border-blue-100 dark:border-blue-800',
          iconBg: 'bg-blue-100 dark:bg-blue-900/50',
          iconColor: 'text-blue-600 dark:text-blue-400',
          textColor: 'text-blue-700 dark:text-blue-300',
          valueColor: 'text-foreground'
        };
      case 'acoustic':
        return {
          bg: 'bg-orange-50/50 dark:bg-orange-950/20',
          border: 'border-orange-100 dark:border-orange-800',
          iconBg: 'bg-orange-100 dark:bg-orange-900/50',
          iconColor: 'text-orange-600 dark:text-orange-400',
          textColor: 'text-orange-700 dark:text-orange-300',
          valueColor: 'text-foreground'
        };
      case 'flow':
        return {
          bg: 'bg-cyan-50/50 dark:bg-cyan-950/20',
          border: 'border-cyan-100 dark:border-cyan-800',
          iconBg: 'bg-cyan-100 dark:bg-cyan-900/50',
          iconColor: 'text-cyan-600 dark:text-cyan-400',
          textColor: 'text-cyan-700 dark:text-cyan-300',
          valueColor: 'text-foreground'
        };
      default:
        return {
          bg: 'bg-card',
          border: 'border-border',
          iconBg: 'bg-muted',
          iconColor: 'text-muted-foreground',
          textColor: 'text-muted-foreground',
          valueColor: 'text-foreground'
        };
    }
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
          <RefreshCw className={`w-4 h-4 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
          {refreshMutation.isPending ? 'Refreshing...' : 'Refresh Data'}
        </Button>
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
            <Card key={edge.id} className="overflow-hidden">
              <CardHeader className="pb-3 bg-muted/30 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      Pipe: {edge.name}
                    </CardTitle>
                    <Badge variant="outline" className="font-mono text-xs bg-background/50">{edge.id}</Badge>
                  </div>
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
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {edge.sensors.map((sensor: any) => {
                    const theme = getSensorTheme(sensor.type, sensor.value);
                    return (
                      <div 
                        key={sensor.id} 
                        className={`flex items-center p-4 border rounded-xl transition-all duration-200 hover:shadow-md ${theme.bg} ${theme.border}`}
                      >
                        <div className={`mr-4 p-3 rounded-full ${theme.iconBg}`}>
                          {sensor.type === 'pressure' && <Gauge className={`w-6 h-6 ${theme.iconColor}`} />}
                          {sensor.type === 'acoustic' && <Activity className={`w-6 h-6 ${theme.iconColor}`} />}
                          {sensor.type === 'flow' && <Droplets className={`w-6 h-6 ${theme.iconColor}`} />}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold capitalize mb-1 ${theme.textColor}`}>{sensor.type}</p>
                          <div className="flex items-baseline gap-1">
                            <span className={`text-2xl font-bold tracking-tight ${theme.valueColor}`}>
                              {typeof sensor.value === 'number' ? sensor.value.toFixed(1) : sensor.value}
                            </span>
                            <span className={`text-sm font-medium ${theme.textColor}`}>{sensor.unit}</span>
                          </div> 
                          <div className="flex items-center gap-2 mt-2">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                              Updated: {new Date(sensor.last_seen).toLocaleTimeString()}
                            </p>
                            {new Date().getTime() - new Date(sensor.last_seen).getTime() > 24 * 60 * 60 * 1000 && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-yellow-500 text-yellow-700 bg-yellow-100">
                                STALE
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
