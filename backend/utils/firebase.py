import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from config.config import settings
from utils.logging import logger

db = None

def initialize_firebase():
    global db
    
    # 1. Check if Firebase has already been initialized:
    if firebase_admin._apps:
        if db is None and not settings.DEVELOPMENT_MOCK:
            try:
                db = firestore.client()
            except Exception as e:
                print(f"Error getting Firestore client: {e}", flush=True)
        return
        
    is_mock = settings.DEVELOPMENT_MOCK
    
    if is_mock:
        print("Using Service Account:\nFalse\n", flush=True)
        print("Using Mock Firestore:\nTrue\n", flush=True)
        
        import uuid
        
        class MockDocumentReference:
            def __init__(self, client, collection_name, doc_id=None):
                self.client = client
                self.collection_name = collection_name
                self.id = doc_id or str(uuid.uuid4())

            def set(self, data):
                if self.collection_name not in self.client._store:
                    self.client._store[self.collection_name] = {}
                self.client._store[self.collection_name][self.id] = dict(data)
                return self

            def update(self, data):
                if self.collection_name not in self.client._store:
                    self.client._store[self.collection_name] = {}
                if self.id not in self.client._store[self.collection_name]:
                    self.client._store[self.collection_name][self.id] = {}
                self.client._store[self.collection_name][self.id].update(data)
                return self

            def delete(self):
                if self.collection_name in self.client._store and self.id in self.client._store[self.collection_name]:
                    del self.client._store[self.collection_name][self.id]
                return self

            @property
            def reference(self):
                return self

            def get(self):
                class MockSnapshot:
                    def __init__(self, doc_ref, data):
                        self.reference = doc_ref
                        self.id = doc_ref.id
                        self.exists = data is not None
                        self._data = data
                    def to_dict(self):
                        return dict(self._data) if self._data else {}
                
                data = None
                if self.collection_name in self.client._store and self.id in self.client._store[self.collection_name]:
                    data = self.client._store[self.collection_name][self.id]
                return MockSnapshot(self, data)

        class MockQuery:
            def __init__(self, client, collection_name, filters=None):
                self.client = client
                self.collection_name = collection_name
                self.filters = filters or []

            def where(self, field, op, value):
                new_filters = list(self.filters)
                new_filters.append((field, op, value))
                return MockQuery(self.client, self.collection_name, new_filters)

            def limit(self, n):
                return self

            def order_by(self, *args, **kwargs):
                return self

            def document(self, doc_id=None):
                return MockDocumentReference(self.client, self.collection_name, doc_id)

            def stream(self):
                coll_data = self.client._store.get(self.collection_name, {})
                results = []
                for doc_id, data in coll_data.items():
                    match = True
                    for field, op, val in self.filters:
                        doc_val = data.get(field)
                        if op == "==":
                            if doc_val != val:
                                match = False
                                break
                        elif op == ">=":
                            if doc_val is None or doc_val < val:
                                match = False
                                break
                    if match:
                        doc_ref = MockDocumentReference(self.client, self.collection_name, doc_id)
                        results.append(doc_ref.get())
                return results

            def get(self):
                return self.stream()

        class MockBatch:
            def __init__(self, client):
                self.client = client
                self.operations = []

            def set(self, doc_ref, data):
                self.operations.append(("set", doc_ref, data))

            def delete(self, doc_ref):
                self.operations.append(("delete", doc_ref, None))

            def update(self, doc_ref, data):
                self.operations.append(("update", doc_ref, data))

            def commit(self):
                for op_type, doc_ref, data in self.operations:
                    if op_type == "set":
                        doc_ref.set(data)
                    elif op_type == "delete":
                        doc_ref.delete()
                    elif op_type == "update":
                        doc_ref.update(data)
                self.operations = []

        class MockFirestoreClient:
            def __init__(self):
                self._store = {}

            def collection(self, name):
                return MockQuery(self, name)

            def batch(self):
                return MockBatch(self)

        db = MockFirestoreClient()
        print("Firebase Admin SDK initialized successfully.\n", flush=True)
        print("Firestore connected successfully.\n", flush=True)
        return

    # Real mode validations & initialization
    cred_path = settings.GOOGLE_APPLICATION_CREDENTIALS
    
    if cred_path:
        # Resolve relative and absolute paths relative to backend directory
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        if not os.path.isabs(cred_path):
            service_account_path = os.path.abspath(os.path.join(base_dir, cred_path))
        else:
            service_account_path = os.path.abspath(cred_path)
            
        logger.info("Using Service Account: True")
        logger.info(f"GOOGLE_APPLICATION_CREDENTIALS: {service_account_path}")
        
        # Verify the service account file exists:
        if not os.path.exists(service_account_path):
            raise RuntimeError(
                f"Firebase service account not found: {service_account_path}"
            )
            
        # Validate the JSON before calling firebase_admin.initialize_app()
        try:
            with open(service_account_path, "r") as f:
                cred_json = json.load(f)
        except json.JSONDecodeError as jde:
            logger.error("✗ Invalid Firebase service account JSON.")
            raise ValueError(f"Configuration Error: Invalid JSON in service account key file: {str(jde)}")
            
        # Validate required fields
        required_keys = ["project_id", "private_key", "client_email"]
        for key in required_keys:
            if key not in cred_json or not cred_json[key]:
                raise ValueError(f"Configuration Error: Missing or empty required service account key: {key}")
                
        # Initialize
        try:
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred, {
                'storageBucket': settings.FIREBASE_STORAGE_BUCKET
            })
            logger.info("✓ Firebase credentials loaded from service account JSON.")
            logger.info("Firebase Admin SDK initialized successfully.")
        except Exception:
            logger.error("✗ Invalid Firebase credentials.")
            logger.exception("Firebase Admin SDK initialization failed")
            raise
    else:
        # Priority 2: Initialize with environment variables
        logger.info("Using Service Account: False (Environment Variables)")
        project_id = settings.FIREBASE_PROJECT_ID
        client_email = settings.FIREBASE_CLIENT_EMAIL
        private_key = settings.FIREBASE_PRIVATE_KEY
        
        if not project_id or not client_email or not private_key:
            raise ValueError("Configuration Error: Firebase environment variables are incomplete.")
            
        try:
            # Reconstruct the credentials structure
            cred_info = {
                "type": "service_account",
                "project_id": project_id,
                "private_key": private_key,
                "client_email": client_email,
                "token_uri": "https://oauth2.googleapis.com/token"
            }
            cred = credentials.Certificate(cred_info)
            firebase_admin.initialize_app(cred, {
                'storageBucket': settings.FIREBASE_STORAGE_BUCKET
            })
            logger.info("✓ Firebase credentials loaded from environment variables.")
            logger.info("Firebase Admin SDK initialized successfully.")
        except Exception:
            logger.error("✗ Invalid Firebase credentials.")
            logger.exception("Firebase Admin SDK initialization failed")
            raise

    # Verify real Firestore connection
    try:
        db = firestore.client()
        # Verify connectivity using a lightweight query. 
        # Querying an empty collection is handled gracefully (returns empty QuerySnapshot list, no exception).
        db.collection("users").limit(1).get()
        logger.info("Firestore connected successfully.")
    except Exception:
        logger.exception("Firestore connection verification failed")
        raise

def get_firestore():
    global db
    if db is None:
        initialize_firebase()
    return db
