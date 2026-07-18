from typing import List, Optional, Dict, Any
from utils.firebase import get_firestore
from datetime import datetime

class AnalysisRepository:
    def __init__(self):
        self.analysis_collection = "analysis"
        self.chat_collection = "chat_history"

    def save_analysis(self, uid: str, company_id: Optional[str], analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        coll = get_firestore().collection(self.analysis_collection)
        doc_ref = coll.document()
        doc_data = {
            **analysis_data,
            "id": doc_ref.id,
            "uid": uid,
            "company_id": company_id,
            "timestamp": datetime.utcnow().isoformat()
        }
        doc_ref.set(doc_data)
        return doc_data

    def get_latest_analysis(self, uid: str, company_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        query = get_firestore().collection(self.analysis_collection).where("uid", "==", uid)
        if company_id:
            query = query.where("company_id", "==", company_id)

        docs = query.stream()
        results = [doc.to_dict() for doc in docs]
        if not results:
            return None

        usable_results = [
            item for item in results
            if item.get("error") is None
            and item.get("confidenceScore", 0) > 0
            and isinstance(item.get("analysis", {}), dict)
        ]
        if not usable_results:
            return None

        usable_results = sorted(usable_results, key=lambda x: x.get("timestamp", ""), reverse=True)
        return usable_results[0]

    def save_chat_message(self, uid: str, company_id: Optional[str], question: str, answer: str) -> Dict[str, Any]:
        coll = get_firestore().collection(self.chat_collection)
        doc_ref = coll.document()
        doc_data = {
            "id": doc_ref.id,
            "uid": uid,
            "company_id": company_id,
            "question": question,
            "answer": answer,
            "timestamp": datetime.utcnow().isoformat()
        }
        doc_ref.set(doc_data)
        return doc_data

    def list_chat_history(self, uid: str, company_id: Optional[str] = None) -> List[Dict[str, Any]]:
        query = get_firestore().collection(self.chat_collection).where("uid", "==", uid)
        if company_id:
            query = query.where("company_id", "==", company_id)
            
        docs = query.stream()
        results = [doc.to_dict() for doc in docs]
        # Sort in memory by timestamp ascending
        return sorted(results, key=lambda x: x.get("timestamp", ""))

analysis_repository = AnalysisRepository()
