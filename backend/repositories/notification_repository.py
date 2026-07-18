from typing import List, Dict, Any
from utils.firebase import get_firestore
from datetime import datetime

class NotificationRepository:
    def __init__(self):
        self.collection_name = "notifications"

    def _get_collection(self):
        return get_firestore().collection(self.collection_name)

    def create_notification(self, uid: str, title: str, description: str, type: str) -> Dict[str, Any]:
        coll = self._get_collection()
        doc_ref = coll.document()
        doc_data = {
            "id": doc_ref.id,
            "uid": uid,
            "title": title,
            "description": description,
            "type": type,
            "timestamp": datetime.utcnow().isoformat(),
            "read": False
        }
        doc_ref.set(doc_data)
        return doc_data

    def list_notifications(self, uid: str) -> List[Dict[str, Any]]:
        docs = self._get_collection().where("uid", "==", uid).stream()
        results = [doc.to_dict() for doc in docs]
        # Sort in memory by timestamp descending
        return sorted(results, key=lambda x: x.get("timestamp", ""), reverse=True)

    def mark_all_read(self, uid: str) -> bool:
        docs = self._get_collection().where("uid", "==", uid).where("read", "==", False).stream()
        db_client = get_firestore()
        batch = db_client.batch()
        count = 0
        for doc in docs:
            batch.update(doc.reference, {"read": True})
            count += 1
            if count >= 400:
                batch.commit()
                batch = db_client.batch()
                count = 0
        if count > 0:
            batch.commit()
        return True

notification_repository = NotificationRepository()
