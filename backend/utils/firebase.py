import os
import json
import firebase_admin
from firebase_admin import credentials, firestore
from config.config import settings
from utils.logging import logger

db = None


def initialize_firebase():
    global db

    if firebase_admin._apps:
        if db is None and not settings.DEVELOPMENT_MOCK:
            try:
                db = firestore.client()
            except Exception as exc:
                logger.exception("Error getting Firestore client: %s", exc)
        return

    is_mock = settings.DEVELOPMENT_MOCK

    if is_mock:
        logger.info("Using Service Account: False")
        logger.info("Using Mock Firestore: True")

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
        logger.info("Firebase Admin SDK initialized successfully (mock mode).")
        logger.info("Firestore connected successfully (mock mode).")
        return

    cred_path = settings.GOOGLE_APPLICATION_CREDENTIALS

    if cred_path:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        if not os.path.isabs(cred_path):
            service_account_path = os.path.abspath(os.path.join(base_dir, cred_path))
        else:
            service_account_path = os.path.abspath(cred_path)

        logger.info("Using Service Account: True")
        logger.info("GOOGLE_APPLICATION_CREDENTIALS: %s", service_account_path)

        if not os.path.exists(service_account_path):
            raise RuntimeError(f"Firebase service account not found: {service_account_path}")

        try:
            with open(service_account_path, "r", encoding="utf-8") as handle:
                cred_json = json.load(handle)
        except json.JSONDecodeError as jde:
            logger.error("Invalid Firebase service account JSON.")
            raise ValueError(f"Configuration Error: Invalid JSON in service account key file: {str(jde)}") from jde

        required_keys = ["project_id", "private_key", "client_email"]
        missing_keys = [key for key in required_keys if not cred_json.get(key)]
        if missing_keys:
            logger.error("Missing required Firebase service account fields: %s", ", ".join(missing_keys))
            raise ValueError("Configuration Error: Missing or empty required service account key fields.")

        try:
            cred = credentials.Certificate(service_account_path)
            if not firebase_admin._apps:
                firebase_admin.initialize_app(cred, {"storageBucket": settings.FIREBASE_STORAGE_BUCKET})
            logger.info("✓ Firebase credentials loaded from service account JSON.")
            logger.info("Firebase Admin SDK initialized successfully.")
        except Exception:
            logger.error("Invalid Firebase credentials for service account file.")
            logger.exception("Firebase Admin SDK initialization failed")
            raise
    else:
        logger.info("Using Service Account: False (Environment Variables)")

        project_id = (settings.FIREBASE_PROJECT_ID or "").strip()
        client_email = (settings.FIREBASE_CLIENT_EMAIL or "").strip()
        private_key = (settings.FIREBASE_PRIVATE_KEY or "").strip()

        missing_env = []
        if not project_id:
            missing_env.append("FIREBASE_PROJECT_ID")
        if not client_email:
            missing_env.append("FIREBASE_CLIENT_EMAIL")
        if not private_key:
            missing_env.append("FIREBASE_PRIVATE_KEY")

        if missing_env:
            logger.error("Missing required Firebase environment variables: %s", ", ".join(missing_env))
            raise ValueError("Configuration Error: Firebase environment variables are incomplete.")

        private_key = private_key.replace("\\n", "\n")

        try:
            cred_info = {
                "type": "service_account",
                "project_id": project_id,
                "private_key": private_key,
                "client_email": client_email,
                "token_uri": "https://oauth2.googleapis.com/token",
            }
            cred = credentials.Certificate(cred_info)
            if not firebase_admin._apps:
                firebase_admin.initialize_app(cred, {"storageBucket": settings.FIREBASE_STORAGE_BUCKET})
            logger.info("✓ Firebase credentials loaded from environment variables.")
            logger.info("Firebase Admin SDK initialized successfully.")
        except Exception:
            logger.error("Invalid Firebase credentials from environment variables.")
            logger.exception("Firebase Admin SDK initialization failed")
            raise

    try:
        db = firestore.client()
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
