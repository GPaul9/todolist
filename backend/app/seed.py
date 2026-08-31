# from sqlalchemy import text
#
# from app.core.database import async_session
# from app.models import Tag, Task, TagTaskLink, TaskList, Project
# from app.models.enums import TaskStatus, TaskPriority
#
#
# async def seed():
#     async with async_session() as session:
#         # --- Очистка ---
#         await session.execute(
#             text("TRUNCATE TABLE tag_task_link, tasks, tags, task_lists, projects RESTART IDENTITY CASCADE")
#         )
#
#         # --- Проекты ---
#         projects = [
#             Project(title="Main Project"),
#             Project(title="Second Project"),
#         ]
#         session.add_all(projects)
#         await session.flush()
#
#         # --- Теги ---
#         tags = [
#             Tag(name="backend", color="#FF0000", user_id=1),  # id=1
#             Tag(name="frontend", color="#0000FF", user_id=1),  # id=2
#             Tag(name="urgent", color="#00FF00", user_id=1),  # id=3
#             Tag(name="bug", color="#32FF00", user_id=1),  # id=4
#             Tag(name="draft", color="#FF0000", user_id=2),  # id=5
#         ]
#
#         session.add_all(tags)
#         await session.flush()
#
#         # --- Список задач ---
#         task_lists = [
#             TaskList(title="Main List", position=1, project_id=1),
#             TaskList(title="Second List", position=2, project_id=1),
#         ]
#         session.add_all(task_lists)
#         await session.flush()
#
#         # --- Задачи ---
#         tasks = [
#             Task(title="T1 backend+frontend",
#                  status=TaskStatus.TODO,
#                  priority=TaskPriority.HIGH,
#                  task_list_id=1,
#                  position=1),
#
#             Task(title="T2 backend only",
#                  status=TaskStatus.IN_PROGRESS,
#                  priority=TaskPriority.MEDIUM,
#                  task_list_id=1,
#                  position=2),
#
#             Task(title="T3 frontend only",
#                  status=TaskStatus.DONE,
#                  priority=TaskPriority.LOW,
#                  task_list_id=1,
#                  position=3),
#
#             Task(title="T4 backend+frontend+urgent",
#                  status=TaskStatus.TODO,
#                  priority=TaskPriority.HIGH,
#                  task_list_id=1,
#                  position=4),
#
#             Task(title="T5 urgent only",
#                  status=TaskStatus.TODO,
#                  priority=TaskPriority.LOW,
#                  task_list_id=1,
#                  position=5),
#
#             Task(title="T6 without tags",
#                  status=TaskStatus.TODO,
#                  priority=TaskPriority.MEDIUM,
#                  task_list_id=1,
#                  position=6),
#
#             Task(title="T7 another tasklist",
#                  status=TaskStatus.TODO,
#                  priority=TaskPriority.MEDIUM,
#                  task_list_id=2,
#                  position=6),
#         ]
#         session.add_all(tasks)
#         await session.flush()
#
#         # --- Связи ---
#         links = [
#             # T1 → backend + frontend
#             TagTaskLink(task_id=tasks[0].id, tag_id=tags[0].id),
#             TagTaskLink(task_id=tasks[0].id, tag_id=tags[1].id),
#
#             # T2 → backend
#             TagTaskLink(task_id=tasks[1].id, tag_id=tags[0].id),
#
#             # T3 → frontend
#             TagTaskLink(task_id=tasks[2].id, tag_id=tags[1].id),
#
#             # T4 → backend + frontend + urgent
#             TagTaskLink(task_id=tasks[3].id, tag_id=tags[0].id),
#             TagTaskLink(task_id=tasks[3].id, tag_id=tags[1].id),
#             TagTaskLink(task_id=tasks[3].id, tag_id=tags[2].id),
#
#             # T5 → urgent
#             TagTaskLink(task_id=tasks[4].id, tag_id=tags[2].id),
#         ]
#
#         session.add_all(links)
#         await session.commit()
#
#         print("Seed completed successfully")
