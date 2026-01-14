from sqlmodel import Session, select
from typing import List, Optional
from ..models.todo_task import TodoTask, TodoTaskCreate, TodoTaskUpdate
from ..models.user import User
import uuid


def create_task(task: TodoTaskCreate, session: Session) -> TodoTask:
    """Create a new task in the database"""
    # Create the task using the data from TodoTaskCreate
    task_data = task.dict()
    db_task = TodoTask(**task_data)
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task


def get_tasks_by_user(user_id: uuid.UUID, session: Session) -> List[TodoTask]:
    """Get all tasks for a specific user"""
    statement = select(TodoTask).where(TodoTask.user_id == user_id)
    tasks = session.exec(statement).all()
    return tasks


def get_task_by_id(task_id: uuid.UUID, session: Session) -> Optional[TodoTask]:
    """Get a specific task by ID"""
    statement = select(TodoTask).where(TodoTask.id == task_id)
    task = session.exec(statement).first()
    return task


def get_task_by_id_with_user_check(task_id: uuid.UUID, user_id: uuid.UUID, session: Session) -> Optional[TodoTask]:
    """Get a specific task by ID and verify it belongs to the specified user"""
    statement = select(TodoTask).where(TodoTask.id == task_id, TodoTask.user_id == user_id)
    task = session.exec(statement).first()
    return task


def update_task(task_id: uuid.UUID, task_update: TodoTaskUpdate, session: Session) -> Optional[TodoTask]:
    """Update a specific task"""
    db_task = get_task_by_id(task_id, session)
    if not db_task:
        return None

    # Update the fields that were provided
    for field, value in task_update.dict(exclude_unset=True).items():
        setattr(db_task, field, value)

    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task


def delete_task(task_id: uuid.UUID, session: Session) -> bool:
    """Delete a specific task"""
    db_task = get_task_by_id(task_id, session)
    if not db_task:
        return False

    session.delete(db_task)
    session.commit()
    return True


def toggle_task_completion(task_id: uuid.UUID, session: Session) -> Optional[TodoTask]:
    """Toggle the completion status of a specific task"""
    db_task = get_task_by_id(task_id, session)
    if not db_task:
        return None

    db_task.is_completed = not db_task.is_completed
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task


def verify_user_owns_task(task_id: uuid.UUID, user_id: uuid.UUID, session: Session) -> bool:
    """Verify that a user owns a specific task"""
    task = get_task_by_id_with_user_check(task_id, user_id, session)
    return task is not None