from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from utils.security import get_current_user
from services.company_service import company_service
from schemas.company import CompanyCreate, CompanyUpdate, CompanyResponse
from schemas.common import StandardResponse

router = APIRouter(prefix="/companies", tags=["Companies"])

@router.post("", response_model=StandardResponse[CompanyResponse])
def create_company(schema: CompanyCreate, current_user: dict = Depends(get_current_user)):
    uid = current_user["uid"]
    company = company_service.create_company(uid, schema)
    return StandardResponse(
        success=True,
        message="Company created successfully.",
        data=company
    )

@router.get("", response_model=StandardResponse[List[CompanyResponse]])
def list_companies(current_user: dict = Depends(get_current_user)):
    uid = current_user["uid"]
    companies = company_service.list_companies(uid)
    return StandardResponse(
        success=True,
        message="Companies loaded successfully.",
        data=companies
    )

@router.get("/{company_id}", response_model=StandardResponse[CompanyResponse])
def get_company(company_id: str, current_user: dict = Depends(get_current_user)):
    uid = current_user["uid"]
    company = company_service.get_company(company_id)
    if not company or company.get("uid") != uid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found."
        )
    return StandardResponse(
        success=True,
        message="Company details loaded.",
        data=company
    )

@router.put("/{company_id}", response_model=StandardResponse[CompanyResponse])
def update_company(company_id: str, schema: CompanyUpdate, current_user: dict = Depends(get_current_user)):
    uid = current_user["uid"]
    company = company_service.get_company(company_id)
    if not company or company.get("uid") != uid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found."
        )
    
    updated = company_service.update_company(company_id, schema)
    return StandardResponse(
        success=True,
        message="Company updated successfully.",
        data=updated
    )

@router.delete("/{company_id}", response_model=StandardResponse[dict])
def delete_company(company_id: str, current_user: dict = Depends(get_current_user)):
    uid = current_user["uid"]
    company = company_service.get_company(company_id)
    if not company or company.get("uid") != uid:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Company not found."
        )
    
    company_service.delete_company(company_id)
    return StandardResponse(
        success=True,
        message="Company deleted successfully.",
        data={"id": company_id}
    )
