from openai import AsyncOpenAI
from fastapi import HTTPException
import logging
from app.config import settings
from sqlalchemy.orm import Session
from app.models import ModerationLogModel

logger = logging.getLogger(__name__)

# Initialize the OpenAI client for DeepSeek if API key is provided
deepseek_client = None
if settings.deepseek_api_key:
    deepseek_client = AsyncOpenAI(
        api_key=settings.deepseek_api_key,
        base_url="https://api.deepseek.com"
    )

class ModerationService:
    @staticmethod
    async def check_text_for_pii(db: Session, text: str, user_id: str, action: str) -> None:
        """
        Analyzes the text using DeepSeek to detect Personal Identifiable Information (PII)
        and other violations. Records the attempt in ModerationLogModel.
        
        Raises HTTPException 400 if PII or other violations are detected.
        """
        if not deepseek_client:
            logger.warning("DeepSeek API key not configured. Skipping text moderation.")
            return

        if not text or not text.strip():
            return

        prompt = f"""
        You are a strict text moderation system.
        Analyze the following text and determine if it contains ANY Personal Identifiable Information (PII), ANY indicators of a SERIOUS CRIME/malicious intent, OR ANY highly offensive, racist, or sexist content.
        
        1. PII includes:
        - Names/surnames (unless public businesses)
        - ID/social security numbers, phone numbers, exact addresses, or emails
        - Indirect references identifying a specific person
        
        2. Indicators of CRIME include ONLY serious infractions:
        - Information about empty houses or schedules when people are away (e.g., 'Casa libre los viernes', 'En el 4C libre sabados', 'Nadie de noche')
        - Voyeurism or severe privacy invasions (e.g., 'Vecina desnuda por la ventana')
        - Selling drugs or other illegal activities (e.g., 'El del 1B vende droga')

        3. Highly OFFENSIVE content includes:
        - Racist, xenophobic, or discriminatory remarks
        - Sexist comments or harassment
        - Severe profanity or hate speech

        Do NOT flag minor nuisances or neighborly complaints (e.g., playing piano at night, loud music, barking dogs) as CRIME or OFFENSIVE. These are SAFE.
        Only flag CRIME if there is clear evidence of a serious or illegal act.

        Text to analyze:
        "{text}"

        Respond ONLY with a single word:
        - "PII" if the text contains PII.
        - "CRIME" if the text contains indications of a serious crime.
        - "OFFENSIVE" if the text contains racist, sexist, or highly offensive content.
        - "SAFE" if the text is free of PII, serious crimes, and offensive content (minor complaints are SAFE).
        """

        try:
            response = await deepseek_client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {"role": "system", "content": "You are a strict text moderation AI."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=10,
                temperature=0.0
            )
            
            result = response.choices[0].message.content.strip().upper()
            
            # Record the attempt in the database
            final_result = "SAFE"
            if "PII" in result: final_result = "PII"
            elif "CRIME" in result: final_result = "CRIME"
            elif "OFFENSIVE" in result: final_result = "OFFENSIVE"
            elif "SAFE" not in result: final_result = "SUSPICIOUS"

            log = ModerationLogModel(user_id=user_id, action=action, result=final_result)
            db.add(log)
            db.commit()

            if final_result == "PII":
                logger.warning(f"PII detected in text: {text}")
                raise HTTPException(
                    status_code=400, 
                    detail="Text contains Personal Identifiable Information (PII) and cannot be saved."
                )
            elif final_result == "CRIME":
                logger.warning(f"Crime indicator detected in text: {text}")
                raise HTTPException(
                    status_code=400, 
                    detail="Warning: attempted crime comment. Cannot be saved."
                )
            elif final_result == "OFFENSIVE":
                logger.warning(f"Offensive content detected in text: {text}")
                raise HTTPException(
                    status_code=400, 
                    detail="Warning: offensive, racist, or sexist comment. Cannot be saved."
                )
            elif final_result == "SUSPICIOUS" and result not in ["NO", "NONE", ""]:
                logger.warning(f"Suspicious text detected (Fallback): {text} - Model result: {result}")
                raise HTTPException(
                    status_code=400, 
                    detail="Text violates moderation policies and cannot be saved."
                )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error calling DeepSeek API for moderation: {e}")
            
            # Log the error attempt as well
            try:
                log = ModerationLogModel(user_id=user_id, action=action, result="ERROR")
                db.add(log)
                db.commit()
            except:
                pass

            raise HTTPException(
                status_code=500,
                detail="Error validating text. Please try again later."
            )
