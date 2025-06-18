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
  updateDoc,
  setDoc,
  getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';
import Comments from './Comments';

export default function Todo() {
  const [task, setTask] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isEditing, setIsEditing] = useState(null);
  const [editText, setEditText] = useState('');
  const [showCommentsFor, setShowCommentsFor] = useState(null);
  const [search, setSearch] = useState('');


  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    initUserSettings(user.uid);

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

  const initUserSettings = async (uid) => {
    const ref = doc(db, 'userSettings', uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { filter: 'all' });
    } else {
      setFilter(snap.data().filter);
    }
  };

  const handleAdd = async () => {
    if (task.trim() === '') return;

    await addDoc(collection(db, 'todos'), {
      uid: user.uid,
      text: task,
      completed: false,
      dueDate: dueDate || 'No due date',
      createdAt: serverTimestamp()
    });

    // 🔔 Reminder Notification
    if (Notification.permission === 'granted' && dueDate) {
      const delay = new Date(dueDate) - new Date();
      if (delay > 0) {
        setTimeout(() => {
          new Notification(`Reminder: ${task}`);
        }, delay);
      }
    }

    setTask('');
    setDueDate('');
  };

  const toggleTodo = async (todo) => {
    const todoRef = doc(db, 'todos', todo.id);
    await updateDoc(todoRef, {
      completed: !todo.completed,
    });
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'todos', id));
  };

  const handleEdit = async (todo) => {
    const todoRef = doc(db, 'todos', todo.id);
    await updateDoc(todoRef, { text: editText });
    setIsEditing(null);
    setEditText('');
  };

  const sortedTodos = [...todos].sort(
    (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
  );

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

      {/* 🔽 Filter Dropdown */}
      <select
        value={filter}
        onChange={async (e) => {
          const newFilter = e.target.value;
          setFilter(newFilter);
          await setDoc(
            doc(db, 'userSettings', user.uid),
            { filter: newFilter },
            { merge: true }
          );
        }}
        style={{ marginBottom: '20px' }}
      >
        <option value="all">All</option>
        <option value="completed">Completed</option>
        <option value="pending">Pending</option>
      </select>

    

<div style={{ display: 'flex', justifyContent: 'center' }}>
  <input
    type="text"
    placeholder="Search tasks..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    style={{
      width: '100%',
      maxWidth: '400px',
      padding: '8px',
      marginBottom: '20px',
      borderRadius: '6px',
      border: '1px solid #ccc',
    }}
  />
</div>
      <ul className="todo-list">
        <AnimatePresence>
         {sortedTodos
  .filter((todo) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'completed' && todo.completed) ||
      (filter === 'pending' && !todo.completed);
    const matchesSearch = todo.text.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  })

            .map((todo) => (
              <motion.li
                key={todo.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="todo-item"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo)}
                />

                {isEditing === todo.id ? (
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEdit(todo);
                    }}
                    onBlur={() => setIsEditing(null)}
                    autoFocus
                    className="edit-input"
                  />
                ) : (
                  <span
                    className="todo-text"
                    style={{
                      textDecoration: todo.completed ? 'line-through' : 'none',
                      color: todo.completed ? '#aaa' : '#000',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setIsEditing(todo.id);
                      setEditText(todo.text);
                    }}
                  >
                    {todo.text} - Due: {todo.dueDate}
                  </span>
                )}

                <button onClick={() => handleDelete(todo.id)} className="delete-button">
                  ❌
                </button>

                <button onClick={() => setShowCommentsFor(todo.id)}>
                  💬 {showCommentsFor === todo.id ? 'Hide' : 'Show'} Comments
                </button>

                {showCommentsFor === todo.id && (
                  <Comments todoId={todo.id} />
                )}

                
              </motion.li>
            ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
