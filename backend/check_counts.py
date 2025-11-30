import asyncio
from ai_agents.supabase_client import supabase_client
from collections import defaultdict


# Data Fetching
async def check_sensor_counts():
    sensors = await supabase_client.query("sensors", select="*")

    by_type = defaultdict(int)
    by_asset = defaultdict(list)

    print(f"Total Sensors: {len(sensors)}")
    print("-" * 30)

    # Aggregation
    for s in sensors:
        asset_type = s["asset_type"]
        by_type[asset_type] += 1
        by_asset[s["asset_id"]].append(s["type"])

    print("Count by Asset Type:")
    for k, v in by_type.items():
        print(f"  - {k.upper()}: {v}")

    print("\nDetails:")
    for asset_id, types in by_asset.items():
        # Asset Name Lookup
        edges = await supabase_client.query("edges", select="name", id=f"eq.{asset_id}")
        name = edges[0]["name"] if edges else "Node/Unknown"
        print(f"  - {name} ({asset_id[:8]}...): {len(types)} sensors {types}")


if __name__ == "__main__":
    asyncio.run(check_sensor_counts())
