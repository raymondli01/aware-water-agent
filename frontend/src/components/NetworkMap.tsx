import { useEffect, useRef, useState } from "react";
import type { Circle, Map as LeafletMap, Polyline } from "leaflet";
import "leaflet/dist/leaflet.css";

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
  has_acknowledged_incidents?: boolean;
  material?: string;
  installation_date?: string;
}

interface NetworkMapProps {
  center: [number, number];
  nodes: Node[] | undefined;
  edges: Edge[] | undefined;
  isolatedEdges: Set<string>;
  getNodePosition: (nodeId: string) => [number, number] | null;
  getEdgeColor: (edge: Edge) => string;
  viewMode?: "status" | "material" | "age";
}

type LeafletModule = typeof import("leaflet");

let Leaflet: LeafletModule | null = null;

const NetworkMap = ({
  center,
  nodes,
  edges,
  isolatedEdges,
  getNodePosition,
  getEdgeColor,
  viewMode = "status",
}: NetworkMapProps) => {
  const mapRef = useRef<LeafletMap | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, Circle>>(new Map());
  const polylinesRef = useRef<Map<string, Polyline>>(new Map());
  const [L, setL] = useState<LeafletModule | null>(null);

  // Load Leaflet dynamically on client side
  useEffect(() => {
    if (typeof window === "undefined" || Leaflet) {
      if (Leaflet) setL(Leaflet);
      return;
    }

    import("leaflet").then((leafletModule) => {
      Leaflet = leafletModule.default;
      setL(Leaflet);
    });
  }, []);

  // Map Initialization
  useEffect(() => {
    if (!L || !mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom: 16,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [L, center]);

  // Center Map on Update
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center, mapRef.current.getZoom());
    }
  }, [center]);

  // Render Node Markers
  useEffect(() => {
    if (!L || !mapRef.current || !nodes) return;

    markersRef.current.forEach((marker) => {
      mapRef.current?.removeLayer(marker);
    });
    markersRef.current.clear();

    nodes.forEach((node) => {
      const color =
        node.type === "tank"
          ? "#22c55e"
          : node.type === "reservoir"
          ? "#0ea5e9"
          : "#f59e0b";

      const circle = L.circle([node.x, node.y], {
        radius: 20,
        fillColor: color,
        fillOpacity: 0.8,
        color: "#fff",
        weight: 2,
      });

      // Node popup
      const popupContent = document.createElement("div");
      popupContent.className = "p-2";
      popupContent.innerHTML = `
        <p class="font-semibold">${node.name}</p>
        <span class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold mt-1">${
          node.type
        }</span>
        ${
          node.pressure
            ? `<p class="text-sm mt-2">Pressure: ${node.pressure.toFixed(
                1
              )} psi</p>`
            : ""
        }
      `;

      circle.bindPopup(popupContent);
      circle.addTo(mapRef.current!);
      markersRef.current.set(node.id, circle);
    });
  }, [L, nodes]);

  // Render Edge Polylines
  useEffect(() => {
    if (!L || !mapRef.current || !edges) return;

    polylinesRef.current.forEach((polyline) => {
      mapRef.current?.removeLayer(polyline);
    });
    polylinesRef.current.clear();

    edges.forEach((edge) => {
      const from = getNodePosition(edge.from_node_id);
      const to = getNodePosition(edge.to_node_id);
      if (!from || !to) return;

      const color = getEdgeColor(edge);
      const dashArray =
        edge.status === "isolated" || edge.has_acknowledged_incidents
          ? "10, 10"
          : undefined;

      const polyline = L.polyline([from, to], {
        color,
        weight: 4,
        opacity: 0.8,
        dashArray,
      });

      // Edge popup
      const popupContent = document.createElement("div");
      popupContent.className = "p-2";

      let details = "";
      if (viewMode === "material") {
        details = `<p class="text-xs mt-1">Material: ${
          edge.material || "Unknown"
        }</p>`;
      } else if (viewMode === "age") {
        details = `<p class="text-xs mt-1">Installed: ${
          edge.installation_date || "Unknown"
        }</p>`;
      } else {
        details = `<span class="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold mt-1">${edge.status}</span>`;
      }

      popupContent.innerHTML = `
        <p class="font-semibold">${edge.name}</p>
        ${details}
        ${
          edge.material
            ? `<p class="text-[10px] text-muted-foreground mt-1">${
                edge.material
              } • ${edge.installation_date?.split("-")[0] || "?"}</p>`
            : ""
        }
      `;

      polyline.bindPopup(popupContent);
      polyline.addTo(mapRef.current!);
      polylinesRef.current.set(edge.id, polyline);
    });
  }, [L, edges, isolatedEdges, getNodePosition, getEdgeColor, viewMode]);

  return (
    <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />
  );
};

export default NetworkMap;
