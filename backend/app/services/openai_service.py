import json
import logging
import httpx
from typing import Optional, Any, Dict

from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

def generate_ai_completion(
    system_prompt: str,
    user_prompt: str,
    model: str = "gemini-1.5-flash",
    response_format: Optional[Dict[str, str]] = None,
    temperature: float = 0.5
) -> Any:
    """
    Sovereign AI Wrapper: Uses Gemini via its OpenAI-compatible endpoint.
    Restores the Matchmaking & Swap engine functionality.
    """
    api_key = settings.google_api_key
    if not api_key:
        logger.error("GOOGLE_API_KEY not found in settings")
        raise ValueError("Missing GOOGLE_API_KEY")

    # Gemini OpenAI-compatible base URL
    base_url = "https://generativelanguage.googleapis.com/v1beta/openai"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": temperature,
        "max_tokens": 1024
    }

    if response_format and response_format.get("type") == "json_object":
        # Note: Some models require 'json' to be mentioned in the prompt if this is used,
        # but Gemini 1.5 usually handles it well.
        payload["response_format"] = response_format

    try:
        # We use a synchronous request here to match the signature expected by matchmaking_tasks.py
        with httpx.Client(timeout=30.0) as client:
            response = client.post(
                f"{base_url}/chat/completions",
                headers=headers,
                json=payload
            )
            
            if response.status_code != 200:
                logger.error(f"Gemini API error: {response.status_code} - {response.text}")
                raise Exception(f"AI Provider Error: {response.text}")

            result = response.json()
            content = result["choices"][0]["message"]["content"]

            if response_format and response_format.get("type") == "json_object":
                # Ensure we return a dict if JSON was requested
                try:
                    # Strip markdown block if model included them
                    clean_content = content.replace("```json", "").replace("```", "").strip()
                    return json.loads(clean_content)
                except json.JSONDecodeError:
                    logger.warning("Failed to parse AI response as JSON, returning raw string")
                    return content
            
            return content

    except Exception as e:
        logger.error(f"Error in generate_ai_completion: {e}")
        raise
