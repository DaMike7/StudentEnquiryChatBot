import React from 'react';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter , RouterProvider } from 'react-router';
import './index.css'
import App from './App.jsx'
import SignUp from './Signup.jsx';
import ChatInterface from './Interface.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },
  {
    path: '/signup',
    element: <SignUp />
  },
  {
    path: '/chat/interface',
    element: <ChatInterface/>
  },
])


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)