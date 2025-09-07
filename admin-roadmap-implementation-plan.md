# План реализации админки роадмапа

## 🎯 Цели проекта
Создать удобную админку для управления структурой роадмапа с возможностью:
- Добавления родительских узлов (направления)
- Создания дочерних задач
- Добавления дополнительных необязательных узлов
- Управления блокировками и зависимостями

## 📊 Анализ текущего состояния

### Существующая структура данных
```sql
-- Текущая модель RoadmapNode
CREATE TABLE roadmap_nodes (
    id INTEGER PRIMARY KEY,
    direction VARCHAR(50),  -- frontend, backend, devops, career
    title VARCHAR(255),
    description TEXT,
    resources TEXT,         -- JSON string
    checkpoint BOOLEAN
);

-- Связи между узлами
CREATE TABLE roadmap_node_links (
    source_id INTEGER,      -- родительский узел
    target_id INTEGER       -- дочерний узел
);
```

### Текущие API endpoints
- `GET /roadmap/` - все узлы
- `GET /roadmap/directions` - направления
- `GET /roadmap/directions/{direction}` - узлы по направлению
- `GET /roadmap/node/{id}` - конкретный узел
- `POST /roadmap/` - создание узла

## 🏗️ Архитектура решения

### Уровень сложности: Level 3
**Обоснование:** Требуется создание полноценной админки с CRUD операциями, управлением связями, валидацией данных и сложной логикой блокировок.

### Компоненты системы

#### 1. Backend расширения
- **Новые модели данных** для блокировок и зависимостей
- **CRUD операции** для админки
- **Валидация** связей и зависимостей
- **API endpoints** для админки

#### 2. Frontend админка
- **Список узлов** с фильтрацией и поиском
- **Формы создания/редактирования** узлов
- **Визуальный редактор** связей
- **Управление блокировками**

#### 3. Система блокировок
- **Условные зависимости** между узлами
- **Проверка доступности** узлов
- **Визуальная индикация** заблокированных узлов

## 📋 Детальный план реализации

### Этап 1: Расширение моделей данных (2-3 часа)

#### 1.1 Обновление модели RoadmapNode
```python
class RoadmapNode(Base):
    __tablename__ = "roadmap_nodes"
    id = Column(Integer, primary_key=True, index=True)
    direction = Column(String(50), index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    resources = Column(Text, default="[]")
    checkpoint = Column(Boolean, default=False)
    
    # Новые поля для админки
    node_type = Column(String(20), default="task")  # parent, task, optional
    is_required = Column(Boolean, default=True)     # обязательный/необязательный
    order_index = Column(Integer, default=0)        # порядок отображения
    is_active = Column(Boolean, default=True)       # активность узла
    
    # Связи
    children = relationship("RoadmapNode", ...)
    progresses = relationship("Progress", ...)
    
    # Новые связи для блокировок
    blocked_by = relationship("NodeBlock", foreign_keys="NodeBlock.blocked_node_id")
    blocks = relationship("NodeBlock", foreign_keys="NodeBlock.blocking_node_id")
```

#### 1.2 Новая модель для блокировок
```python
class NodeBlock(Base):
    __tablename__ = "node_blocks"
    id = Column(Integer, primary_key=True, index=True)
    blocking_node_id = Column(Integer, ForeignKey("roadmap_nodes.id"))
    blocked_node_id = Column(Integer, ForeignKey("roadmap_nodes.id"))
    block_type = Column(String(20), default="required")  # required, optional
    created_at = Column(DateTime, default=datetime.utcnow)
    
    blocking_node = relationship("RoadmapNode", foreign_keys=[blocking_node_id])
    blocked_node = relationship("RoadmapNode", foreign_keys=[blocked_node_id])
```

### Этап 2: Расширение схем данных (1-2 часа)

