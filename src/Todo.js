import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function Todo() {
  const [task, setTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [todos, setTodos] = useState([]);

  const user = auth.currentUser;

  // 🔄 Real-time fetch of user's todos
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'todos'), where('uid', '==', user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasks = [];
      querySnapshot.forEach((doc) => {
        tasks.push({ id: doc.id, ...doc.data() });
      });
      setTodos(tasks);
    });

    return () => unsubscribe();
  }, [user]);

  // ➕ Add todo
  const handleAdd = async () => {
    if (task.trim() === '') return;
    await addDoc(collection(db, 'todos'), {
      uid: user.uid,
      text: task,
      completed: false,
      dueDate: dueDate || 'No due date',
    });
    setTask('');
    setDueDate('');
  };

  // ✅ Toggle completed
  const toggleTodo = async (todo) => {
    const todoRef = doc(db, 'todos', todo.id);
    await updateDoc(todoRef, {
      completed: !todo.completed,
    });
  };

  // ❌ Delete todo
  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'todos', id));
  };

  return (
    <div className="container">
      <h2>Todo List for {user.email}</h2>
      <button onClick={() => signOut(auth)}>🚪 Logout</button>

      <div className="input-container">
        <input
          type="text"
          placeholder="New task"
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="date-input"
        />
        <button onClick={handleAdd} className="add-button">➕ Add</button>
      </div>

      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo.id} className="todo-item">
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo)}
            />
            <span
              className="todo-text"
              style={{
                textDecoration: todo.completed ? 'line-through' : 'none',
                color: todo.completed ? '#aaa' : '#000',
              }}
            >
              {todo.text} - Due: {todo.dueDate}
            </span>
            <button onClick={() => handleDelete(todo.id)} className="delete-button">
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
