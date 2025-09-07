"""
Data Management System
Заменяет мок данные на конфигурируемую систему инициализации данных
"""
import json
import os
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from .models import RoadmapNode, User, Progress
from .auth import hash_password


class DataManager:
    """Менеджер для управления данными приложения"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def load_roadmap_data(self, data_file: Optional[str] = None) -> Dict:
        """Загружает данные роадмапа из файла или использует встроенные"""
        if data_file and os.path.exists(data_file):
            with open(data_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        
        # Встроенные данные роадмапа
        return {
            "frontend": [
                {"key": "fe_root", "title": "Frontend Adventurer", "description": "Start your quest in the realms of HTML/CSS/JS.", "resources": ["https://developer.mozilla.org"], "parents": [], "checkpoint": False},
                {"key": "fe_html", "title": "HTML & Semantics", "description": "Structure pages with meaning. Learn tags and accessibility.", "resources": ["https://web.dev/learn/html/"], "parents": ["fe_root"], "checkpoint": True},
                {"key": "fe_css", "title": "CSS & Layout", "description": "Master layout, flexbox, grid, and responsive design.", "resources": ["https://web.dev/learn/css/"], "parents": ["fe_root"], "checkpoint": False},
                {"key": "fe_js", "title": "JavaScript Basics", "description": "Syntax, types, async, DOM manipulation.", "resources": ["https://javascript.info/"], "parents": ["fe_root"], "checkpoint": True},
                {"key": "fe_react", "title": "React Fundamentals", "description": "Components, state, props, hooks.", "resources": ["https://react.dev/learn"], "parents": ["fe_js"], "checkpoint": True},
            ],
            "backend": [
                {"key": "be_root", "title": "Backend Initiate", "description": "Start with HTTP, REST, and Python.", "resources": ["https://fastapi.tiangolo.com/"], "parents": [], "checkpoint": False},
                {"key": "be_python", "title": "Python Basics", "description": "Syntax, typing, packaging.", "resources": ["https://docs.python.org/3/tutorial/"], "parents": ["be_root"], "checkpoint": False},
                {"key": "be_db", "title": "Databases & SQL", "description": "Model data, write queries, migrations.", "resources": ["https://www.sqltutorial.org/"], "parents": ["be_root"], "checkpoint": True},
                {"key": "be_fastapi", "title": "FastAPI & Pydantic", "description": "Build APIs with validation.", "resources": ["https://fastapi.tiangolo.com/"], "parents": ["be_python", "be_db"], "checkpoint": True},
            ],
            "devops": [
                {"key": "dev_root", "title": "DevOps Pathfinder", "description": "Linux basics, Docker, CI/CD.", "resources": ["https://docs.docker.com/get-started/"], "parents": [], "checkpoint": False},
                {"key": "dev_linux", "title": "Linux & Shell", "description": "Files, permissions, bash.", "resources": ["https://linuxjourney.com/"], "parents": ["dev_root"], "checkpoint": False},
                {"key": "dev_docker", "title": "Docker Fundamentals", "description": "Images, containers, compose.", "resources": ["https://docs.docker.com/get-started/"], "parents": ["dev_linux"], "checkpoint": True},
            ],
            "career": [
                {"key": "career_root", "title": "Junior Developer", "description": "Начальный уровень разработчика. Изучение основ программирования и инструментов.", "resources": ["https://roadmap.sh/"], "parents": [], "checkpoint": False},
                {"key": "career_junior", "title": "Junior Developer", "description": "Основы программирования, работа в команде, изучение фреймворков.", "resources": ["https://github.com/kamranahmedse/developer-roadmap"], "parents": ["career_root"], "checkpoint": True},
                {"key": "career_middle", "title": "Middle Developer", "description": "Архитектура приложений, оптимизация, менторинг джунов.", "resources": ["https://martinfowler.com/"], "parents": ["career_junior"], "checkpoint": True},
                {"key": "career_senior", "title": "Senior Developer", "description": "Системный дизайн, техническое лидерство, принятие архитектурных решений.", "resources": ["https://www.educative.io/courses/grokking-the-system-design-interview"], "parents": ["career_middle"], "checkpoint": True},
                {"key": "career_lead", "title": "Tech Lead", "description": "Управление командой, планирование архитектуры, техническое видение.", "resources": ["https://www.oreilly.com/library/view/team-topologies/9781492040664/"], "parents": ["career_senior"], "checkpoint": True},
            ]
        }
    
    def load_test_users(self, users_file: Optional[str] = None) -> List[Dict]:
        """Загружает тестовых пользователей из файла или использует встроенных"""
        if users_file and os.path.exists(users_file):
            with open(users_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        
        # Встроенные тестовые пользователи
        return [
            {"email": "junior@dev.com", "password": "password123", "role": "junior", "xp": 150, "badges": ["Apprentice"]},
            {"email": "middle@dev.com", "password": "password123", "role": "middle", "xp": 450, "badges": ["Apprentice", "Journeyman"]},
            {"email": "senior@dev.com", "password": "password123", "role": "senior", "xp": 850, "badges": ["Apprentice", "Journeyman", "Adept"]},
            {"email": "lead@dev.com", "password": "password123", "role": "lead", "xp": 1200, "badges": ["Apprentice", "Journeyman", "Adept", "Master"]},
        ]
    
    def load_test_progress(self, progress_file: Optional[str] = None) -> Dict:
        """Загружает тестовый прогресс из файла или использует встроенный"""
        if progress_file and os.path.exists(progress_file):
            with open(progress_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        
        # Встроенный тестовый прогресс
        return {
            "junior@dev.com": [
                {"node_key": "fe_root", "status": "completed", "score": 85},
                {"node_key": "fe_html", "status": "completed", "score": 90},
                {"node_key": "fe_css", "status": "in_progress", "score": 0},
                {"node_key": "career_root", "status": "completed", "score": 80},
                {"node_key": "career_junior", "status": "completed", "score": 75},
            ],
            "middle@dev.com": [
                {"node_key": "fe_root", "status": "completed", "score": 95},
                {"node_key": "fe_html", "status": "completed", "score": 90},
                {"node_key": "fe_css", "status": "completed", "score": 85},
                {"node_key": "fe_js", "status": "completed", "score": 80},
                {"node_key": "fe_react", "status": "in_progress", "score": 0},
                {"node_key": "be_root", "status": "completed", "score": 75},
                {"node_key": "be_python", "status": "completed", "score": 85},
                {"node_key": "career_root", "status": "completed", "score": 90},
                {"node_key": "career_junior", "status": "completed", "score": 85},
                {"node_key": "career_middle", "status": "completed", "score": 80},
            ]
        }
    
    def create_roadmap_nodes(self, roadmap_data: Dict) -> Dict[str, RoadmapNode]:
        """Создает узлы роадмапа"""
        created_nodes = {}
        
        # Создаем все узлы без связей
        for direction, nodes_data in roadmap_data.items():
            for node_info in nodes_data:
                node = RoadmapNode(
                    direction=direction,
                    title=node_info["title"],
                    description=node_info["description"],
                    resources=json.dumps(node_info["resources"]),
                    checkpoint=node_info.get("checkpoint", False),
                )
                self.db.add(node)
                created_nodes[node_info["key"]] = node
        
        self.db.flush()  # Присваиваем ID объектам
        
        # Устанавливаем связи между узлами
        for direction, nodes_data in roadmap_data.items():
            for node_info in nodes_data:
                if node_info["parents"]:
                    current_node = created_nodes[node_info["key"]]
                    for parent_key in node_info["parents"]:
                        parent_node = created_nodes.get(parent_key)
                        if parent_node:
                            parent_node.children.append(current_node)
        
        return created_nodes
    
    def create_test_users(self, users_data: List[Dict]) -> Dict[str, User]:
        """Создает тестовых пользователей"""
        created_users = {}
        
        for user_data in users_data:
            user = User(
                email=user_data["email"],
                password_hash=hash_password(user_data["password"]),
                role=user_data["role"],
                xp=user_data["xp"],
                badges=json.dumps(user_data["badges"])
            )
            self.db.add(user)
            created_users[user_data["email"]] = user
        
        self.db.flush()
        return created_users
    
    def create_test_progress(self, progress_data: Dict, users: Dict[str, User], nodes: Dict[str, RoadmapNode]):
        """Создает тестовый прогресс"""
        for email, progress_list in progress_data.items():
            user = users.get(email)
            if not user:
                continue
                
            for prog_data in progress_list:
                node = nodes.get(prog_data["node_key"])
                if node:
                    progress = Progress(
                        user_id=user.id,
                        node_id=node.id,
                        status=prog_data["status"],
                        score=prog_data["score"]
                    )
                    self.db.add(progress)
    
    def initialize_data(self, 
                       roadmap_file: Optional[str] = None,
                       users_file: Optional[str] = None,
                       progress_file: Optional[str] = None,
                       force: bool = False):
        """Инициализирует данные в базе"""
        
        # Проверяем, есть ли уже данные
        if not force and self.db.query(RoadmapNode).count() > 0:
            print("Database already contains data. Use force=True to reinitialize.")
            return
        
        print("Initializing database with roadmap data...")
        
        # Загружаем данные
        roadmap_data = self.load_roadmap_data(roadmap_file)
        users_data = self.load_test_users(users_file)
        progress_data = self.load_test_progress(progress_file)
        
        # Создаем данные
        nodes = self.create_roadmap_nodes(roadmap_data)
        users = self.create_test_users(users_data)
        self.create_test_progress(progress_data, users, nodes)
        
        self.db.commit()
        print("Database initialization complete with test users and progress.")
    
    def clear_data(self):
        """Очищает все данные из базы"""
        print("Clearing all data from database...")
        
        # Удаляем в правильном порядке (с учетом foreign keys)
        self.db.query(Progress).delete()
        self.db.query(User).delete()
        self.db.query(RoadmapNode).delete()
        
        self.db.commit()
        print("Database cleared.")
    
    def export_data(self, output_dir: str = "data_export"):
        """Экспортирует данные в JSON файлы"""
        import os
        
        os.makedirs(output_dir, exist_ok=True)
        
        # Экспорт роадмапа
        roadmap_data = {}
        nodes = self.db.query(RoadmapNode).all()
        
        for node in nodes:
            if node.direction not in roadmap_data:
                roadmap_data[node.direction] = []
            
            # Находим ключ узла (используем ID как fallback)
            node_key = f"node_{node.id}"
            
            roadmap_data[node.direction].append({
                "key": node_key,
                "title": node.title,
                "description": node.description,
                "resources": json.loads(node.resources) if node.resources else [],
                "parents": [],  # TODO: восстановить связи
                "checkpoint": node.checkpoint
            })
        
        with open(os.path.join(output_dir, "roadmap.json"), 'w', encoding='utf-8') as f:
            json.dump(roadmap_data, f, ensure_ascii=False, indent=2)
        
        # Экспорт пользователей
        users_data = []
        users = self.db.query(User).all()
        
        for user in users:
            users_data.append({
                "email": user.email,
                "role": user.role,
                "xp": user.xp,
                "badges": json.loads(user.badges) if user.badges else []
            })
        
        with open(os.path.join(output_dir, "users.json"), 'w', encoding='utf-8') as f:
            json.dump(users_data, f, ensure_ascii=False, indent=2)
        
        print(f"Data exported to {output_dir}/")
