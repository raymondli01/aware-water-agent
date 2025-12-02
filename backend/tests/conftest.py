"""
Pytest configuration and fixtures for AWARE Water Management System tests.

This module provides:
- Mocked Supabase client (no real database calls)
- Mocked OpenAI client (no API costs)
- Test FastAPI client
- Sample test data fixtures
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock, patch
import sys
import os

# Add parent directory to path to import main app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@pytest.fixture
def mock_supabase_client():
    """Mock Supabase client to avoid real database calls."""
    mock_client = AsyncMock()

    # Mock query method
    async def mock_query(table, select="*", **filters):
        """Return sample data based on table name."""
        if table == "sensors":
            return [
                {"id": "S1", "type": "pressure", "value": 75.5, "asset_type": "edge", "asset_id": "E1"},
                {"id": "S2", "type": "acoustic", "value": 1.2, "asset_type": "edge", "asset_id": "E1"},
                {"id": "S3", "type": "flow", "value": 450.0, "asset_type": "edge", "asset_id": "E1"},
            ]
        elif table == "nodes":
            return [
                {"id": "N1", "name": "Junction 1", "type": "junction", "latitude": 37.3, "longitude": -121.9},
                {"id": "N2", "name": "Tank 1", "type": "tank", "latitude": 37.31, "longitude": -121.91},
            ]
        elif table == "edges":
            return [
                {"id": "E1", "from_node": "N1", "to_node": "N2", "material": "PVC", "diameter": 12},
                {"id": "E2", "from_node": "N2", "to_node": "N3", "material": "Cast Iron", "diameter": 10},
            ]
        elif table == "events":
            return [
                {
                    "id": "EV1",
                    "title": "Leak detected on E1",
                    "asset_ref": "E1",
                    "asset_type": "edge",
                    "state": "open",
                    "severity": "high",
                    "priority": 8,
                    "confidence": 0.85,
                    "detected_by": "Leak Detection Agent",
                    "created_at": "2025-01-01T10:00:00Z"
                }
            ]
        return []

    # Mock update method
    async def mock_update(table, data, **filters):
        """Mock update operation."""
        return {"status": "success", "updated": 1}

    # Mock get_sensors_with_assets
    async def mock_get_sensors_with_assets():
        """Return sample sensor data with asset info."""
        return [
            {"id": "S1", "type": "pressure", "value": 75.5, "asset_type": "edge", "asset_id": "E1"},
            {"id": "S2", "type": "acoustic", "value": 1.2, "asset_type": "edge", "asset_id": "E1"},
            {"id": "S3", "type": "flow", "value": 450.0, "asset_type": "edge", "asset_id": "E1"},
        ]

    mock_client.query = mock_query
    mock_client.update = mock_update
    mock_client.get_sensors_with_assets = mock_get_sensors_with_assets

    return mock_client


@pytest.fixture
def mock_openai_client():
    """Mock OpenAI client to avoid API costs."""
    mock_client = MagicMock()

    # Mock chat completions
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = '{"status": "success", "analysis": "test"}'

    mock_client.chat.completions.create.return_value = mock_response

    return mock_client


@pytest.fixture
def mock_agent_coordinator():
    """Mock AgentCoordinator to avoid AI agent calls."""
    mock_coordinator = AsyncMock()

    # Mock run_all_agents
    async def mock_run_all_agents():
        return {
            "status": "success",
            "leak_detection": {"edges_analyzed": 10, "leaks_found": 2},
            "energy_optimization": {"savings": 150.0},
            "safety_monitoring": {"violations": 0}
        }

    # Mock run_leak_detection
    async def mock_run_leak_detection():
        return {
            "status": "success",
            "edges_analyzed": 10,
            "leaks_found": 2,
            "high_confidence_leaks": ["E1", "E5"]
        }

    # Mock run_energy_optimization
    async def mock_run_energy_optimization():
        return {
            "status": "success",
            "recommended_schedule": [],
            "estimated_savings": 150.0
        }

    # Mock run_safety_monitoring
    async def mock_run_safety_monitoring():
        return {
            "status": "success",
            "violations": 0,
            "warnings": []
        }

    mock_coordinator.run_all_agents = mock_run_all_agents
    mock_coordinator.run_leak_detection = mock_run_leak_detection
    mock_coordinator.run_energy_optimization = mock_run_energy_optimization
    mock_coordinator.run_safety_monitoring = mock_run_safety_monitoring

    return mock_coordinator


@pytest.fixture
def mock_analytics_agent():
    """Mock AnalyticsAgent."""
    mock_agent = AsyncMock()

    async def mock_generate_all_analytics():
        return {
            "status": "success",
            "nrw": 15.5,
            "uptime": 99.2,
            "demand_forecast": [],
            "energy_metrics": {"cost": 1250.0}
        }

    mock_agent.generate_all_analytics = mock_generate_all_analytics

    return mock_agent


@pytest.fixture
def test_client(mock_supabase_client, mock_agent_coordinator, mock_analytics_agent):
    """
    Create a test client for the FastAPI app with all dependencies mocked.
    This avoids real Supabase and OpenAI calls during testing.
    """
    # Patch the imports before importing main
    with patch('ai_agents.supabase_client.supabase_client', mock_supabase_client):
        with patch('main.coordinator', mock_agent_coordinator):
            with patch('main.analytics_agent', mock_analytics_agent):
                # Import main app after mocking
                from main import app

                # Create test client
                client = TestClient(app)
                yield client


# Sample test data fixtures

@pytest.fixture
def sample_sensor_data():
    """Sample sensor data for testing."""
    return [
        {"id": "S1", "type": "pressure", "value": 75.5, "asset_type": "edge", "asset_id": "E1"},
        {"id": "S2", "type": "acoustic", "value": 1.2, "asset_type": "edge", "asset_id": "E1"},
        {"id": "S3", "type": "flow", "value": 450.0, "asset_type": "edge", "asset_id": "E1"},
    ]


@pytest.fixture
def sample_leak_data():
    """Sample leak detection data for testing."""
    return {
        "edge_id": "E1",
        "pressure": 45.0,  # Low pressure
        "acoustic": 3.5,   # High acoustic
        "leak": True
    }


@pytest.fixture
def sample_network_topology():
    """Sample network topology data for testing."""
    return {
        "nodes": [
            {"id": "N1", "name": "Junction 1", "type": "junction"},
            {"id": "N2", "name": "Tank 1", "type": "tank"},
        ],
        "edges": [
            {"id": "E1", "from_node": "N1", "to_node": "N2", "status": "normal"},
        ]
    }
