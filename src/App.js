import React, { useState,useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false); // NEW

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const nextMode = !prev;
      document.body.classList.toggle('dark', nextMode);
      return nextMode;
    });
  };
  

  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await axios.get('https://wft-geo-db.p.rapidapi.com/v1/geo/cities', {
        params: { namePrefix: query, limit: 5 },
        headers: {
          'X-RapidAPI-Key': '05032aa02emsh507f875393dab4ap17be40jsn5a2c2a321e62',
          'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
        }
      });

      setSuggestions(response.data.data.map(city => `${city.city}, ${city.countryCode}`));
    } catch (err) {
      console.error('City suggestion error:', err);
    }
  };

  const fetchWeather = async (cityName) => {
    const apiKey = '8adfb22d65ffdc2578a8dd5d7cf66f8e';
    const url = `http://api.weatherstack.com/current?access_key=${apiKey}&query=${cityName}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.success === false || !data.current) {
        setWeather(null);
        setError('City not found.');
      } else {
        setWeather(data);
        setError(null);
      }
    } catch (err) {
      setError('Failed to fetch weather.');
    }
  };

  const debounceTimeout=useRef(null);
  const handleInputChange = (e) => {
    const input = e.target.value;
    setCity(input);
    if (debounceTimeout.current)
    clearTimeout(debounceTimeout.current);
    debounceTimeout.current=setTimeout(()=>{
      fetchSuggestions(input);
    },300);
  };

  const handleSuggestionClick = (suggestion) => {
    setCity(suggestion);
    setSuggestions([]);
    fetchWeather(suggestion);
  };

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <div className="toggle-container">
        <button className="toggle-button" onClick={() => toggleDarkMode(!darkMode)}>
          {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </div>

      <h1 className="title">🌤 Weather App</h1>
      <div className="search-box">
        <input
          type="text"
          placeholder="Enter city name"
          value={city}
          onChange={handleInputChange}
        />
        <button onClick={() => fetchWeather(city)}>Get Weather</button>
      </div>

      {suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((s, i) => (
            <li key={i} onClick={() => handleSuggestionClick(s)}>
              {s}
            </li>
          ))}
        </ul>
      )}

      {error && <p className="error">{error}</p>}

      {weather && weather.current && (
        <div className="weather-box">
          <h2>{weather.location.name}, {weather.location.country}</h2>
          <img src={weather.current.weather_icons[0]} alt="Weather icon" />
          <p className="description">{weather.current.weather_descriptions[0]}</p>
          <div className="details">
            <p><strong>🌡 Temperature:</strong> {weather.current.temperature}°C</p>
            <p><strong>💧 Humidity:</strong> {weather.current.humidity}%</p>
            <p><strong>🧭 Wind Speed:</strong> {weather.current.wind_speed} km/h</p>
            <p><strong>🌇 Local Time:</strong> {weather.location.localtime}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
