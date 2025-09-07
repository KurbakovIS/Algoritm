from sqlalchemy.orm import Session
from .models import RoadmapNode
import json


def seed(db: Session):
    # Seed baseline directions if empty
    if db.query(RoadmapNode).count() == 0:
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

    # Always ensure the career storyline exists
    if db.query(RoadmapNode).filter(RoadmapNode.direction == "career").count() == 0:
        def addc(title, description, resources, parent_id=None, checkpoint=False):
            node = RoadmapNode(
                direction="career",
                title=title,
                description=description,
                resources=json.dumps(resources),
                parent_id=parent_id,
                checkpoint=checkpoint,
            )
            db.add(node)
            db.flush()
            return node.id

        root = addc(
            "Путь Разработчика",
            "Сюжетный путь от Джуна к Сеньору с ветвлениями.",
            ["https://roadmap.sh/", "https://martinfowler.com/"]
        )
        act1 = addc(
            "Акт I: Джуниор Основы",
            "CS основы, Git, язык, базовый веб/ООП, тесты.",
            ["https://cs50.harvard.edu/", "https://git-scm.com/doc"],
            parent_id=root,
        )
        cp_mid_minus = addc(
            "Чекпоинт: Middle-",
            "Промежуточный срез: самостоятельность в задачах средней сложности.",
            ["https://testing.googleblog.com/"],
            parent_id=act1,
            checkpoint=True,
        )
        act2 = addc(
            "Акт II: Middle Core",
            "Системное мышление, дебаг, профайлинг, реляционные БД, очереди.",
            ["https://12factor.net/"],
            parent_id=cp_mid_minus,
        )
        cp_mid = addc(
            "Чекпоинт: Middle",
            "Уверенная проектная работа, ревью, ответственность за компонент.",
            ["https://martinfowler.com/bliki/"],
            parent_id=act2,
            checkpoint=True,
        )
        act3 = addc(
            "Акт III: Middle+",
            "Проектирование API, отказоустойчивость, мониторинг, безопасность.",
            ["https://sre.google/sre-book/"],
            parent_id=cp_mid,
        )
        cp_sen_minus = addc(
            "Чекпоинт: Senior-",
            "Техническое лидерство в фиче, оценка рисков и оптимизаций.",
            ["https://aws.amazon.com/architecture/well-architected/"],
            parent_id=act3,
            checkpoint=True,
        )
        act4 = addc(
            "Акт IV: Senior Core",
            "Системный дизайн, масштабирование, компромиссы, SLA/SLO.",
            ["https://github.com/donnemartin/system-design-primer"],
            parent_id=cp_sen_minus,
        )
        cp_sen = addc(
            "Чекпоинт: Senior",
            "Владение системой, менторство, качество и стабильность.",
            ["https://landing.google.com/sre/"],
            parent_id=act4,
            checkpoint=True,
        )
        # Branches after Senior
        addc(
            "Ветка: Senior+",
            "Углубление в экспертизу, перформанс, сложные инциденты.",
            ["https://www.brendangregg.com/"],
            parent_id=cp_sen,
            checkpoint=True,
        )
        addc(
            "Ветка: Tech Lead",
            "Ведение техвектора команды, архитектура, качества, процесс.",
            ["https://leaddev.com/"],
            parent_id=cp_sen,
        )
        addc(
            "Ветка: Team Lead",
            "Люди, процессы, цели, найм и развитие.",
            ["https://managerreadme.com/"],
            parent_id=cp_sen,
        )
        addc(
            "Ветка: Архитектор",
            "Архитектурные стили, интеграции, эволюция систем.",
            ["https://www.enterpriseintegrationpatterns.com/"],
            parent_id=cp_sen,
        )

        # Side quests under each act
        for parent, items in [
            (act1, [
                ("Side: Алгоритмы и структуры данных", ["https://neetcode.io/"]),
                ("Side: Терминал и Linux", ["https://linuxjourney.com/"]),
            ]),
            (act2, [
                ("Side: Кэширование и Redis", ["https://redis.io/docs/latest/"]),
                ("Side: Очереди (RabbitMQ/Kafka)", ["https://www.rabbitmq.com/tutorials/"]),
            ]),
            (act3, [
                ("Side: Безопасность (OWASP)", ["https://owasp.org/www-project-top-ten/"]),
                ("Side: Наблюдаемость (logs/metrics/traces)", ["https://opentelemetry.io/docs/"]),
            ]),
            (act4, [
                ("Side: CAP/Consistency Patterns", ["https://jepsen.io/"]),
                ("Side: Архитектурные шаблоны", ["https://microservices.io/"]),
            ]),
        ]:
            for title, res in items:
                addc(title, "Дополнительный квест.", res, parent_id=parent)

        db.commit()
