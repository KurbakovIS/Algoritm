from sqlalchemy import Column, Integer, String, ForeignKey, Text, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from .db import Base


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
    parent_id = Column(Integer, ForeignKey("roadmap_nodes.id"), nullable=True)
    checkpoint = Column(Boolean, default=False)

    parent = relationship("RoadmapNode", remote_side=[id])
    progresses = relationship("Progress", back_populates="node", cascade="all, delete-orphan")


class Progress(Base):
    __tablename__ = "progress"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    node_id = Column(Integer, ForeignKey("roadmap_nodes.id"), primary_key=True)
    status = Column(String(20), default="not_started")  # not_started, in_progress, completed
    score = Column(Integer, default=0)

    user = relationship("User", back_populates="progress")
    node = relationship("RoadmapNode", back_populates="progresses")

    __table_args__ = (UniqueConstraint("user_id", "node_id", name="uq_progress_user_node"),)

