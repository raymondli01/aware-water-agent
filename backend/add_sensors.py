import asyncio
import uuid
from datetime import datetime
from ai_agents.supabase_client import supabase_client
import constants as c


# Sensor Addition for Pipe P2
async def add_missing_sensors_p2():
    # Edge Lookup
    edges = await supabase_client.query("edges", select="*", name="eq.P2")
    if not edges:
        print("❌ Pipe P2 not found.")
        return
    p2_id = edges[0]["id"]
    print(f"✓ Found Pipe P2 (ID: {p2_id})")

    # Sensor Definitions
    new_sensors = [
        {
            "asset_id": p2_id,
            "asset_type": "edge",
            "type": "pressure",
            "value": 65.0,
            "unit": "psi",
            "last_seen": datetime.utcnow().isoformat(),
        },
        {
            "asset_id": p2_id,
            "asset_type": "edge",
            "type": "acoustic",
            "value": 2.5,
            "unit": "dB",
            "last_seen": datetime.utcnow().isoformat(),
        },
    ]

    # Sensor Insertion
    for sensor in new_sensors:
        try:
            result = await supabase_client.insert("sensors", sensor)
            print(f"✓ Added {sensor['type']} sensor")
        except Exception as e:
            print(f"❌ Failed to add {sensor['type']} sensor: {e}")

    print("\n✅ Missing sensors installed for Pipe P2!")


if __name__ == "__main__":
    asyncio.run(add_missing_sensors_p2())
