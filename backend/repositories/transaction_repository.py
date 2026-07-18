import time
from typing import List, Optional, Dict, Any
from utils.firebase import get_firestore
from services.metrics_service import metrics_service

class TransactionRepository:
    def __init__(self):
        self.collection_name = "transactions"

    def _get_collection(self):
        return get_firestore().collection(self.collection_name)

    def create_transaction(self, uid: str, transaction_data: Dict[str, Any]) -> Dict[str, Any]:
        coll = self._get_collection()
        doc_ref = coll.document()
        tx_id = doc_ref.id
        
        doc_data = {
            **transaction_data,
            "id": tx_id,
            "uid": uid
        }
        doc_ref.set(doc_data)
        return doc_data

    def create_transactions_batch(self, uid: str, list_of_txs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        start_time = time.time()
        db_client = get_firestore()
        batch = db_client.batch()
        coll = self._get_collection()
        
        saved_txs = []
        count = 0
        for tx in list_of_txs:
            doc_ref = coll.document()
            tx_id = doc_ref.id
            doc_data = {
                **tx,
                "id": tx_id,
                "uid": uid
            }
            batch.set(doc_ref, doc_data)
            saved_txs.append(doc_data)
            
            count += 1
            if count >= 400:
                batch.commit()
                batch = db_client.batch()
                count = 0
                
        if count > 0:
            batch.commit()
            
        metrics_service.record("firestore_duration", time.time() - start_time)
        return saved_txs

    def get_transaction(self, tx_id: str) -> Optional[Dict[str, Any]]:
        doc = self._get_collection().document(tx_id).get()
        if doc.exists:
            return doc.to_dict()
        return None

    def list_transactions(self, uid: str, company_id: Optional[str] = None) -> List[Dict[str, Any]]:
        query = self._get_collection().where("uid", "==", uid)
        if company_id:
            query = query.where("company_id", "==", company_id)
        docs = query.stream()
        return [doc.to_dict() for doc in docs]

    def update_transaction(self, tx_id: str, transaction_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        doc_ref = self._get_collection().document(tx_id)
        doc = doc_ref.get()
        if not doc.exists:
            return None
            
        doc_ref.update(transaction_data)
        return doc_ref.get().to_dict()

    def delete_transaction(self, tx_id: str) -> bool:
        doc_ref = self._get_collection().document(tx_id)
        doc = doc_ref.get()
        if not doc.exists:
            return False
            
        doc_ref.delete()
        return True

    def clear_transactions(self, uid: str, company_id: Optional[str] = None) -> bool:
        # Delete all transactions associated with a user/company (used during upload/re-run)
        query = self._get_collection().where("uid", "==", uid)
        if company_id:
            query = query.where("company_id", "==", company_id)
            
        docs = query.stream()
        db_client = get_firestore()
        batch = db_client.batch()
        
        count = 0
        for doc in docs:
            batch.delete(doc.reference)
            count += 1
            if count >= 400: # Firestore batch size limit is 500
                batch.commit()
                batch = db_client.batch()
                count = 0
        if count > 0:
            batch.commit()
        return True

transaction_repository = TransactionRepository()
