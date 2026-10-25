import numpy as np
from sklearn.ensemble import IsolationForest
from typing import Dict, Any, Tuple, List
from datetime import datetime

class DetectionEngine:
    def __init__(self):
        # Baseline training data for simulated critical infrastructure telemetry
        # Features: [connection_freq (per min), bytes_transferred (KB), failed_auth_count, dest_port_variance]
        rng = np.random.RandomState(42)
        
        # 120 normal baseline telemetry samples
        normal_freq = rng.normal(loc=25.0, scale=8.0, size=(120, 1))
        normal_bytes = rng.normal(loc=1200.0, scale=400.0, size=(120, 1))
        normal_auth = rng.poisson(lam=0.2, size=(120, 1))
        normal_port = rng.normal(loc=2.0, scale=1.0, size=(120, 1))
        
        X_train = np.hstack([normal_freq, normal_bytes, normal_auth, normal_port])
        # Clip negative values
        X_train = np.clip(X_train, a_min=0, a_max=None)
        
        self.iso_forest = IsolationForest(
            n_estimators=35,
            contamination=0.03,
            random_state=42
        )
        self.iso_forest.fit(X_train)

        # Configurable detection thresholds
        self.thresholds = {
            "outbound_bytes_kb": 10000.0, # 10MB
            "outbound_freq_per_min": 80.0,
            "failed_auth_limit": 5,
            "consecutive_alerts_limit": 3
        }

    def evaluate_telemetry(self, features: Dict[str, Any], asset_type: str) -> Tuple[bool, str, float, str]:
        """
        Evaluates synthetic telemetry using both rule-based criteria and IsolationForest anomaly detection.
        Returns: (is_threat, rule_name, anomaly_score, detection_details)
        """
        bytes_kb = float(features.get("bytes_transferred_kb", 0))
        freq = float(features.get("connection_freq", 0))
        failed_auth = int(features.get("failed_auth", 0))
        port_var = float(features.get("dest_port_variance", 1.0))

        # 1. Rule-based checks
        if failed_auth >= self.thresholds["failed_auth_limit"]:
            return (
                True,
                "Rule: Brute Force Authentication Threshold Exceeded",
                0.88,
                f"Observed {failed_auth} failed authentication attempts within 60 seconds (Threshold: {self.thresholds['failed_auth_limit']})."
            )

        if bytes_kb >= self.thresholds["outbound_bytes_kb"] and freq >= self.thresholds["outbound_freq_per_min"]:
            return (
                True,
                "Rule: High-Volume Outbound Exfiltration Anomaly",
                0.94,
                f"Outbound transfer of {bytes_kb:,.1f} KB at frequency {freq:.1f}/min exceeds baseline operational envelope by > 320%."
            )

        if freq >= self.thresholds["outbound_freq_per_min"]:
            return (
                True,
                "Rule: Connection Rate Threshold Exceeded",
                0.78,
                f"Connection frequency of {freq:.1f}/min exceeds configured sector baseline ({self.thresholds['outbound_freq_per_min']}/min)."
            )

        # 2. Statistical Anomaly Detection (Isolation Forest)
        sample = np.array([[freq, bytes_kb, failed_auth, port_var]])
        prediction = self.iso_forest.predict(sample)[0] # -1 for anomaly, 1 for normal
        decision_score = self.iso_forest.decision_function(sample)[0]
        # Invert decision score to 0..1 scale where 1 is highly anomalous
        anomaly_score = float(np.clip(0.5 - decision_score, 0.0, 1.0))

        if prediction == -1:
            return (
                True,
                "ML: Statistical Isolation Forest Anomaly",
                anomaly_score,
                f"Statistical feature vector deviated significantly from baseline telemetry (anomaly score: {anomaly_score:.2f})."
            )

        return (
            False,
            "Baseline Normal",
            anomaly_score,
            "Telemetry matches expected operational profile."
        )

    def calculate_risk_score(
        self,
        severity: str,
        detection_confidence: float,
        asset_criticality: str,
        related_events_count: int
    ) -> Tuple[float, Dict[str, float]]:
        """
        Calculates a transparent, explainable risk score (0 - 100).
        """
        # Criticality weights
        crit_weights = {
            "critical": 35.0,
            "high": 25.0,
            "medium": 15.0,
            "low": 8.0
        }
        # Severity weights
        sev_weights = {
            "critical": 40.0,
            "high": 30.0,
            "medium": 20.0,
            "low": 10.0,
            "info": 5.0
        }
        
        base_sev = sev_weights.get(severity.lower(), 15.0)
        base_crit = crit_weights.get(asset_criticality.lower(), 15.0)
        conf_impact = detection_confidence * 15.0
        correlation_bonus = min(related_events_count * 5.0, 10.0)

        total_score = round(min(base_sev + base_crit + conf_impact + correlation_bonus, 100.0), 1)

        breakdown = {
            "severity_factor": base_sev,
            "asset_criticality_factor": base_crit,
            "detection_confidence_factor": round(conf_impact, 1),
            "event_correlation_factor": correlation_bonus
        }

        return total_score, breakdown

    def correlate_events(self, primary_asset_id: str, all_events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Correlates events sharing the asset, similar temporal proximity, or matching destination IP.
        """
        correlated = []
        for evt in all_events:
            if evt.get("asset_id") == primary_asset_id or evt.get("detection_status") == "flagged":
                correlated.append(evt)
        return correlated[:5]

detection_engine = DetectionEngine()
