from typing import List, Optional, Dict, Any
from repositories.company_repository import company_repository
from schemas.company import CompanyCreate, CompanyUpdate

class CompanyService:
    def create_company(self, uid: str, schema: CompanyCreate) -> Dict[str, Any]:
        company_data = schema.model_dump(by_alias=True)
        return company_repository.create_company(uid, company_data)

    def get_company(self, company_id: str) -> Optional[Dict[str, Any]]:
        return company_repository.get_company(company_id)

    def list_companies(self, uid: str) -> List[Dict[str, Any]]:
        return company_repository.list_companies(uid)

    def update_company(self, company_id: str, schema: CompanyUpdate) -> Optional[Dict[str, Any]]:
        company_data = schema.model_dump(exclude_unset=True, by_alias=True)
        return company_repository.update_company(company_id, company_data)

    def delete_company(self, company_id: str) -> bool:
        return company_repository.delete_company(company_id)

company_service = CompanyService()
