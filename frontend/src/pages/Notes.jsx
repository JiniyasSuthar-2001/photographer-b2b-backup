import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Plus, Check, X, Briefcase, Calendar as CalendarIcon,
  Search, Trash2, ClipboardList, Edit2, Save
} from 'lucide-react';
import { taskService } from '../services/api';
import './Notes.css';

export default function Notes() {
  const { state, dispatch, addToast } = useApp();
  const { jobs, jobTasks } = state;
  const [selectedJobId, setSelectedJobId] = useState(jobs[0]?.id || '');
  const [newTaskText, setNewTaskText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'completed'

  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim() || !selectedJobId) return;

    try {
      const newTask = await taskService.createTask({
        jobId: selectedJobId,
        text: newTaskText.trim()
      });
      dispatch({ type: 'ADD_TASK', payload: newTask });
      setNewTaskText('');
      addToast('Task added successfully', 'success');
    } catch (err) {
      addToast('Failed to add task', 'error');
    }
  };

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };

  const saveEdit = async () => {
    if (!editingText.trim()) return;
    try {
      const updated = await taskService.updateTask(editingTaskId, { text: editingText.trim() });
      dispatch({ type: 'UPDATE_TASK', payload: updated });
      setEditingTaskId(null);
      setEditingText('');
      addToast('Task updated', 'success');
    } catch (err) {
      addToast('Failed to update task', 'error');
    }
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setEditingText('');
  };

  const toggleTask = async (task) => {
    try {
      const updated = await taskService.updateTask(task.id, { completed: !task.completed });
      dispatch({ type: 'SET_TASKS', payload: state.jobTasks.map(t => t.id === task.id ? updated : t) });
    } catch (err) {
      addToast('Failed to update task', 'error');
    }
  };

  const deleteTask = async (taskId) => {
    if (confirm('Delete this task?')) {
      try {
        await taskService.deleteTask(taskId);
        dispatch({ type: 'DELETE_TASK', payload: taskId });
        addToast('Task removed', 'info');
      } catch (err) {
        addToast('Failed to delete task', 'error');
      }
    }
  };

  const tasksByJob = jobs.reduce((acc, job) => {
    acc[job.id] = jobTasks.filter(t => t.jobId === job.id && (
      t.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase())
    ) && (
      statusFilter === 'all' ||
      (statusFilter === 'completed' && t.completed) ||
      (statusFilter === 'pending' && !t.completed)
    ));
    return acc;
  }, {});

  return (
    <div className="notes-page">
      <header className="notes-header">
        <div>
          <h1 className="page-title">Job Notes & Tasks</h1>
          <p className="page-subtitle">Stay organized with per-job checklists</p>
        </div>
        <div className="notes-status-filter">
          {['all','pending','completed'].map(s => (
            <button
              key={s}
              className={`sub-tab ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </header>

      <div className="notes-grid">
        <aside className="notes-sidebar">
          <div className="card card-padding">
            <h3 className="section-title" style={{ marginBottom: 16 }}>Add New Task</h3>
            <form onSubmit={handleAddTask} className="task-form">
              <div className="input-group">
                <label className="input-label">Select Job</label>
                <select
                  className="input-field"
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                >
                  {jobs.map(job => (
                    <option key={job.id} value={job.id}>{job.title}</option>
                  ))}
                </select>
              </div>
              <div className="input-group" style={{ marginTop: 12 }}>
                <label className="input-label">What needs to be done?</label>
                <textarea
                  className="input-field"
                  placeholder="e.g. Charge batteries, Pack drone..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                />
              </div>
              <button className="btn btn-primary" style={{ marginTop: 16, width: '100%' }}>
                <Plus size={18} /> Add Task
              </button>
            </form>
          </div>
        </aside>

        <main className="notes-content">
          {jobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><ClipboardList size={32} /></div>
              <h3 className="empty-state-title">No projects found</h3>
              <p className="empty-state-desc">Post a new job to start adding notes.</p>
            </div>
          ) : (
            jobs.sort((a, b) => new Date(a.date) - new Date(b.date)).map(job => {
              const tasks = tasksByJob[job.id] || [];
              const completedCount = tasks.filter(t => t.completed).length;

              return (
                <div key={job.id} className="job-task-group card">
                  <div className="job-task-header">
                    <div className="job-info">
                      <div className="job-title-row">
                        <Briefcase size={16} color="var(--accent-blue)" />
                        <h3 className="job-title">{job.title}</h3>
                      </div>
                      <div className="job-meta">
                        <span className="job-date"><CalendarIcon size={12} /> {job.date}</span>
                        <span className="job-client">Client: {job.client}</span>
                      </div>
                    </div>
                    {tasks.length > 0 && (
                      <div className="job-progress">
                        <div className="progress-text">{completedCount} / {tasks.length} Done</div>
                        <div className="progress-bar-mini">
                          <div
                            className="progress-fill"
                            style={{ width: `${(completedCount / tasks.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="task-list">
                    {tasks.length === 0 ? (
                      <div className="task-item-empty">
                        <p>No notes for this project yet.</p>
                        <button className="btn-text-sm" onClick={() => {
                          setSelectedJobId(job.id);
                          document.querySelector('.task-form textarea')?.focus();
                        }}>
                          + Add first note
                        </button>
                      </div>
                    ) : (
                      tasks.map(task => (
                        <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''} ${editingTaskId === task.id ? 'editing' : ''}`}>
                          {editingTaskId === task.id ? (
                            <div className="task-edit-row">
                              <input
                                type="text"
                                className="input-field input-sm"
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                              />
                              <div style={{display: 'flex', gap: 4}}>
                                <button className="btn-icon-ghost" onClick={saveEdit}><Save size={16} /></button>
                                <button className="btn-icon-ghost" onClick={cancelEdit}><X size={16} /></button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <button
                                className="task-checkbox"
                                onClick={() => toggleTask(task)}
                                aria-label={task.completed ? "Mark as pending" : "Mark as completed"}
                              >
                                {task.completed && <Check size={14} />}
                              </button>
                              <span className="task-text">{task.text}</span>
                              <div className="task-actions">
                                <button
                                  className="task-action-btn edit"
                                  onClick={() => startEditing(task)}
                                  title="Edit"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  className="task-action-btn delete"
                                  onClick={() => deleteTask(task.id)}
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })
          )}
        </main>
      </div>
    </div>
  );
}
