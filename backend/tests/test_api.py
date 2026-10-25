from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["simulation_mode"] is True

def test_dashboard_kpis_and_topology():
    response = client.get("/api/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert data["kpis"]["assets_monitored"] == 24
    assert "topology" in data
    assert len(data["topology"]["nodes"]) >= 5

def test_assets_list_and_filter():
    response = client.get("/api/assets?sector=Energy")
    assert response.status_code == 200
    assets = response.json()
    assert len(assets) >= 1
    assert all("Energy" in a["sector"] for a in assets)

def test_detection_and_simulation_workflow():
    # Simulate threat
    sim_res = client.post("/api/demo/simulate-event")
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    assert sim_data["success"] is True
    inc_id = sim_data["incident_id"]

    # Retrieve incident
    inc_res = client.get(f"/api/incidents/{inc_id}")
    assert inc_res.status_code == 200
    inc_data = inc_res.json()
    assert inc_data["status"] == "open"
    assert inc_data["severity"] == "high"

    # Run AI Analysis
    ai_res = client.post(f"/api/incidents/{inc_id}/analyze")
    assert ai_res.status_code == 200
    ai_data = ai_res.json()
    assert "incident_summary" in ai_data
    assert "attack_technique" in ai_data
    assert len(ai_data["recommended_containment_options"]) > 0

    # Reset demo back to baseline
    reset_res = client.post("/api/demo/reset")
    assert reset_res.status_code == 200
    assert reset_res.json()["success"] is True