#### 2.1 Обновление схем
```python
class RoadmapNodeBase(BaseModel):
    title: str
    description: Optional[str] = ""
    direction: str
    resources: List[str] = []
    checkpoint: bool = False
    node_type: str = "task"  # parent, task, optional
    is_required: bool = True
    order_index: int = 0
    is_active: bool = True

class RoadmapNodeCreate(RoadmapNodeBase):
    parent_ids: Optional[List[int]] = []
    blocking_node_ids: Optional[List[int]] = []  # узлы, которые блокируют этот

class RoadmapNodeOut(RoadmapNodeBase):
    id: int
    children: List['RoadmapNodeOut'] = []
    blocked_by: List['NodeBlockOut'] = []
    blocks: List['NodeBlockOut'] = []

class NodeBlockCreate(BaseModel):
    blocking_node_id: int
    blocked_node_id: int
    block_type: str = "required"

class NodeBlockOut(BaseModel):
    id: int
    blocking_node_id: int
    blocked_node_id: int
    block_type: str
    created_at: datetime
```

### Этап 3: CRUD операции для админки (3-4 часа)

#### 3.1 Расширение crud.py
```python
def create_node_with_blocks(db: Session, node: schemas.RoadmapNodeCreate) -> schemas.RoadmapNodeOut:
    """Создание узла с блокировками"""
    # Создание узла
    db_node = models.RoadmapNode(...)
    db.add(db_node)
    db.commit()
    db.refresh(db_node)
    
    # Создание связей с родителями
    if node.parent_ids:
        # ... логика связей
    
    # Создание блокировок
    if node.blocking_node_ids:
        for blocking_id in node.blocking_node_ids:
            block = models.NodeBlock(
                blocking_node_id=blocking_id,
                blocked_node_id=db_node.id,
                block_type="required"
            )
            db.add(block)
        db.commit()
    
    return schemas.RoadmapNodeOut.model_validate(db_node)

def update_node_with_blocks(db: Session, node_id: int, node: schemas.RoadmapNodeCreate) -> schemas.RoadmapNodeOut:
    """Обновление узла с блокировками"""
    # ... логика обновления

def delete_node_cascade(db: Session, node_id: int) -> bool:
    """Удаление узла с каскадным удалением связей"""
    # ... логика удаления

def get_node_dependencies(db: Session, node_id: int) -> List[schemas.RoadmapNodeOut]:
    """Получение зависимостей узла"""
    # ... логика получения зависимостей

def check_node_availability(db: Session, node_id: int, user_id: int) -> bool:
    """Проверка доступности узла для пользователя"""
    # ... логика проверки блокировок
```

### Этап 4: API endpoints для админки (2-3 часа)

#### 4.1 Новый роутер admin.py
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas, deps
from ..db import get_db

router = APIRouter(
    prefix="/admin/roadmap",
    tags=["admin-roadmap"],
    dependencies=[Depends(deps.get_current_admin_user)]  # только для админов
)

@router.get("/nodes", response_model=List[schemas.RoadmapNodeOut])
def get_all_nodes_admin(db: Session = Depends(get_db)):
    """Получение всех узлов для админки"""
    return crud.get_all_nodes_with_blocks(db)

@router.post("/nodes", response_model=schemas.RoadmapNodeOut)
def create_node_admin(node: schemas.RoadmapNodeCreate, db: Session = Depends(get_db)):
    """Создание нового узла"""
    return crud.create_node_with_blocks(db, node)

@router.put("/nodes/{node_id}", response_model=schemas.RoadmapNodeOut)
def update_node_admin(node_id: int, node: schemas.RoadmapNodeCreate, db: Session = Depends(get_db)):
    """Обновление узла"""
    return crud.update_node_with_blocks(db, node_id, node)

@router.delete("/nodes/{node_id}")
def delete_node_admin(node_id: int, db: Session = Depends(get_db)):
    """Удаление узла"""
    success = crud.delete_node_cascade(db, node_id)
    if not success:
        raise HTTPException(status_code=404, detail="Node not found")
    return {"message": "Node deleted successfully"}

