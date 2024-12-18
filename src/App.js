// src/App.js
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { db } from './firebase';
import { collection, onSnapshot, updateDoc, doc, addDoc, deleteDoc, writeBatch, getDocs } from "firebase/firestore";
import './App.css';

Modal.setAppElement('#root');

function App() {
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('Спрятался');
  const [hintInput, setHintInput] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');

  useEffect(() => {
    const playersCollection = collection(db, 'players');
    const unsubscribe = onSnapshot(playersCollection, (snapshot) => {
      const playersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlayers(playersData);
    });
    return unsubscribe;
  }, []);

  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);

  const openLoginModal = () => setLoginModalIsOpen(true);
  const closeLoginModal = () => setLoginModalIsOpen(false);

  const handleAdminLogin = () => {
    if (passwordInput === 'Admin123') {
      setIsAdmin(true);
      closeLoginModal();
    } else {
      alert("Неверный пароль!");
    }
  };

  const addPlayer = async () => {
    if (name) {
      await addDoc(collection(db, 'players'), { name, status, hints: [] });
      setName('');
      setStatus('Спрятался');
      closeModal();
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const playerRef = doc(db, 'players', id);
    let newStatus = currentStatus === 'Спрятался' ? 'Найден' : currentStatus === 'Найден' ? 'Вне игры' : 'Спрятался';
    await updateDoc(playerRef, { status: newStatus });
  };

  const removePlayer = async (id) => {
    if (isAdmin) {
      const playerRef = doc(db, 'players', id);
      await deleteDoc(playerRef);
    }
  };

  const rebootGame = async () => {
    if (isAdmin && window.confirm("Вы уверены, что хотите перезапустить игру?")) {
      const batch = writeBatch(db);
      const playersCollection = collection(db, 'players');
      const snapshot = await getDocs(playersCollection);
      snapshot.forEach(playerDoc => {
        const playerRef = doc(db, 'players', playerDoc.id);
        batch.update(playerRef, { status: 'Вне игры', hints: [] });
      });
      await batch.commit();
    }
  };

  const addHint = async (id) => {
    const playerRef = doc(db, 'players', id);
    const player = players.find(player => player.id === id);
    if (player) {
      const hints = Array.isArray(player.hints) ? player.hints : [];
      await updateDoc(playerRef, { hints: [...hints, hintInput] });
      setHintInput('');
    }
  };

  const removeHint = async (id, hintToRemove) => {
    if (isAdmin) {
      const playerRef = doc(db, 'players', id);
      const player = players.find(player => player.id === id);
      if (player) {
        const updatedHints = player.hints.filter(hint => hint !== hintToRemove);
        await updateDoc(playerRef, { hints: updatedHints });
      }
    }
  };

  return (
    <div className="App">
      <h1><b>ВСЕМ ИГРОКАМ ПРИГОТОВИТЬСЯ</b></h1>
      <button onClick={openModal} className="add-player-button"><b>Зайти в игру!</b></button>
      
      
      {isAdmin && (
        <button onClick={rebootGame} className="reboot-button"><b>Reboot Game</b></button>
      )}

      {isAdmin && (
        <button onClick={() => setIsAdmin(false)} className="admin-logout-button">Выйти из режима администратора</button>
      )}

      <Modal isOpen={loginModalIsOpen} onRequestClose={closeLoginModal} className="Modal" overlayClassName="Overlay">
        <h2 className="admin_panel">Вход администратора</h2>
        <p className="admin_panel">Пиши пароль</p>
        <input
          type="password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          placeholder="Введите пароль"
        />
        <button onClick={handleAdminLogin}>Войти</button>
        <button onClick={closeLoginModal}>Отмена</button>
      </Modal>

      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} className="Modal" overlayClassName="Overlay">
        <p><b>Добавить участника</b></p>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя участника" />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="Спрятался">Спрятался</option>
          <option value="Найден">Найден</option>
          <option value="Вне игры">Вне игры</option>
        </select>
        <button onClick={addPlayer}>Добавить</button>
        <button onClick={closeModal}>Отмена</button>
      </Modal>

      <div className="players-list">
        <div className="active-players">
          {players.filter(player => player.status === 'Спрятался').map(player => (
            <div key={player.id} className="player Спрятался">
              <b><p>{player.name}</p></b>
              <p>Status: <span><b>{player.status}</b></span></p>
              <button onClick={() => toggleStatus(player.id, player.status)}>
                выходи дибил нашли тебя ...
              </button>
              <button onClick={() => addHint(player.id)} className="hint-button">+</button>
              <input
                type="text"
                value={hintInput}
                onChange={(e) => setHintInput(e.target.value)}
                placeholder="Добавить подсказку"
                className="hint-input"
              />
              {player.hints && player.hints.map((hint, index) => (
              <div key={index} className="hint">
                <p>Подсказка: {hint}</p>
                {isAdmin && (
                  <button onClick={() => removeHint(player.id, hint)} className="remove-hint-button">
                    &#10006;
                  </button>
                )}
              </div>
            ))}
            </div>
          ))}

          <hr className="divider" />

          <h2>Ищут</h2>
          {players.filter(player => player.status === 'Найден').map(player => (
            <div key={player.id} className="player Найден">
              <p>{player.name}</p>
              <p>Status: <span>{player.status}</span></p>
              <button onClick={() => toggleStatus(player.id, player.status)}>
                Сдаться ...
              </button>
            </div>
          ))}
        </div>

        <hr className="divider" />

        <div className="inactive-players">
          <h2>Вне игры</h2>
          {players.filter(player => player.status === 'Вне игры').map(player => (
            <div key={player.id} className="player Inactive">
              <p>{player.name}</p>
              <p>Status: <span>{player.status}</span></p>
              <button onClick={() => toggleStatus(player.id, player.status)}>
                Вернуться в игру
              </button>
              <button onClick={() => removePlayer(player.id)}>
                Удалиться 
              </button>
            </div>
          ))}
        </div>
      </div>
      <footer className="footer">
        <div className="footer-content">
          <p className="footer-text">&copy; 2024 Игровые решения Closing opinion.</p>
          <div className="footer-buttons">
            {!isAdmin && (
              <button onClick={openLoginModal} className="admin-login-button">
                <b>Вход для администратора</b>
              </button>
            )}
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
