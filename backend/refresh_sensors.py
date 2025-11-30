import asyncio
import random
from ai_agents.supabase_client import supabase_client

async def refresh_all_sensors():
    """
    Refresh all sensors to have the current timestamp and slightly jittered values.
    """
    print("🔄 Refreshing all sensors...")
    
    # Fetch all sensors
    sensors = await supabase_client.query("sensors", select="*")
    
    if not sensors:
        print("❌ No sensors found.")
        return

    print(f"Found {len(sensors)} sensors. Updating...")

    for sensor in sensors:
        sensor_id = sensor["id"]
        current_value = sensor["value"]
        sensor_type = sensor["type"]
        
        # Add slight jitter to values to make them look "live"
        if current_value is not None:
            if sensor_type == "pressure":
                # Jitter +/- 0.5 psi
                new_value = current_value + random.uniform(-0.5, 0.5)
            elif sensor_type == "flow":
                # Jitter +/- 1.0 L/s
                new_value = current_value + random.uniform(-1.0, 1.0)
            elif sensor_type == "acoustic":
                # Jitter +/- 0.1 dB
                new_value = current_value + random.uniform(-0.1, 0.1)
            else:
                new_value = current_value
                
            # Keep values within reasonable bounds (simple clamp)
            if new_value < 0: new_value = 0
        else:
            new_value = None

        # Update sensor
        await supabase_client.update(
            "sensors",
            {"value": new_value, "last_seen": "now()"},
            id=f"eq.{sensor_id}"
        )
        
    print("✅ All sensors refreshed to now!")

if __name__ == "__main__":
    asyncio.run(refresh_all_sensors())