@router.get("/nodes/{node_id}/dependencies", response_model=List[schemas.RoadmapNodeOut])
def get_node_dependencies(node_id: int, db: Session = Depends(get_db)):
    """Получение зависимостей узла"""
    return crud.get_node_dependencies(db, node_id)

@router.post("/blocks", response_model=schemas.NodeBlockOut)
def create_block(block: schemas.NodeBlockCreate, db: Session = Depends(get_db)):
    """Создание блокировки между узлами"""
    return crud.create_node_block(db, block)

@router.delete("/blocks/{block_id}")
def delete_block(block_id: int, db: Session = Depends(get_db)):
    """Удаление блокировки"""
    success = crud.delete_node_block(db, block_id)
    if not success:
        raise HTTPException(status_code=404, detail="Block not found")
    return {"message": "Block deleted successfully"}
```

### Этап 5: Frontend админка (6-8 часов)

#### 5.1 Структура компонентов
```
frontend/src/pages/admin/
├── AdminDashboard.tsx          # Главная страница админки
├── RoadmapAdmin.tsx           # Управление роадмапом
├── NodeList.tsx               # Список узлов
├── NodeForm.tsx               # Форма создания/редактирования
├── NodeDependencies.tsx       # Управление зависимостями
└── components/
    ├── NodeCard.tsx           # Карточка узла
    ├── DependencyGraph.tsx    # Граф зависимостей
    └── BlockManager.tsx       # Управление блокировками
```

#### 5.2 Главная страница админки
```typescript
// AdminDashboard.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Админка роадмапа</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/admin/roadmap" className="bg-slate-800 p-6 rounded-lg hover:bg-slate-700 transition-colors">
            <h2 className="text-xl font-semibold mb-2">Управление роадмапом</h2>
            <p className="text-slate-300">Создание и редактирование узлов роадмапа</p>
          </Link>
          
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Статистика</h2>
            <p className="text-slate-300">Аналитика использования роадмапа</p>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Пользователи</h2>
            <p className="text-slate-300">Управление пользователями и их прогрессом</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
```

#### 5.3 Список узлов
```typescript
// NodeList.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import NodeCard from './components/NodeCard';

interface RoadmapNode {
  id: number;
  title: string;
  direction: string;
  node_type: string;
  is_required: boolean;
  is_active: boolean;
  children: RoadmapNode[];
  blocked_by: any[];
}

