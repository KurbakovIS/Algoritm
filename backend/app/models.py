from sqlalchemy import Column, Integer, String, ForeignKey, Text, Boolean, UniqueConstraint, Table, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .db import Base


# Association Table for many-to-many relationship between RoadmapNodes
roadmap_node_links = Table(
    'roadmap_node_links',
    Base.metadata,
    Column('source_id', Integer, ForeignKey('roadmap_nodes.id'), primary_key=True),
    Column('target_id', Integer, ForeignKey('roadmap_nodes.id'), primary_key=True)
)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="intern", nullable=False)
    xp = Column(Integer, default=0, nullable=False)
    badges = Column(Text, default="[]", nullable=False)  # JSON string for MVP

    progress = relationship("Progress", back_populates="user", cascade="all, delete-orphan")


class RoadmapNode(Base):
    __tablename__ = "roadmap_nodes"
    id = Column(Integer, primary_key=True, index=True)
    direction = Column(String(50), index=True, nullable=False)  # backend, frontend, devops, etc.
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    resources = Column(Text, default="[]")  # JSON string
    checkpoint = Column(Boolean, default=False)
    
    # Новые поля для админки
    node_type = Column(String(20), default="task", nullable=False)  # parent, task, optional
    is_required = Column(Boolean, default=True, nullable=False)     # обязательный/необязательный
    order_index = Column(Integer, default=0, nullable=False)        # порядок отображения
    is_active = Column(Boolean, default=True, nullable=False)       # активность узла

    # Many-to-many relationship to self
    children = relationship(
        "RoadmapNode",
        secondary=roadmap_node_links,
        primaryjoin=id == roadmap_node_links.c.source_id,
        secondaryjoin=id == roadmap_node_links.c.target_id,
        backref="parents"
    )

    progresses = relationship("Progress", back_populates="node", cascade="all, delete-orphan")
    
    # Новые связи для блокировок
    blocked_by = relationship("NodeBlock", foreign_keys="NodeBlock.blocked_node_id", back_populates="blocked_node")
    blocks = relationship("NodeBlock", foreign_keys="NodeBlock.blocking_node_id", back_populates="blocking_node")


class Profession(Base):
    __tablename__ = "professions"
    id = Column(String(50), primary_key=True, index=True)  # backend, frontend, etc.
    title = Column(String(255), nullable=False)
    level = Column(Integer, nullable=False)
    accent = Column(String(7), nullable=False)  # hex color
    subtitle = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)


class NodeBlock(Base):
    __tablename__ = "node_blocks"
    id = Column(Integer, primary_key=True, index=True)
    blocking_node_id = Column(Integer, ForeignKey("roadmap_nodes.id"), nullable=False)
    blocked_node_id = Column(Integer, ForeignKey("roadmap_nodes.id"), nullable=False)
    block_type = Column(String(20), default="required", nullable=False)  # required, optional
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Связи с узлами
    blocking_node = relationship("RoadmapNode", foreign_keys=[blocking_node_id], back_populates="blocks")
    blocked_node = relationship("RoadmapNode", foreign_keys=[blocked_node_id], back_populates="blocked_by")


class Progress(Base):
    __tablename__ = "progress"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    node_id = Column(Integer, ForeignKey("roadmap_nodes.id"), primary_key=True)
    status = Column(String(20), default="not_started")  # not_started, in_progress, completed
    score = Column(Integer, default=0)

    user = relationship("User", back_populates="progress")
    node = relationship("RoadmapNode", back_populates="progresses")

    __table_args__ = (UniqueConstraint("user_id", "node_id", name="uq_progress_user_node"),)
