import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Signup from './pages/Signup';

// placeholders; real pages will be added in later branches
function Dashboard(){ return <div /> }
function Editor()  { return <div /> }
function Profile() { return <div /> }

const isAuthed = () => !!localStorage.getItem('token');


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>} />
        

        <Route path="/signup" element={<Signup/>} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
        <Route path="/editor" element={<ProtectedRoute><Editor/></ProtectedRoute>} />
        <Route path="/editor/:id" element={<ProtectedRoute><Editor/></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>} />

        <Route path="*" element={<Navigate to={isAuthed()?"/dashboard":"/login"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
