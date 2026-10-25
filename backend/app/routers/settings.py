import os
from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from typing import Dict, Any
from ..database import get_db
from ..models import Setting, AuditEntry
from ..detection import detection_engine
from datetime import datetime

router = APIRouter(prefix="/api/settings", tags=["settings"])

@router.get("")
def get_settings(db: Session = Depends(get_db)):
    settings_records = db.query(Setting).all()
    settings_dict = {s.key: s.value for s in settings_records}

    # Status of AI engine
    has_gemini = bool(os.getenv("GEMINI_API_KEY"))
    has_openai = bool(os.getenv("OPENAI_API_KEY"))
    ai_status = "Gemini 1.5 Cloud Connected" if has_gemini else ("OpenAI Cloud Connected" if has_openai else "ARC High-Precision Rule & Telemetry Intelligence (Offline / Deterministic)")

    return {
        "thresholds": detection_engine.thresholds,
        "ai_engine_status": ai_status,
        "is_llm_configured": has_gemini or has_openai,
        "environment": "SIMULATION ENVIRONMENT — Critical Infrastructure Cybersecurity Sandbox",
        "settings": settings_dict
    }

@router.patch("")
def update_thresholds(payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    for key, val in payload.items():
        if key in detection_engine.thresholds:
            try:
                detection_engine.thresholds[key] = float(val) if "limit" not in key else int(val)
                # Persist in DB
                setting = db.query(Setting).filter(Setting.key == key).first()
                if setting:
                    setting.value = str(val)
                else:
                    db.add(Setting(key=key, value=str(val), description="Updated via Settings UI"))
            except ValueError:
                pass

    # Audit entry
    db.add(AuditEntry(
        id=f"AUD-{int(datetime.utcnow().timestamp()*1000)%100000:05d}",
        timestamp=datetime.utcnow().isoformat(),
        actor="Alex Mercer (Lead SOC Analyst)",
        action="settings_updated",
        entity_type="system",
        entity_id="DETECTION-THRESHOLDS",
        details="Security threshold parameters reconfigured in Settings.",
        outcome="info"
    ))

    db.commit()
    return {"message": "Settings updated successfully", "thresholds": detection_engine.thresholds}
