from typing import List, Optional, Dict, Any
from utils.firebase import get_firestore

class CompanyRepository:
    def __init__(self):
        self.collection_name = "companies"

    def _get_collection(self):
        return get_firestore().collection(self.collection_name)

    def create_company(self, uid: str, company_data: Dict[str, Any]) -> Dict[str, Any]:
        coll = self._get_collection()
        doc_ref = coll.document()
        company_id = doc_ref.id
        
        doc_data = {
            **company_data,
            "id": company_id,
            "uid": uid
        }
        doc_ref.set(doc_data)
        return doc_data

    def get_company(self, company_id: str) -> Optional[Dict[str, Any]]:
        doc = self._get_collection().document(company_id).get()
        if doc.exists:
            return doc.to_dict()
        return None

    def list_companies(self, uid: str) -> List[Dict[str, Any]]:
        docs = self._get_collection().where("uid", "==", uid).stream()
        return [doc.to_dict() for doc in docs]

    def update_company(self, company_id: str, company_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        doc_ref = self._get_collection().document(company_id)
        doc = doc_ref.get()
        if not doc.exists:
            return None
            
        doc_ref.update(company_data)
        return doc_ref.get().to_dict()

    def delete_company(self, company_id: str) -> bool:
        doc_ref = self._get_collection().document(company_id)
        doc = doc_ref.get()
        if not doc.exists:
            return False
            
        doc_ref.delete()
        return True

company_repository = CompanyRepository()
