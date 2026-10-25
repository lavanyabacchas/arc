from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Asset, SecurityEvent, Incident
from ..schemas import AssetResponse, SecurityEventResponse, IncidentResponse

router = APIRouter(prefix="/api/assets", tags=["assets"])

@router.get("", response_model=List[AssetResponse])
def get_assets(
    search: Optional[str] = Query(None, description="Search by asset name or ID"),
    sector: Optional[str] = Query(None, description="Filter by infrastructure sector"),
    status: Optional[str] = Query(None, description="Filter by operational status"),
    sort_by: Optional[str] = Query("risk_desc", description="Sort order: risk_desc, name_asc, id_asc"),
    db: Session = Depends(get_db)
):
    query = db.query(Asset)

    if search:
        s = f"%{search.lower()}%"
        query = query.filter((Asset.name.ilike(s)) | (Asset.id.ilike(s)) | (Asset.type.ilike(s)))

    if sector and sector.lower() != "all":
        query = query.filter(Asset.sector.ilike(f"%{sector}%"))

    if status and status.lower() != "all":
        query = query.filter(Asset.status == status)

    assets = query.all()

    # In-memory sort
    if sort_by == "risk_desc":
        assets.sort(key=lambda x: x.risk_score, reverse=True)
    elif sort_by == "name_asc":
        assets.sort(key=lambda x: x.name)
    elif sort_by == "id_asc":
        assets.sort(key=lambda x: x.id)

    res = []
    for a in assets:
        res.append(AssetResponse(
            id=a.id,
            name=a.name,
            sector=a.sector,
            type=a.type,
            status=a.status,
            criticality=a.criticality,
            risk_score=a.risk_score,
            ip_address=a.ip_address,
            location=a.location,
            last_seen=a.last_seen,
            connected_assets=a.connected_assets,
            metadata=a.metadata_dict
        ))
    return res

@router.get("/{asset_id}")
def get_asset_detail(asset_id: str, db: Session = Depends(get_db)):
    asset = db.query(Asset).filter(Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    # Fetch connected asset objects
    connected_objs = db.query(Asset).filter(Asset.id.in_(asset.connected_assets)).all()
    connected_list = [{"id": ca.id, "name": ca.name, "status": ca.status, "sector": ca.sector} for ca in connected_objs]

    # Fetch recent telemetry events for this asset
    recent_events = (
        db.query(SecurityEvent)
        .filter(SecurityEvent.asset_id == asset_id)
        .order_by(SecurityEvent.timestamp.desc())
        .limit(10)
        .all()
    )

    # Associated incidents
    incidents = (
        db.query(Incident)
        .filter(Incident.primary_asset_id == asset_id)
        .order_by(Incident.created_at.desc())
        .all()
    )

    return {
        "asset": AssetResponse(
            id=asset.id,
            name=asset.name,
            sector=asset.sector,
            type=asset.type,
            status=asset.status,
            criticality=asset.criticality,
            risk_score=asset.risk_score,
            ip_address=asset.ip_address,
            location=asset.location,
            last_seen=asset.last_seen,
            connected_assets=asset.connected_assets,
            metadata=asset.metadata_dict
        ),
        "connected_assets_details": connected_list,
        "recent_telemetry": [
            {
                "id": e.id,
                "timestamp": e.timestamp,
                "event_type": e.event_type,
                "severity": e.severity,
                "source": e.source,
                "destination": e.destination,
                "features": e.features,
                "detection_status": e.detection_status,
                "rule_triggered": e.rule_triggered
            }
            for e in recent_events
        ],
        "incidents": [
            {
                "id": inc.id,
                "title": inc.title,
                "severity": inc.severity,
                "status": inc.status,
                "risk_score": inc.risk_score,
                "created_at": inc.created_at
            }
            for inc in incidents
        ]
    }
