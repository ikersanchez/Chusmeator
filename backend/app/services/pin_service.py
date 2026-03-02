from sqlalchemy.orm import Session
from app.models import PinModel
from app import schemas

class PinService:
    @staticmethod
    def create_pin(db: Session, pin_data: schemas.PinCreate, user_id: str) -> PinModel:
        db_pin = PinModel(
            lat=pin_data.lat,
            lng=pin_data.lng,
            text=pin_data.text,
            color=pin_data.color.value if hasattr(pin_data.color, 'value') else pin_data.color,
            user_id=user_id
        )
        db.add(db_pin)
        db.commit()
        db.refresh(db_pin)
        return db_pin

    @staticmethod
    def get_all_pins(db: Session) -> list[PinModel]:
        return db.query(PinModel).all()

    @staticmethod
    def delete_pin(db: Session, pin_id: int, user_id: str) -> bool:
        pin = db.query(PinModel).filter(PinModel.id == pin_id).first()
        if not pin:
            return False
        if pin.user_id != user_id:
            from fastapi import HTTPException
            raise HTTPException(status_code=403, detail="Unauthorized: You can only delete your own pins")
        
        db.delete(pin)
        db.commit()
        return True
