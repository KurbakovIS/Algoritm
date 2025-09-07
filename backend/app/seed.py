from sqlalchemy.orm import Session
from .data_manager import DataManager


def seed(db: Session):
    """Инициализирует данные в базе используя DataManager"""
    data_manager = DataManager(db)
    data_manager.initialize_data()

