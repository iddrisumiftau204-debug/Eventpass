import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import EventList from './pages/EventList.jsx';
import EventDetail from './pages/EventDetail.jsx';
import CheckIn from './pages/CheckIn.jsx';

export default function App() {
  return (
    <>
      <NavBar />
      <main>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <EventList />
              </RequireAuth>
            }
          />
          <Route
            path="/events/:id"
            element={
              <RequireAuth>
                <EventDetail />
              </RequireAuth>
            }
          />
          <Route
            path="/checkin"
            element={
              <RequireAuth>
                <CheckIn />
              </RequireAuth>
            }
          />
        </Routes>
      </main>
    </>
  );
}
