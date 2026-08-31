from datetime import datetime, timezone
from typing import List, Optional, Tuple

from sqlalchemy import func, case, nulls_last
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlmodel import select, or_, col, delete, update

from app.models import Tag, Project, TaskList, SubTask, SubTaskStatus, Attachment, Reminder
from app.models.enums import ReminderStatus, TaskSortType, OrderType, AttachmentParentType
from app.models.tag_task_link import TagTaskLink
from app.models.task import Task, TaskSearchParams


class TaskRepository:
    """Асинхронный репозиторий для работы с задачами"""

    def __init__(self, session: AsyncSession):
        self.session = session

    def _get_subtasks_agg(self, task_id):
        subtasks_agg = (
            select(
                func.count(SubTask.id).label("total_subtasks"), # type: ignore
                func.sum(
                    case((SubTask.status == SubTaskStatus.DONE, 1), else_=0) # type: ignore
                ).label("completed_subtasks")
            )
            .where(SubTask.task_id == task_id, SubTask.is_archived == False)
            .subquery()
        )
        return subtasks_agg

    def _get_attachments_agg(self, task_id):
        attachments_agg = (
            select(
                func.count(Attachment.id).label("total_attachments") # type: ignore
            )
            .where(
                Attachment.parent_type == AttachmentParentType.task,
                Attachment.parent_id == task_id,
            )
            .subquery()
        )
        return attachments_agg

    def _get_reminders_agg(self, task_id):
        reminders_agg = (
            select(
                func.count(Reminder.id).label("total_reminders") # type: ignore
            )
            .where(Reminder.task_id == task_id,
                   # Reminder.status == ReminderStatus.PENDING
                   )
            .subquery()
        )
        return reminders_agg

    async def get_next_position(self, list_id: int) -> float:
        stmt = (
            select(func.coalesce(func.max(Task.position), 0))
            .where(Task.task_list_id == list_id)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one() + 1.0

    async def create(self, task: Task) -> Task:
        """Создание новой задачи"""
        self.session.add(task)
        await self.session.commit()
        await self.session.refresh(task, ["tags"])
        return task

    async def get_by_id(
            self, 
            task_id: int, 
            user_id: int
            ) -> Optional[Tuple[Task, int, int, int, int]]:
        """Получение задачи по ID"""
        stmt = (
            select(
                Task,
                self._get_subtasks_agg(task_id).c.total_subtasks,
                self._get_subtasks_agg(task_id).c.completed_subtasks,
                self._get_attachments_agg(task_id).c.total_attachments,
                self._get_reminders_agg(task_id).c.total_reminders,
            ) # type: ignore
            .join(TaskList)
            .join(Project)
            .where(
                Task.id == task_id,
                Project.owner_id == user_id,
            )
            .options(
                selectinload(Task.task_list).selectinload(TaskList.project),  # type: ignore
                selectinload(Task.tags),  # type: ignore
            )
            .execution_options(populate_existing=True)
        )

        result = await self.session.execute(stmt)
        return result.tuples().first()

    async def update(self, task: Task) -> Task:
        """Сохранение изменений, в частности удаление/перенос в архив"""
        self.session.add(task)
        await self.session.commit()
        await self.session.refresh(task, ["tags"])
        return task

    async def search_and_filter(
        self,
        user_id: int,
        filters: TaskSearchParams,
        list_id: Optional[int] = None,
    ) -> tuple[List[Tuple[Task, int, int, int, int]], int]:
        """Поиск и фильтрация задач с корректными агрегатами по каждой задаче"""

        subtasks_agg = (
            select(
                SubTask.task_id,
                func.count(SubTask.id).label("total_subtasks"), # type: ignore
                func.sum(
                    case((SubTask.status == SubTaskStatus.DONE, 1), else_=0) # type: ignore
                ).label("completed_subtasks")
            )
            .where(SubTask.is_archived == False)
            .group_by(SubTask.task_id) # type: ignore
            .subquery()
        )

        attachments_agg = (
            select(
                Attachment.parent_id.label("task_id"), # type: ignore
                func.count(Attachment.id).label("total_attachments") # type: ignore
            )
            .where(Attachment.parent_type == AttachmentParentType.task)
            .group_by(Attachment.parent_id) # type: ignore
            .subquery()
        )

        reminders_agg = (
            select(
                Reminder.task_id,
                func.count(Reminder.id).label("total_reminders") # type: ignore
            )
            # .where(Reminder.status == ReminderStatus.PENDING)
            .group_by(Reminder.task_id) # type: ignore
            .subquery()
        )

        # Основной запрос
        data_stmt = (
            select(
                Task,
                func.coalesce(subtasks_agg.c.total_subtasks, 0).label("total_subtasks"),
                func.coalesce(subtasks_agg.c.completed_subtasks, 0).label("completed_subtasks"),
                func.coalesce(attachments_agg.c.total_attachments, 0).label("total_attachments"),
                func.coalesce(reminders_agg.c.total_reminders, 0).label("total_reminders"),
            ) # type: ignore
            .join(TaskList)
            .join(Project)
            .outerjoin(subtasks_agg, subtasks_agg.c.task_id == Task.id)
            .outerjoin(attachments_agg, attachments_agg.c.task_id == Task.id)
            .outerjoin(reminders_agg, reminders_agg.c.task_id == Task.id)
            .where(
                Project.owner_id == user_id,
                Task.is_archived == filters.archived
            )
            .options(
                selectinload(Task.tags), # type: ignore
                selectinload(Task.task_list).selectinload(TaskList.project), # type: ignore
            )
        )

        count_stmt = (
            select(func.count(Task.id)) # type: ignore
            .join(TaskList)
            .join(Project)
            .where(
                Project.owner_id == user_id,
                Task.is_archived == filters.archived,
            )
        )

        # === Применяем фильтры ===
        if filters.search:
            search = filters.search.strip()
            if search.startswith('#') and len(search) > 1:
                tag_name = search[1:].strip().lower()
                data_stmt = (
                    data_stmt
                    .join(TagTaskLink).join(Tag).where(func.lower(Tag.name) == tag_name)
                )
                count_stmt = (
                    count_stmt
                    .join(TagTaskLink).join(Tag).where(func.lower(Tag.name) == tag_name)
                )
            else:
                search_text = f'%{search}%'
                condition = or_(
                    col(Task.title).ilike(search_text),
                    col(Task.description).ilike(search_text),
                )
                data_stmt = data_stmt.where(condition)
                count_stmt = count_stmt.where(condition)

        if filters.status:
            data_stmt = data_stmt.where(col(Task.status).in_(filters.status))
            count_stmt = count_stmt.where(col(Task.status).in_(filters.status))

        if filters.priority:
            data_stmt = data_stmt.where(col(Task.priority).in_(filters.priority))
            count_stmt = count_stmt.where(col(Task.priority).in_(filters.priority))

        if filters.date_from:
            data_stmt = data_stmt.where(col(Task.created_at) >= filters.date_from)
            count_stmt = count_stmt.where(col(Task.created_at) >= filters.date_from)

        if filters.date_to:
            data_stmt = data_stmt.where(col(Task.created_at) <= filters.date_to)
            count_stmt = count_stmt.where(col(Task.created_at) <= filters.date_to)

        if list_id is not None:
            data_stmt = data_stmt.where(Task.task_list_id == list_id)
            count_stmt = count_stmt.where(Task.task_list_id == list_id)

        if filters.tags_ids:
            if not filters.match_all_tags:
                data_stmt = (
                    data_stmt
                    .join(TagTaskLink)
                    .where(col(TagTaskLink.tag_id).in_(filters.tags_ids))
                    .distinct()
                )
                count_stmt = (
                    count_stmt
                    .join(TagTaskLink)
                    .where(col(TagTaskLink.tag_id).in_(filters.tags_ids))
                )
            else:
                subq = (
                    select(Task.id)
                    .join(TagTaskLink)
                    .where(TagTaskLink.tag_id.in_(filters.tags_ids)) # type: ignore
                    .group_by(Task.id) # type: ignore
                    .having(
                        func.count(
                            func.distinct(TagTaskLink.tag_id)
                            ) == len(filters.tags_ids)
                        )
                ).subquery()
                data_stmt = data_stmt.join(subq, Task.id == subq.c.id)
                count_stmt = count_stmt.join(subq, Task.id == subq.c.id) # type: ignore

    # Сортировка
        sort_mapping = {
            TaskSortType.CREATED_AT: Task.created_at,
            TaskSortType.TITLE: Task.title,
            TaskSortType.DEADLINE: Task.deadline,
        }

        sort_column = sort_mapping.get(filters.sort_by, Task.created_at)

        if filters.sort_by == TaskSortType.DEADLINE:
            if filters.order == OrderType.DESC:
                data_stmt = data_stmt.order_by(nulls_last(sort_column.desc()))
            else:
                data_stmt = data_stmt.order_by(nulls_last(sort_column.asc()))
        else:
            if filters.order == OrderType.DESC:
                data_stmt = data_stmt.order_by(sort_column.desc())
            else:
                data_stmt = data_stmt.order_by(sort_column.asc())

    # Пагинация
        offset = (filters.page - 1) * filters.size
        data_stmt = data_stmt.offset(offset).limit(filters.size)

    # Выполнение
        data_result = await self.session.execute(data_stmt)
        count_result = await self.session.execute(count_stmt)

        rows = data_result.all()
        total_count = count_result.scalar_one() or 0

        return rows, total_count # type: ignore

    async def delete(self, db_task) -> None:
        """Удаление задачи"""
        await self.session.delete(db_task)
        await self.session.commit()

    async def archive_by_project(self, project_id: int) -> None:
        """Каскадное архивирование задачи при архивировании проекта"""
        stmt = (
            update(Task)
            .where(
                Task.task_list_id.in_(  # type: ignore
                    select(TaskList.id)
                    .where(TaskList.project_id == project_id)
                ),
                Task.is_archived == False  # type: ignore
            )
            .values(
                is_archived=True,
                archived_at=datetime.now(timezone.utc)
            )
        )

        await self.session.execute(stmt)
        await self.session.commit()

    async def unarchive_by_project(self, project_id: int) -> None:
        """Каскадное разархивирование задачи при разархивировании проекта"""
        stmt = (
            update(Task)
            .where(
                Task.task_list_id.in_(  # type: ignore
                    select(TaskList.id)
                    .where(TaskList.project_id == project_id)
                ),
                Task.is_archived == True  # type: ignore
            )
            .values(
                is_archived=False,
                archived_at=None
            )
        )

        await self.session.execute(stmt)
        await self.session.commit()

    async def archive_by_list(self, list_id: int) -> None:
        """Каскадное архивирование задачи при архивировании списка задач"""
        stmt = (
            update(Task)
            .where(
                Task.task_list_id == list_id,  # type: ignore
                Task.is_archived == False  # type: ignore
            )
            .values(
                is_archived=True,
                archived_at=datetime.now(timezone.utc)
            )
        )

        await self.session.execute(stmt)
        await self.session.commit()

    async def unarchive_by_list(self, list_id: int) -> None:
        """Каскадное разархивирование задачи при разархивировании списка задач"""
        stmt = (
            update(Task)
            .where(
                Task.task_list_id == list_id,  # type: ignore
                Task.is_archived == True  # type: ignore
            )
            .values(
                is_archived=False,
                archived_at=None
            )

        )

        await self.session.execute(stmt)
        await self.session.commit()

    async def add_tag(self, task_id: int, tag_id: int) -> None:
        """Добавление тега к задаче"""
        link = TagTaskLink(tag_id=tag_id, task_id=task_id)
        self.session.add(link)
        await self.session.commit()

    async def get_tasks_tag(self, task_id: int, tag_id: int) -> Optional[TagTaskLink]:
        """Получение связи тега и задачи"""
        stmt = (
            select(TagTaskLink)
            .where(
                TagTaskLink.task_id == task_id,
                TagTaskLink.tag_id == tag_id
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def remove_tag(self, link: TagTaskLink) -> None:
        """Удаление тега от задачи"""
        await self.session.delete(link)
        await self.session.commit()

    async def get_all_tags(self, task_id: int) -> list[Tag]:
        """Получение полного списка тегов у задачи"""
        stmt = (
            select(Tag)
            .join(TagTaskLink, Tag.id == TagTaskLink.tag_id)  # type: ignore
            .where(TagTaskLink.task_id == task_id)
        )

        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def unlink_all_tags(self, task_id: int) -> None:
        """Отвязка тегов от задачи при её архивировании"""
        stmt = delete(TagTaskLink).where(TagTaskLink.task_id == task_id)  # type: ignore
        await self.session.execute(stmt)
        await self.session.commit()

    async def unlink_all_tags_by_project(self, project_id: int) -> None:
        """Отвязка тегов от задачи при её каскадном архивировании при 
        архивировании проектов"""
        stmt = (
            delete(TagTaskLink)
            .where(
                TagTaskLink.task_id.in_(  # type: ignore
                    select(Task.id)
                    .where(
                        Task.task_list_id.in_(  # type: ignore
                            select(TaskList.id)
                            .where(TaskList.project_id == project_id)
                        )
                    )
                )
            )
        )
        await self.session.execute(stmt)
        await self.session.commit()

    async def unlink_all_tags_by_list(self, list_id: int) -> None:
        """Отвязка тегов от задачи при её каскадном архивировании при 
         архивировании проектов"""
        stmt = (
            delete(TagTaskLink)
            .where(
                TagTaskLink.task_id.in_(  # type: ignore
                    select(Task.id)
                    .where(
                        Task.task_list_id.in_(  # type: ignore
                            select(TaskList.id)
                            .where(TaskList.id == list_id)
                        )
                    )
                )
            )
        )
        await self.session.execute(stmt)
        await self.session.commit()

    async def update_progress(self, task_id, progress) -> None:
        """Обновление прогресса задачи при изменении её подзадач"""
        stmt = update(Task).where(Task.id == task_id).values(progress=progress)
        await self.session.execute(stmt)
        await self.session.commit()

    async def get_by_id_for_worker(self, task_id: int) -> Optional[Task]:
        """Получить задачу по ID без проверки пользователя. Для напоминаний"""
        stmt = select(Task).where(Task.id == task_id)

        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