const NodeList: React.FC = () => {
  const [nodes, setNodes] = useState<RoadmapNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    direction: '',
    node_type: '',
    is_active: true
  });

  useEffect(() => {
    loadNodes();
  }, [filter]);

  const loadNodes = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminNodes(filter);
      setNodes(data);
    } catch (error) {
      console.error('Ошибка загрузки узлов:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Фильтры */}
      <div className="bg-slate-800 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select 
            value={filter.direction}
            onChange={(e) => setFilter({...filter, direction: e.target.value})}
            className="bg-slate-700 text-white p-2 rounded"
          >
            <option value="">Все направления</option>
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
            <option value="devops">DevOps</option>
            <option value="career">Career</option>
          </select>
          
          <select 
            value={filter.node_type}
            onChange={(e) => setFilter({...filter, node_type: e.target.value})}
            className="bg-slate-700 text-white p-2 rounded"
          >
            <option value="">Все типы</option>
            <option value="parent">Родительские</option>
            <option value="task">Задачи</option>
            <option value="optional">Дополнительные</option>
          </select>
          
          <label className="flex items-center space-x-2">
            <input 
              type="checkbox"
              checked={filter.is_active}
              onChange={(e) => setFilter({...filter, is_active: e.target.checked})}
              className="rounded"
            />
            <span>Только активные</span>
          </label>
        </div>
      </div>

      {/* Список узлов */}
      {loading ? (
        <div className="text-center py-8">Загрузка...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nodes.map(node => (
            <NodeCard 
              key={node.id} 
              node={node} 
              onEdit={() => {/* логика редактирования */}}
              onDelete={() => {/* логика удаления */}}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NodeList;
```

#### 5.4 Форма создания/редактирования узла
```typescript
// NodeForm.tsx
import React, { useState, useEffect } from 'react';
import { api } from '../../api';

interface NodeFormProps {
  node?: RoadmapNode;
  onSave: (node: RoadmapNode) => void;
  onCancel: () => void;
}

const NodeForm: React.FC<NodeFormProps> = ({ node, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    direction: '',
    node_type: 'task',
    is_required: true,
    is_active: true,
    checkpoint: false,
    resources: [] as string[],
    parent_ids: [] as number[],
    blocking_node_ids: [] as number[]
  });

  const [availableNodes, setAvailableNodes] = useState<RoadmapNode[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (node) {
      setFormData({
        title: node.title,
        description: node.description || '',
        direction: node.direction,
        node_type: node.node_type,
        is_required: node.is_required,
        is_active: node.is_active,
        checkpoint: node.checkpoint,
        resources: node.resources || [],
        parent_ids: node.parent_ids || [],
        blocking_node_ids: node.blocking_node_ids || []
      });
    }
    loadAvailableNodes();
  }, [node]);

  const loadAvailableNodes = async () => {
    try {
      const nodes = await api.getAdminNodes({});
      setAvailableNodes(nodes);
    } catch (error) {
      console.error('Ошибка загрузки узлов:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const savedNode = node 
        ? await api.updateNode(node.id, formData)
        : await api.createNode(formData);
      
      onSave(savedNode);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-slate-800 p-6 rounded-lg">
      <h2 className="text-2xl font-bold">
        {node ? 'Редактирование узла' : 'Создание узла'}
      </h2>

      {/* Основные поля */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Название</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full bg-slate-700 text-white p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Направление</label>
          <select
            value={formData.direction}
            onChange={(e) => setFormData({...formData, direction: e.target.value})}
            className="w-full bg-slate-700 text-white p-2 rounded"
            required
          >
            <option value="">Выберите направление</option>
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
            <option value="devops">DevOps</option>
            <option value="career">Career</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Описание</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          className="w-full bg-slate-700 text-white p-2 rounded h-24"
        />
      </div>

      {/* Тип узла и настройки */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Тип узла</label>
          <select
            value={formData.node_type}
            onChange={(e) => setFormData({...formData, node_type: e.target.value})}
            className="w-full bg-slate-700 text-white p-2 rounded"
          >
            <option value="parent">Родительский</option>
            <option value="task">Задача</option>
            <option value="optional">Дополнительный</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.is_required}
              onChange={(e) => setFormData({...formData, is_required: e.target.checked})}
              className="rounded"
            />
            <span>Обязательный</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              className="rounded"
            />
            <span>Активный</span>
          </label>
        </div>

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.checkpoint}
              onChange={(e) => setFormData({...formData, checkpoint: e.target.checked})}
              className="rounded"
            />
            <span>Чекпоинт</span>
          </label>
        </div>
      </div>

      {/* Родительские узлы */}
      <div>
        <label className="block text-sm font-medium mb-2">Родительские узлы</label>
        <select
          multiple
          value={formData.parent_ids}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => parseInt(option.value));
            setFormData({...formData, parent_ids: values});
          }}
          className="w-full bg-slate-700 text-white p-2 rounded h-32"
        >
          {availableNodes.map(node => (
            <option key={node.id} value={node.id}>
              {node.title} ({node.direction})
            </option>
          ))}
        </select>
      </div>

      {/* Блокирующие узлы */}
      <div>
        <label className="block text-sm font-medium mb-2">Блокируется узлами</label>
        <select
          multiple
          value={formData.blocking_node_ids}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => parseInt(option.value));
            setFormData({...formData, blocking_node_ids: values});
          }}
          className="w-full bg-slate-700 text-white p-2 rounded h-32"
        >
          {availableNodes.map(node => (
            <option key={node.id} value={node.id}>
              {node.title} ({node.direction})
            </option>
          ))}
        </select>
      </div>

      {/* Ресурсы */}
      <div>
        <label className="block text-sm font-medium mb-2">Ресурсы (по одному на строку)</label>
        <textarea
          value={formData.resources.join('\n')}
          onChange={(e) => setFormData({...formData, resources: e.target.value.split('\n').filter(r => r.trim())})}
          className="w-full bg-slate-700 text-white p-2 rounded h-24"
          placeholder="https://example.com&#10;https://docs.example.com"
        />
      </div>

      {/* Кнопки */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-500"
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50"
        >
          {loading ? 'Сохранение...' : (node ? 'Обновить' : 'Создать')}
        </button>
      </div>
    </form>
  );
};

export default NodeForm;
```

### Этап 6: Система блокировок (3-4 часа)

#### 6.1 Логика проверки блокировок
```python
def check_node_availability(db: Session, node_id: int, user_id: int) -> dict:
    """Проверка доступности узла для пользователя"""
    node = db.query(models.RoadmapNode).filter(models.RoadmapNode.id == node_id).first()
    if not node:
        return {"available": False, "reason": "Node not found"}
    
    # Получаем все блокировки для этого узла
    blocks = db.query(models.NodeBlock).filter(
        models.NodeBlock.blocked_node_id == node_id
    ).all()
    
    unavailable_reasons = []
    
    for block in blocks:
        # Проверяем статус блокирующего узла
        progress = db.query(models.Progress).filter(
            models.Progress.user_id == user_id,
            models.Progress.node_id == block.blocking_node_id
        ).first()
        
        if not progress or progress.status != "completed":
            if block.block_type == "required":
                unavailable_reasons.append({
                    "type": "required_block",
                    "blocking_node": block.blocking_node.title,
                    "blocking_node_id": block.blocking_node_id
                })
            else:
                unavailable_reasons.append({
                    "type": "optional_block",
                    "blocking_node": block.blocking_node.title,
                    "blocking_node_id": block.blocking_node_id
                })
    
    return {
        "available": len(unavailable_reasons) == 0,
        "reasons": unavailable_reasons,
        "node": schemas.RoadmapNodeOut.model_validate(node)
    }
```

#### 6.2 API для проверки доступности
```python
@router.get("/nodes/{node_id}/availability/{user_id}")
def check_node_availability_api(node_id: int, user_id: int, db: Session = Depends(get_db)):
    """Проверка доступности узла для пользователя"""
    result = crud.check_node_availability(db, node_id, user_id)
    return result
```

### Этап 7: Визуализация зависимостей (2-3 часа)

#### 7.1 Компонент графа зависимостей
```typescript
// DependencyGraph.tsx
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface DependencyGraphProps {
  nodes: RoadmapNode[];
  dependencies: NodeBlock[];
}

const DependencyGraph: React.FC<DependencyGraphProps> = ({ nodes, dependencies }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 600;
    svg.attr("width", width).attr("height", height);

    // Создание симуляции
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(dependencies).id((d: any) => d.id))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Создание связей
    const link = svg.append("g")
      .selectAll("line")
      .data(dependencies)
      .enter().append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2);

    // Создание узлов
    const node = svg.append("g")
      .selectAll("circle")
      .data(nodes)
      .enter().append("circle")
      .attr("r", 10)
      .attr("fill", (d: any) => {
        switch (d.node_type) {
          case 'parent': return '#ff6b6b';
          case 'task': return '#4ecdc4';
          case 'optional': return '#ffe66d';
          default: return '#95a5a6';
        }
      })
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Добавление подписей
    const label = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .enter().append("text")
      .text((d: any) => d.title)
      .attr("font-size", 12)
      .attr("fill", "#333");

    // Обновление позиций
    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);

      label
        .attr("x", (d: any) => d.x + 15)
        .attr("y", (d: any) => d.y + 5);
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

  }, [nodes, dependencies]);

  return (
    <div className="bg-white p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Граф зависимостей</h3>
      <svg ref={svgRef} className="w-full h-96 border border-gray-300 rounded"></svg>
    </div>
  );
};

