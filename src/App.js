// src/App.js
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import './App.css';

function App() {
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('Спрятался');

  useEffect(() => {
    const unsubscribe = db.collection('players').onSnapshot(snapshot => {
      const playersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlayers(playersData);
    });
    return unsubscribe;
  }, []);

  const addPlayer = async () => {
    if (name) {
      await db.collection('players').add({ name, status });
      setName('');
      setStatus('Спрятался');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    await db.collection('players').doc(id).update({
      status: currentStatus === 'Спрятался' ? 'Найден' : 'Спрятался'
    });
  };

  return (
    <div className="App">
      <h1>Hide and Seek Game</h1>
      <div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Имя участника"
        />
        <button onClick={addPlayer}>Добавить</button>
      </div>

      <div className="players-list">
        {players.map(player => (
          <div key={player.id} className="player">
            <p>{player.name}</p>
            <p>Status: <span className={player.status}>{player.status}</span></p>
            <button onClick={() => toggleStatus(player.id, player.status)}>
              Сменить статус
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
