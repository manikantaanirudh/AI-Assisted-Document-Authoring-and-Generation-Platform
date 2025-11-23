from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.core.database import get_db
from app.api.v1.dependencies import get_current_user
from app.models.user import User
from app.services.llm_service import get_llm_service

router = APIRouter()

class SuggestOutlineRequest(BaseModel):
    topic: str
    doc_type: str  # "docx" or "pptx"
    num_items: Optional[int] = None

class SuggestOutlineResponse(BaseModel):
    items: List[str]
    message: str

@router.post("/suggest-outline", response_model=SuggestOutlineResponse)
async def suggest_outline(
    request: SuggestOutlineRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate AI-suggested outline (sections for Word) or slide titles (for PowerPoint)."""
    if request.doc_type not in ["docx", "pptx"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="doc_type must be 'docx' or 'pptx'"
        )
    
    try:
        # Build prompt
        llm_service = get_llm_service()
        prompt = llm_service.build_template_suggestion_prompt(
            topic=request.topic,
            doc_type=request.doc_type,
            num_items=request.num_items
        )
        
        # Generate suggestions
        response_text = await llm_service.generate_content(prompt)
        
        # Parse response (one item per line)
        items = [
            line.strip()
            for line in response_text.split('\n')
            if line.strip() and not line.strip().startswith('#')
        ]
        
        # Clean up items (remove numbering if present)
        cleaned_items = []
        for item in items:
            # Remove leading numbers, dashes, bullets
            cleaned = item.lstrip('0123456789.-* ').strip()
            if cleaned:
                cleaned_items.append(cleaned)
        
        if not cleaned_items:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to parse AI response"
            )
        
        return SuggestOutlineResponse(
            items=cleaned_items,
            message=f"Generated {len(cleaned_items)} suggestions"
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate suggestions: {str(e)}"
        )