export default DependencyGraph;
```

### Этап 8: Миграции базы данных (1-2 часа)

#### 8.1 Создание миграции
```python
# migrations/versions/add_admin_fields.py
"""Add admin fields to roadmap nodes

Revision ID: add_admin_fields
Revises: 949cbd351ffe
Create Date: 2024-01-XX XX:XX:XX.XXXXXX

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'add_admin_fields'
down_revision = '949cbd351ffe'
branch_labels = None
depends_on = None

def upgrade():
    # Добавление новых полей в roadmap_nodes
    op.add_column('roadmap_nodes', sa.Column('node_type', sa.String(20), nullable=False, server_default='task'))
    op.add_column('roadmap_nodes', sa.Column('is_required', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('roadmap_nodes', sa.Column('order_index', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('roadmap_nodes', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))
    
    # Создание таблицы блокировок
    op.create_table('node_blocks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('blocking_node_id', sa.Integer(), nullable=False),
        sa.Column('blocked_node_id', sa.Integer(), nullable=False),
        sa.Column('block_type', sa.String(20), nullable=False, server_default='required'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['blocking_node_id'], ['roadmap_nodes.id'], ),
        sa.ForeignKeyConstraint(['blocked_node_id'], ['roadmap_nodes.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_node_blocks_id'), 'node_blocks', ['id'], unique=False)

def downgrade():
    op.drop_index(op.f('ix_node_blocks_id'), table_name='node_blocks')
    op.drop_table('node_blocks')
    op.drop_column('roadmap_nodes', 'is_active')
    op.drop_column('roadmap_nodes', 'order_index')
    op.drop_column('roadmap_nodes', 'is_required')
    op.drop_column('roadmap_nodes', 'node_type')
```

### Этап 9: Тестирование (2-3 часа)

#### 9.1 Тесты для CRUD операций
```python
# tests/test_admin_crud.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app import crud, models, schemas

client = TestClient(app)

def test_create_node_with_blocks(db: Session):
    """Тест создания узла с блокировками"""
    # Создаем родительский узел
    parent_node = schemas.RoadmapNodeCreate(
        title="Parent Node",
        direction="frontend",
        node_type="parent"
    )
    parent = crud.create_node_with_blocks(db, parent_node)
    
    # Создаем дочерний узел с блокировкой
    child_node = schemas.RoadmapNodeCreate(
        title="Child Node",
        direction="frontend",
        node_type="task",
        parent_ids=[parent.id],
        blocking_node_ids=[parent.id]
    )
    child = crud.create_node_with_blocks(db, child_node)
    
    assert child.title == "Child Node"
    assert len(child.blocked_by) == 1
    assert child.blocked_by[0].blocking_node_id == parent.id

def test_check_node_availability(db: Session):
    """Тест проверки доступности узла"""
    # Создаем тестового пользователя
    user = models.User(email="test@example.com", password_hash="hash")
    db.add(user)
    db.commit()
    
    # Создаем узлы с блокировкой
    parent = crud.create_node_with_blocks(db, schemas.RoadmapNodeCreate(
        title="Parent",
        direction="frontend",
        node_type="parent"
    ))
    
    child = crud.create_node_with_blocks(db, schemas.RoadmapNodeCreate(
        title="Child",
        direction="frontend",
        node_type="task",
        blocking_node_ids=[parent.id]
    ))
    
    # Проверяем доступность дочернего узла
    availability = crud.check_node_availability(db, child.id, user.id)
    assert not availability["available"]
    assert len(availability["reasons"]) == 1
    
    # Завершаем родительский узел
    progress = models.Progress(
        user_id=user.id,
        node_id=parent.id,
        status="completed"
    )
    db.add(progress)
    db.commit()
    
    # Проверяем доступность снова
    availability = crud.check_node_availability(db, child.id, user.id)
    assert availability["available"]
```

#### 9.2 Тесты для API endpoints
```python
# tests/test_admin_api.py
def test_create_node_admin():
    """Тест создания узла через админ API"""
    node_data = {
        "title": "Test Node",
        "direction": "frontend",
        "node_type": "task",
        "is_required": True,
        "is_active": True
    }
    
    response = client.post("/admin/roadmap/nodes", json=node_data)
    assert response.status_code == 200
    
    data = response.json()
    assert data["title"] == "Test Node"
    assert data["direction"] == "frontend"

def test_get_node_dependencies():
    """Тест получения зависимостей узла"""
    # Создаем узлы с зависимостями
    # ... логика создания
    
    response = client.get("/admin/roadmap/nodes/1/dependencies")
    assert response.status_code == 200
    
    dependencies = response.json()
    assert isinstance(dependencies, list)
```

## 🎯 Ожидаемые результаты

### Функциональность
- ✅ **Полноценная админка** для управления роадмапом
- ✅ **Иерархическая структура** узлов (родительские → дочерние → дополнительные)
- ✅ **Система блокировок** с условными зависимостями
- ✅ **Визуализация зависимостей** в виде графа
- ✅ **CRUD операции** для всех типов узлов
- ✅ **Валидация данных** и проверка целостности

### Технические характеристики
- ✅ **RESTful API** для админки
- ✅ **React компоненты** с TypeScript
- ✅ **База данных** с поддержкой связей и блокировок
- ✅ **Тесты** для критической функциональности
- ✅ **Миграции** для обновления схемы БД

### UX/UI
- ✅ **Интуитивный интерфейс** для управления узлами
- ✅ **Визуальный редактор** связей и зависимостей
- ✅ **Фильтрация и поиск** узлов
- ✅ **Drag & Drop** для изменения порядка
- ✅ **Предварительный просмотр** изменений

## ⏱️ Временные рамки

### Общее время: 20-30 часов
- **Этап 1-2:** Модели и схемы (3-5 часов)
- **Этап 3-4:** CRUD и API (5-7 часов)
- **Этап 5:** Frontend админка (6-8 часов)
- **Этап 6:** Система блокировок (3-4 часа)
- **Этап 7:** Визуализация (2-3 часа)
- **Этап 8:** Миграции (1-2 часа)
- **Этап 9:** Тестирование (2-3 часа)

### Приоритеты
1. **Высокий:** Базовая CRUD функциональность
2. **Высокий:** Система блокировок
3. **Средний:** Визуализация зависимостей
4. **Средний:** Расширенный UI
5. **Низкий:** Дополнительные фичи

## 🚀 Готовность к реализации

- ✅ **План детализирован** с техническими решениями
- ✅ **Архитектура определена** с учетом существующей системы
- ✅ **Компоненты спроектированы** с примерами кода
- ✅ **База данных расширена** новыми полями и таблицами
- ✅ **API endpoints** спроектированы
- ✅ **Frontend компоненты** детализированы
- ✅ **Тесты** запланированы
- ✅ **Mindmap создан** для визуализации плана

## 📝 Следующие шаги

1. **Создать миграцию** для новых полей в БД
2. **Расширить модели** RoadmapNode и создать NodeBlock
3. **Обновить схемы** Pydantic для новых полей
4. **Реализовать CRUD** операции для админки
5. **Создать API endpoints** для админки
6. **Разработать Frontend** компоненты
7. **Интегрировать систему** блокировок
8. **Добавить тесты** для критической функциональности
9. **Провести тестирование** и отладку
10. **Документировать** API и компоненты
