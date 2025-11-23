import logging
from typing import Optional
from app.core.config import settings
import google.generativeai as genai

logger = logging.getLogger(__name__)

class LLMService:
    """LLM service adapter supporting OpenAI and Gemini."""
    
    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()
        self.api_key = settings.LLM_API_KEY
        self._model = None
        self._client = None
    
    def _get_model(self):
        """Lazy initialization of Gemini model."""
        if self.provider == "gemini":
            if self._model is None:
                # Use Gemini-specific key if provided, otherwise fallback to LLM_API_KEY
                api_key = settings.GEMINI_API_KEY if settings.GEMINI_API_KEY else self.api_key
                genai.configure(api_key=api_key)
                # Use the correct model name - models/gemini-2.0-flash is confirmed working
                self._model = genai.GenerativeModel('models/gemini-2.0-flash')
                logger.info("Using Gemini model: models/gemini-2.0-flash")
            return self._model
        return None
    
    def _get_client(self):
        """Lazy initialization of OpenAI client."""
        if self.provider == "openai":
            if self._client is None:
                import openai
                api_key = settings.OPENAI_API_KEY if settings.OPENAI_API_KEY else self.api_key
                self._client = openai.OpenAI(api_key=api_key)
            return self._client
        return None
    
    async def generate_content(
        self,
        prompt: str,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None
    ) -> str:
        """Generate content using the configured LLM provider."""
        try:
            if self.provider == "gemini":
                model = self._get_model()
                response = model.generate_content(
                    prompt,
                    generation_config={
                        "temperature": temperature,
                        "max_output_tokens": max_tokens or 2048,
                    }
                )
                return response.text.strip()
            
            elif self.provider == "openai":
                client = self._get_client()
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=temperature,
                    max_tokens=max_tokens or 1000
                )
                return response.choices[0].message.content.strip()
            else:
                raise ValueError(f"Unsupported LLM provider: {self.provider}")
            
        except Exception as e:
            logger.error(f"LLM generation error: {str(e)}")
            raise Exception(f"Failed to generate content: {str(e)}")
    
    def build_generation_prompt(
        self,
        project_topic: str,
        section_title: str,
        section_type: str,
        previous_content: Optional[str] = None,
        neighboring_sections: Optional[list] = None
    ) -> str:
        """Build a context-aware prompt for section generation."""
        prompt_parts = []
        
        prompt_parts.append(f"Project Topic: {project_topic}\n")
        prompt_parts.append(f"Section/Slide Title: {section_title}\n")
        
        if neighboring_sections:
            prompt_parts.append("\nContext from other sections:")
            for neighbor in neighboring_sections[:3]:  # Limit to 3 neighbors
                prompt_parts.append(f"- {neighbor.get('title', '')}: {neighbor.get('content', '')[:200]}...")
        
        if section_type == "section":
            prompt_parts.append("\nTask: Generate well-structured content for this Word document section.")
            prompt_parts.append("Requirements:")
            prompt_parts.append("- Write 150-250 words of professional, informative content")
            prompt_parts.append("- Use clear paragraphs")
            prompt_parts.append("- Ensure content is relevant to the project topic and section title")
            prompt_parts.append("- Output plain text only (no markdown formatting)")
        else:  # slide
            prompt_parts.append("\nTask: Generate content for this PowerPoint slide.")
            prompt_parts.append("Requirements:")
            prompt_parts.append("- Write 3-5 bullet points or 2-3 short paragraphs")
            prompt_parts.append("- Keep content concise and suitable for presentation")
            prompt_parts.append("- Ensure content is relevant to the project topic and slide title")
            prompt_parts.append("- Output plain text only (no markdown formatting)")
        
        if previous_content:
            prompt_parts.append(f"\nPrevious content (for context):\n{previous_content[:300]}...")
        
        return "\n".join(prompt_parts)
    
    def build_refinement_prompt(
        self,
        current_content: str,
        refinement_instruction: str,
        section_type: str
    ) -> str:
        """Build a prompt for content refinement."""
        prompt_parts = []
        
        prompt_parts.append("Current Content:")
        prompt_parts.append(current_content)
        prompt_parts.append("\n")
        prompt_parts.append(f"Refinement Instruction: {refinement_instruction}")
        prompt_parts.append("\n")
        prompt_parts.append("Task: Refine the content according to the instruction above.")
        prompt_parts.append("Requirements:")
        prompt_parts.append("- Apply the refinement instruction precisely")
        prompt_parts.append("- Maintain relevance to the original content")
        prompt_parts.append("- Output only the refined content (plain text, no markdown)")
        
        if section_type == "slide":
            prompt_parts.append("- Keep content concise and suitable for presentation")
        
        return "\n".join(prompt_parts)
    
    def build_template_suggestion_prompt(
        self,
        topic: str,
        doc_type: str,
        num_items: Optional[int] = None
    ) -> str:
        """Build a prompt for AI-generated outline/slide template."""
        if doc_type == "docx":
            prompt = f"""Generate a document outline for a Word document on the topic: "{topic}"

Provide 5-7 section headers that would structure this document logically.
Return only a list of section titles, one per line, without numbering or bullets.
Each title should be concise (3-8 words) and descriptive."""
        else:  # pptx
            num_slides = num_items or 8
            prompt = f"""Generate slide titles for a PowerPoint presentation on the topic: "{topic}"

Provide {num_slides} slide titles that would structure this presentation logically.
Return only a list of slide titles, one per line, without numbering or bullets.
Each title should be concise (3-8 words) and suitable for a presentation slide."""
        
        return prompt

# Global instance (lazy initialization)
_llm_service_instance = None

def get_llm_service() -> LLMService:
    """Get or create LLM service instance."""
    global _llm_service_instance
    if _llm_service_instance is None:
        _llm_service_instance = LLMService()
    return _llm_service_instance

# For backward compatibility - use get_llm_service() function
llm_service = None  # Will be initialized on first use

