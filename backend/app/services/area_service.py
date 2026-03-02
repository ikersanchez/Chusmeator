from sqlalchemy.orm import Session
from app.models import AreaModel
from app import schemas

class AreaService:
    @staticmethod
    def create_area(db: Session, area_data: schemas.AreaCreate, user_id: str) -> AreaModel:
        db_area = AreaModel(
            latlngs=area_data.latlngs,
            color=area_data.color.value if hasattr(area_data.color, 'value') else area_data.color,
            text=area_data.text,
            font_size=area_data.font_size,
            user_id=user_id
        )
        db.add(db_area)
        db.commit()
        db.refresh(db_area)
        return db_area

    @staticmethod
    def get_all_areas(db: Session) -> list[AreaModel]:
        return db.query(AreaModel).all()

    @staticmethod
    def delete_area(db: Session, area_id: int, user_id: str) -> bool:
        area = db.query(AreaModel).filter(AreaModel.id == area_id).first()
        if not area:
            return False
        if area.user_id != user_id:
            from fastapi import HTTPException
            raise HTTPException(status_code=403, detail="Unauthorized: You can only delete your own areas")
        
        db.delete(area)
        db.commit()
        return True
