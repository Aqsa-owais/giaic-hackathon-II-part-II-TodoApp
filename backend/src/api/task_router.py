from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List
from ..services.task_service import (
    create_task, get_tasks_by_user, get_task_by_id_with_user_check,
    update_task, delete_task, toggle_task_completion, verify_user_owns_task
)
from ..models.todo_task import TodoTask, TodoTaskCreate, TodoTaskUpdate, TodoTaskRead
from .database import get_session
from ..middleware.jwt_auth_middleware import jwt_auth
from ..models.user import User
import uuid


task_router = APIRouter()


@task_router.get("/{user_id}/tasks", response_model=List[TodoTaskRead])
def get_user_tasks(
    user_id: str,
    current_user_id: str = Depends(jwt_auth),
    session: Session = Depends(get_session)
):
    """Get all tasks for a specific user"""
    # Verify that the requested user_id matches the authenticated user
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Cannot access another user's tasks"
        )

    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )

    tasks = get_tasks_by_user(user_uuid, session)
    return tasks


@task_router.post("/{user_id}/tasks", response_model=TodoTaskRead, status_code=status.HTTP_201_CREATED)
def create_user_task(
    user_id: str,
    task_create: TodoTaskCreate,
    current_user_id: str = Depends(jwt_auth),
    session: Session = Depends(get_session)
):
    """Create a new task for the authenticated user"""
    # Verify that the path user_id matches the authenticated user
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Cannot create tasks for another user"
        )

    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )

    # Create the task object directly with user_id already set
    db_task = TodoTask(
        title=task_create.title,
        description=task_create.description,
        is_completed=task_create.is_completed,
        user_id=user_uuid
    )

    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task


@task_router.get("/{user_id}/tasks/{id}", response_model=TodoTaskRead)
def get_user_task(
    user_id: str,
    id: str,
    current_user_id: str = Depends(jwt_auth),
    session: Session = Depends(get_session)
):
    """Get a specific task for the authenticated user"""
    # Verify that the requested user_id matches the authenticated user
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Cannot access another user's tasks"
        )

    try:
        task_uuid = uuid.UUID(id)
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ID format"
        )

    task = get_task_by_id_with_user_check(task_uuid, user_uuid, session)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or doesn't belong to user"
        )

    return task


@task_router.put("/{user_id}/tasks/{id}", response_model=TodoTaskRead)
def update_user_task(
    user_id: str,
    id: str,
    task_update: TodoTaskUpdate,
    current_user_id: str = Depends(jwt_auth),
    session: Session = Depends(get_session)
):
    """Update a specific task for the authenticated user"""
    # Verify that the path user_id matches the authenticated user
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Cannot update another user's tasks"
        )

    try:
        task_uuid = uuid.UUID(id)
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ID format"
        )

    # Verify that the task belongs to the user
    if not verify_user_owns_task(task_uuid, user_uuid, session):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or doesn't belong to user"
        )

    updated_task = update_task(task_uuid, task_update, session)
    if not updated_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return updated_task


@task_router.delete("/{user_id}/tasks/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_task(
    user_id: str,
    id: str,
    current_user_id: str = Depends(jwt_auth),
    session: Session = Depends(get_session)
):
    """Delete a specific task for the authenticated user"""
    # Verify that the path user_id matches the authenticated user
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Cannot delete another user's tasks"
        )

    try:
        task_uuid = uuid.UUID(id)
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ID format"
        )

    # Verify that the task belongs to the user
    if not verify_user_owns_task(task_uuid, user_uuid, session):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or doesn't belong to user"
        )

    success = delete_task(task_uuid, session)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return


@task_router.patch("/{user_id}/tasks/{id}/complete", response_model=TodoTaskRead)
def toggle_task_completion_status(
    user_id: str,
    id: str,
    current_user_id: str = Depends(jwt_auth),
    session: Session = Depends(get_session)
):
    """Toggle the completion status of a specific task for the authenticated user"""
    # Verify that the path user_id matches the authenticated user
    if user_id != current_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Cannot modify another user's tasks"
        )

    try:
        task_uuid = uuid.UUID(id)
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ID format"
        )

    # Verify that the task belongs to the user
    if not verify_user_owns_task(task_uuid, user_uuid, session):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found or doesn't belong to user"
        )

    toggled_task = toggle_task_completion(task_uuid, session)
    if not toggled_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return toggled_task