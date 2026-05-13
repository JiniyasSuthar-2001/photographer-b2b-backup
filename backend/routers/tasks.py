from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from models.models import Task, Job, Assignment
from models import models
from .auth import get_current_user
from core.websocket import manager
from models.schemas import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("/")
async def get_tasks(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Fetch tasks for jobs owned by OR assigned to the user
    owned_job_ids = [j.id for j in current_user.jobs_owned]
    assigned_job_ids = [a.job_id for a in current_user.assignments]
    all_job_ids = list(set(owned_job_ids + assigned_job_ids))
    
    tasks = db.query(Task).filter(Task.job_id.in_(all_job_ids)).all()
    return tasks

@router.post("/", response_model=TaskResponse)
async def create_task(task_data: TaskCreate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    # Verify job ownership or assignment
    job = db.query(Job).filter(Job.id == task_data.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    is_owner = job.user_id == current_user.id
    is_assigned = db.query(Assignment).filter(
        Assignment.job_id == job.id, 
        Assignment.member_id == current_user.id
    ).first() is not None
    
    if not (is_owner or is_assigned):
        raise HTTPException(status_code=403, detail="Not authorized to add tasks to this job")
    
    new_task = Task(
        job_id=task_data.job_id,
        text=task_data.text,
        completed=False
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    
    # WebSocket Refresh for all authorized parties
    await manager.send_personal_message({"type": "REFRESH_PAGE", "page": "tasks"}, job.user_id)
    assignments = db.query(Assignment).filter(Assignment.job_id == job.id).all()
    for assign in assignments:
        await manager.send_personal_message({"type": "REFRESH_PAGE", "page": "tasks"}, assign.member_id)
        
    return new_task

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(task_id: int, update_data: TaskUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    task = db.query(Task).get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Verify ownership or assignment through the job
    is_owner = task.job.user_id == current_user.id
    is_assigned = db.query(Assignment).filter(
        Assignment.job_id == task.job_id, 
        Assignment.member_id == current_user.id
    ).first() is not None
    
    if not (is_owner or is_assigned):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if update_data.text is not None:
        task.text = update_data.text
    if update_data.completed is not None:
        task.completed = update_data.completed
        
    db.commit()
    db.refresh(task)
    
    # WebSocket Refresh
    await manager.send_personal_message({"type": "REFRESH_PAGE", "page": "tasks"}, task.job.user_id)
    assignments = db.query(Assignment).filter(Assignment.job_id == task.job_id).all()
    for assign in assignments:
        await manager.send_personal_message({"type": "REFRESH_PAGE", "page": "tasks"}, assign.member_id)
        
    return task

@router.delete("/{task_id}")
async def delete_task(task_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    task = db.query(Task).get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.job.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db.delete(task)
    db.commit()
    
    # WebSocket Refresh
    await manager.send_personal_message({"type": "REFRESH_PAGE", "page": "tasks"}, task.job.user_id)
    assignments = db.query(Assignment).filter(Assignment.job_id == task.job_id).all()
    for assign in assignments:
        await manager.send_personal_message({"type": "REFRESH_PAGE", "page": "tasks"}, assign.member_id)
        
    return {"status": "deleted"}
