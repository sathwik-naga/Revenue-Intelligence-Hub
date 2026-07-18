import time
from typing import Optional, Dict, Any
from utils.firebase import get_firestore
from datetime import datetime
from utils.logging import logger
from services.metrics_service import metrics_service

class AuditRepository:
    def __init__(self):
        self.collection_name = "audit_logs"

    def _get_collection(self):
        return get_firestore().collection(self.collection_name)

    def log_action(self, uid: str, action: str, details: str, ip: Optional[str] = None, correlation_id: Optional[str] = None) -> Dict[str, Any]:
        """Logs user activities directly to Firestore under audit_logs."""
        start_time = time.time()
        try:
            coll = self._get_collection()
            doc_ref = coll.document()
            doc_data = {
                "id": doc_ref.id,
                "uid": uid,
                "action": action,
                "details": details,
                "timestamp": datetime.utcnow().isoformat(),
                "ip": ip or "0.0.0.0",
                "correlationId": correlation_id or "N/A"
            }
            doc_ref.set(doc_data)
            metrics_service.record("firestore_duration", time.time() - start_time)
            logger.info(f"Audit Log Recorded: Action '{action}' by User {uid} [Correlation ID: {correlation_id}]")
            return doc_data
        except Exception as e:
            logger.error(f"Failed to record audit log for action '{action}' by User {uid}: {str(e)}")
            return {}

audit_repository = AuditRepository()
