// src/Comments.js
import React, { useState, useEffect } from 'react';
import {
  addDoc,
  collection,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import { auth } from './firebase'; // Assuming you're using auth.currentUser

export default function Comments({ todoId }) {
  const [text, setText] = useState('');
  const [comments, setComments] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    const ref = collection(db, 'todos', todoId, 'comments');
    const q = query(ref, orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) =>
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    );
    return () => unsubscribe();
  }, [todoId]);

  const handleAdd = async () => {
    if (!text.trim()) return;
    await addDoc(collection(db, 'todos', todoId, 'comments'), {
      text,
      uid: user.uid,
      createdAt: serverTimestamp(),
    });
    setText('');
  };

  return (
    <div className="comments-section">
      <ul>
        {comments.map((c) => (
          <li key={c.id}><b>{c.uid}:</b> {c.text}</li>
        ))}
      </ul>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment..."
      />
      <button onClick={handleAdd}>Comment</button>
    </div>
  );
}
