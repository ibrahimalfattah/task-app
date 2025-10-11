import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3002';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(true);

  // Fetch tasks from API
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tasks`);
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setLoading(false);
    }
  };

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    try {
      const response = await axios.post(`${API_URL}/api/tasks`, newTask);
      setTasks([response.data, ...tasks]);
      setNewTask({ title: '', description: '' });
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const toggleTask = async (id, completed) => {
    try {
      const response = await axios.put(`${API_URL}/api/tasks/${id}`, { completed: !completed });
      setTasks(tasks.map(task => task.id === id ? response.data : task));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/tasks/${id}`);
      setTasks(tasks.filter(task => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>📋 Task Manager</h1>
          <p>Manage your daily tasks efficiently</p>
        </header>

        <form className="task-form" onSubmit={addTask}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Task title..."
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="input-field"
            />
            <textarea
              placeholder="Description (optional)..."
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="textarea-field"
              rows="2"
            />
            <button type="submit" className="add-btn">
              ➕ Add Task
            </button>
          </div>
        </form>

        <div className="tasks-section">
          <h2>Tasks ({tasks.length})</h2>
          
          {tasks.length === 0 ? (
            <div className="empty-state">
              <p>🎉 No tasks yet! Add one above to get started.</p>
            </div>
          ) : (
            <div className="tasks-list">
              {tasks.map(task => (
                <div key={task.id} className={`task-card ${task.completed ? 'completed' : ''}`}>
                  <div className="task-content">
                    <h3 className="task-title">{task.title}</h3>
                    {task.description && (
                      <p className="task-description">{task.description}</p>
                    )}
                    <span className="task-date">
                      {new Date(task.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="task-actions">
                    <button
                      onClick={() => toggleTask(task.id, task.completed)}
                      className={`toggle-btn ${task.completed ? 'completed' : ''}`}
                    >
                      {task.completed ? '✅' : '⏳'}
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="delete-btn"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;