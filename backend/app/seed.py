from sqlalchemy.orm import Session
from .models import RoadmapNode
import json


def seed(db: Session):
    if db.query(RoadmapNode).count() > 0:
        return

    def add(direction, title, description, resources, parent_id=None, checkpoint=False):
        node = RoadmapNode(
            direction=direction,
            title=title,
            description=description,
            resources=json.dumps(resources),
            parent_id=parent_id,
            checkpoint=checkpoint,
        )
        db.add(node)
        db.flush()
        return node.id

    # Frontend path sample
    fe_root = add(
        "frontend",
        "Frontend Adventurer",
        "Start your quest in the realms of HTML/CSS/JS.",
        ["https://developer.mozilla.org", "https://javascript.info"],
    )
    fe_html = add(
        "frontend",
        "HTML & Semantics",
        "Structure pages with meaning. Learn tags and accessibility.",
        ["https://web.dev/learn/html/"],
        parent_id=fe_root,
        checkpoint=True,
    )
    fe_css = add(
        "frontend",
        "CSS & Layout",
        "Master layout, flexbox, grid, and responsive design.",
        ["https://web.dev/learn/css/"],
        parent_id=fe_root,
    )
    fe_js = add(
        "frontend",
        "JavaScript Basics",
        "Syntax, types, async, DOM manipulation.",
        ["https://javascript.info/"],
        parent_id=fe_root,
        checkpoint=True,
    )
    add(
        "frontend",
        "React Fundamentals",
        "Components, state, props, hooks.",
        ["https://react.dev/learn"],
        parent_id=fe_js,
        checkpoint=True,
    )

    # Backend path sample
    be_root = add(
        "backend",
        "Backend Initiate",
        "Start with HTTP, REST, and Python.",
        ["https://fastapi.tiangolo.com/"],
    )
    add(
        "backend",
        "Python Basics",
        "Syntax, typing, packaging.",
        ["https://docs.python.org/3/tutorial/"],
        parent_id=be_root,
    )
    add(
        "backend",
        "Databases & SQL",
        "Model data, write queries, migrations.",
        ["https://www.sqltutorial.org/"],
        parent_id=be_root,
        checkpoint=True,
    )
    add(
        "backend",
        "FastAPI & Pydantic",
        "Build APIs with validation.",
        ["https://fastapi.tiangolo.com/"],
        parent_id=be_root,
        checkpoint=True,
    )

    # DevOps path sample
    dev_root = add(
        "devops",
        "DevOps Pathfinder",
        "Linux basics, Docker, CI/CD.",
        ["https://docs.docker.com/get-started/"],
    )
    add(
        "devops",
        "Linux & Shell",
        "Files, permissions, bash.",
        ["https://linuxjourney.com/"],
        parent_id=dev_root,
    )
    add(
        "devops",
        "Docker Fundamentals",
        "Images, containers, compose.",
        ["https://docs.docker.com/get-started/"],
        parent_id=dev_root,
        checkpoint=True,
    )

    db.commit()

