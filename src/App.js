// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './Register';
import Login from './Login';
import Todo from './Todo';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currUser) => {
      setUser(currUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ Protected Home Route */}
        <Route
          path="/"
          element={user ? <Todo /> : <Navigate to="/login" />}
        />

        {/* ✅ Login - redirect to home if already logged in */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <Login />}
        />

        {/* ✅ Register - redirect to home if already logged in */}
        <Route
          path="/register"
          element={user ? <Navigate to="/" /> : <Register />}
        />

        {/* ✅ Catch-all: redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
