import { useState, useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import logo from 'assets/svg/spotify-logo.svg';
import './App.css';
import Prompt from './components/Prompt';
import Suggestion from './components/Suggestion/Suggestion';

function Spotlightify() {
  const [promptText, setPromptText] = useState('');
  const onPromptChange = (event: { target: { value: any } }) => {
    const { value } = event.target;
    setPromptText(value);
  };

  useEffect(() => {
    window.electron.setNumberOfSuggestions(promptText.length);
  }, [promptText]);

  return (
    <div className="base">
      <div className="input-wrapper">
        <img className="spotify-logo" src={logo} alt="spotify logo" />
        <Prompt value={promptText} onChange={onPromptChange} />
      </div>
      <div className="suggestions-wrapper">
        {promptText.split('').map(() => (
          <Suggestion />
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Spotlightify />} />
      </Routes>
    </Router>
  );
}
