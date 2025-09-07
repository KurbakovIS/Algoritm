import json
from sqlalchemy.orm import Session
from .models import RoadmapNode

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

    db.commit()
    print("Database seeding complete.")

