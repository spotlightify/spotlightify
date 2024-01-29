import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Spotlightify from './Spotlightify';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Spotlightify />} />
      </Routes>
    </Router>
  );
}
