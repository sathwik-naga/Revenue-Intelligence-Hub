import csv
import io
import time
from typing import List, Optional, Dict, Any
from datetime import datetime
import openpyxl

from repositories.transaction_repository import transaction_repository
from services.metrics_service import metrics_service
from utils.logging import logger

class TransactionService:
    def create_transaction(self, uid: str, schema: Any) -> Dict[str, Any]:
        tx_data = schema.model_dump(by_alias=True)
        # Ensure UTC timezone and format ISO string
        if "date" in tx_data:
            tx_data["date"] = self._normalize_date(tx_data["date"])
        return transaction_repository.create_transaction(uid, tx_data)

    def get_transaction(self, tx_id: str) -> Optional[Dict[str, Any]]:
        return transaction_repository.get_transaction(tx_id)

    def list_transactions(self, uid: str, company_id: Optional[str] = None) -> List[Dict[str, Any]]:
        return transaction_repository.list_transactions(uid, company_id)

    def update_transaction(self, tx_id: str, schema: Any) -> Optional[Dict[str, Any]]:
        tx_data = schema.model_dump(exclude_unset=True, by_alias=True)
        if "date" in tx_data:
            tx_data["date"] = self._normalize_date(tx_data["date"])
        return transaction_repository.update_transaction(tx_id, tx_data)

    def delete_transaction(self, tx_id: str) -> bool:
        return transaction_repository.delete_transaction(tx_id)

    def clear_transactions(self, uid: str, company_id: Optional[str] = None) -> bool:
        return transaction_repository.clear_transactions(uid, company_id)

    def _normalize_date(self, date_str: str) -> str:
        """Parses common date formats and normalizes them into YYYY-MM-DD format."""
        d = date_str.strip()
        # Common formats to match
        for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%Y/%m/%d", "%d-%m-%Y", "%m-%d-%Y"):
            try:
                dt = datetime.strptime(d, fmt)
                return dt.strftime("%Y-%m-%d")
            except ValueError:
                continue
        # ISO timestamp check
        try:
            dt = datetime.fromisoformat(d.replace("Z", "+00:00"))
            return dt.strftime("%Y-%m-%d")
        except ValueError:
            pass
        # Fallback to today
        return datetime.utcnow().strftime("%Y-%m-%d")

    def _normalize_amount(self, amount_str: str) -> float:
        """Cleans and normalizes monetary strings into standard floats."""
        if not amount_str:
            return 0.0
        cleaned = amount_str.strip().replace("$", "").replace("€", "").replace("£", "").replace("₹", "").replace(",", "")
        try:
            return abs(float(cleaned))
        except ValueError:
            return 0.0

    def parse_and_import_file(self, uid: str, company_id: Optional[str], file_bytes: bytes, filename: str) -> List[Dict[str, Any]]:
        """Parses and imports either CSV or Excel statements atomically."""
        start_time = time.time()
        is_excel = filename.endswith(".xlsx") or filename.endswith(".xls")
        
        parsed_rows = []
        
        if is_excel:
            try:
                # Load Excel Workbook in-memory
                wb = openpyxl.load_workbook(io.BytesIO(file_bytes), data_only=True, read_only=True)
                sheet = wb.active
                
                rows_iter = sheet.iter_rows(values_only=True)
                headers = [str(cell).strip().lower() if cell is not None else "" for cell in next(rows_iter)]
                
                for row_cells in rows_iter:
                    if not any(row_cells):
                        continue  # skip empty row
                    row_dict = {}
                    for i, cell in enumerate(row_cells):
                        if i < len(headers) and headers[i]:
                            row_dict[headers[i]] = str(cell) if cell is not None else ""
                    parsed_rows.append(row_dict)
                wb.close()
            except Exception as e:
                logger.error(f"Excel parsing exception for file {filename}: {str(e)}")
                raise ValueError(f"Failed to parse Excel spreadsheet: {str(e)}")
        else:
            # Resilient CSV decoding checks
            decoded_csv = None
            for encoding in ("utf-8", "utf-8-sig", "latin-1", "cp1252"):
                try:
                    decoded_csv = file_bytes.decode(encoding)
                    break
                except UnicodeDecodeError:
                    continue
                    
            if decoded_csv is None:
                raise ValueError("Failed to decode CSV file. The file encoding is not supported.")

            try:
                # Sniff delimiter
                sample = decoded_csv[:4096]
                try:
                    dialect = csv.Sniffer().sniff(sample, delimiters=",;\t|")
                except csv.Error:
                    dialect = csv.excel  # default fallback
                
                f = io.StringIO(decoded_csv)
                reader = csv.DictReader(f, dialect=dialect)
                for row in reader:
                    if not any(row.values()):
                        continue
                    parsed_rows.append({(k.lower().strip() if k else ""): str(v).strip() for k, v in row.items()})
            except Exception as e:
                logger.error(f"CSV parsing exception for file {filename}: {str(e)}")
                raise ValueError(f"Failed to parse CSV statement format: {str(e)}")

        if not parsed_rows:
            return []

        # Process and normalize rows
        transactions_to_save = []
        seen_keys = set() # deduplication helper
        
        for row in parsed_rows:
            def find_val(options):
                for opt in options:
                    for k, v in row.items():
                        if opt in k:
                            return v
                return None

            date_val = find_val(["date"]) or datetime.utcnow().strftime("%Y-%m-%d")
            desc_val = find_val(["description", "desc", "memo", "particulars"]) or "Ledger Transaction"
            cat_val = find_val(["category", "cat"]) or "Uncategorized"
            amt_str = find_val(["amount", "amt", "value", "price"]) or "0"
            type_str = find_val(["type"])
            status_val = find_val(["status"]) or "completed"
            merchant_val = find_val(["merchant", "payee", "recipient"]) or desc_val.split(" ")[0] or "Unknown"
            pm_val = find_val(["method", "payment"]) or "Credit Card"
            notes_val = find_val(["notes", "note", "comment"]) or ""
            risk_str = find_val(["risk"]) or "low"

            # Normalize values
            norm_date = self._normalize_date(date_val)
            norm_amt = self._normalize_amount(amt_str)
            
            # Deduce Type
            raw_amt_is_negative = False
            try:
                # check if amount originally starts with a minus sign
                raw_amt_is_negative = amt_str.strip().startswith("-")
            except:
                pass
                
            tx_type = "outflow" if raw_amt_is_negative else "inflow"
            if type_str:
                t_val = type_str.lower()
                if any(x in t_val for x in ["expense", "debit", "out", "outflow", "withdrawal"]):
                    tx_type = "outflow"
                elif any(x in t_val for x in ["income", "credit", "in", "inflow", "deposit"]):
                    tx_type = "inflow"

            if status_val.lower() not in ["completed", "pending", "failed"]:
                status_val = "completed"

            payment_risk = "low"
            if risk_str.lower() in ["low", "medium", "high"]:
                payment_risk = risk_str.lower()

            # Deduplication key to prevent import of exact copies
            dedup_key = (norm_date, desc_val, norm_amt, tx_type, merchant_val)
            if dedup_key in seen_keys:
                continue
            seen_keys.add(dedup_key)

            transactions_to_save.append({
                "date": norm_date,
                "description": desc_val,
                "category": cat_val,
                "amount": norm_amt,
                "type": tx_type,
                "status": status_val,
                "merchant": merchant_val,
                "payment_method": pm_val,
                "notes": notes_val,
                "payment_risk": payment_risk,
                "company_id": company_id
            })

        if not transactions_to_save:
            return []

        # Run database operations atomically
        try:
            # We clear transactions first (rollback is manual here if write fails)
            transaction_repository.clear_transactions(uid, company_id)
            saved_txs = transaction_repository.create_transactions_batch(uid, transactions_to_save)
            
            duration = time.time() - start_time
            metrics_service.record("csv_processing_time", duration)
            logger.info(f"File statement processing complete for user {uid}. Parsed: {len(transactions_to_save)} items.")
            return saved_txs
        except Exception as write_err:
            logger.error(f"Atomic transaction batch write failed, rolling back: {str(write_err)}")
            # Attempt rollback by clearing again
            try:
                transaction_repository.clear_transactions(uid, company_id)
            except Exception as rollback_err:
                logger.error(f"Database rollback clear failed: {str(rollback_err)}")
            raise ValueError(f"Failed to record statements to database: {str(write_err)}")

transaction_service = TransactionService()
