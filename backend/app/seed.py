import json
from sqlalchemy.orm import Session
from .models import RoadmapNode, User, Progress
from .auth import hash_password

# Структура данных для дорожных карт
# Каждый узел имеет уникальный 'key' и список 'parents', указывающих на 'key' родительских узлов.
ROADMAP_DATA = {
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

def seed(db: Session):
    if db.query(RoadmapNode).count() > 0:
        return

    print("Seeding database with roadmap data...")

    created_nodes = {}

    # 1. Создаем все узлы без связей
    for direction, nodes_data in ROADMAP_DATA.items():
        for node_info in nodes_data:
            node = RoadmapNode(
                direction=direction,
                title=node_info["title"],
                description=node_info["description"],
                resources=json.dumps(node_info["resources"]),
                checkpoint=node_info.get("checkpoint", False),
            )
            db.add(node)
            created_nodes[node_info["key"]] = node
    
    db.flush() # Присваиваем ID объектам

    # 2. Устанавливаем связи между узлами
    for direction, nodes_data in ROADMAP_DATA.items():
        for node_info in nodes_data:
            if node_info["parents"]:
                current_node = created_nodes[node_info["key"]]
                for parent_key in node_info["parents"]:
                    parent_node = created_nodes.get(parent_key)
                    if parent_node:
                        parent_node.children.append(current_node)

    # 3. Создаем тестовых пользователей
    test_users = [
        {"email": "junior@dev.com", "password": "password123", "role": "junior", "xp": 150, "badges": ["Apprentice"]},
        {"email": "middle@dev.com", "password": "password123", "role": "middle", "xp": 450, "badges": ["Apprentice", "Journeyman"]},
        {"email": "senior@dev.com", "password": "password123", "role": "senior", "xp": 850, "badges": ["Apprentice", "Journeyman", "Adept"]},
        {"email": "lead@dev.com", "password": "password123", "role": "lead", "xp": 1200, "badges": ["Apprentice", "Journeyman", "Adept", "Master"]},
    ]
    
    created_users = {}
    for user_data in test_users:
        user = User(
            email=user_data["email"],
            password_hash=hash_password(user_data["password"]),
            role=user_data["role"],
            xp=user_data["xp"],
            badges=json.dumps(user_data["badges"])
        )
        db.add(user)
        created_users[user_data["email"]] = user
    
    db.flush()

    # 4. Создаем тестовый прогресс
    # Junior пользователь - завершил базовые темы
    junior_user = created_users["junior@dev.com"]
    junior_progress = [
        {"node_key": "fe_root", "status": "completed", "score": 85},
        {"node_key": "fe_html", "status": "completed", "score": 90},
        {"node_key": "fe_css", "status": "in_progress", "score": 0},
        {"node_key": "career_root", "status": "completed", "score": 80},
        {"node_key": "career_junior", "status": "completed", "score": 75},
    ]
    
    for prog_data in junior_progress:
        node = created_nodes.get(prog_data["node_key"])
        if node:
            progress = Progress(
                user_id=junior_user.id,
                node_id=node.id,
                status=prog_data["status"],
                score=prog_data["score"]
            )
            db.add(progress)
    
    # Middle пользователь - больше прогресса
    middle_user = created_users["middle@dev.com"]
    middle_progress = [
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
    
    for prog_data in middle_progress:
        node = created_nodes.get(prog_data["node_key"])
        if node:
            progress = Progress(
                user_id=middle_user.id,
                node_id=node.id,
                status=prog_data["status"],
                score=prog_data["score"]
            )
            db.add(progress)

    db.commit()
    print("Database seeding complete with test users and progress.")

