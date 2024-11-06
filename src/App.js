// src/App.js
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { db } from './firebase';
import { collection, onSnapshot, updateDoc, doc, addDoc, deleteDoc, writeBatch, getDocs} from "firebase/firestore";
import './App.css';

Modal.setAppElement('#root');

function App() {
  const [players, setPlayers] = useState([]);
  const [name, setName] = useState('');
  const [status, setStatus] = useState('Спрятался');
  const [hintInput, setHintInput] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    const playersCollection = collection(db, 'players');
    const unsubscribe = onSnapshot(playersCollection, (snapshot) => {
      const playersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlayers(playersData);
    });
    return unsubscribe;
  }, []);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
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
    const playerRef = doc(db, 'players', id);
    await deleteDoc(playerRef);
  };

  const rebootGame = async () => {
    const batch = writeBatch(db);
    const playersCollection = collection(db, 'players');
    const snapshot = await getDocs(playersCollection);
    
    snapshot.forEach(playerDoc => { 
      const playerRef = doc(db, 'players', playerDoc.id);
      batch.update(playerRef, {
        status: 'Вне игры',
        hints: []
      });
    });

    await batch.commit();
  };
  

  const addHint = async (id) => {
    const playerRef = doc(db, 'players', id);
    const player = players.find(player => player.id === id);
    
    if (player) {
      const hints = Array.isArray(player.hints) ? player.hints : [];
      await updateDoc(playerRef, {
        hints: [...hints, hintInput],
      });
      setHintInput('');
    }
  };

const removeHint = async (id, hintToRemove) => {
  const playerRef = doc(db, 'players', id);
  const player = players.find(player => player.id === id);

  if (player) {
    const updatedHints = player.hints.filter(hint => hint !== hintToRemove);
    await updateDoc(playerRef, {
      hints: updatedHints,
    });
  }
};

  return (
    <div className="App">
      

      {/* Кнопка для открытия модального окна */}
      <button onClick={openModal} className="add-player-button">
        <b>Добавить участника</b>
      </button>
      <button onClick={rebootGame} className="reboot-button">
        <b>RebootGame</b>
      </button>

      {/* Модальное окно с формой добавления участника */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="Modal"
        overlayClassName="Overlay"
      >
        <p><b>Добавить участника</b></p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Имя участника"
        />
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
        <b><h2>Прячутся</h2></b>
          {players.filter(player => player.status === 'Спрятался').map(player => (
            <div key={player.id} className="player Спрятался">
              <b><p>{player.name}</p></b>
              <p>Status: <span><b>{player.status}</b></span></p>
              <button onClick={() => toggleStatus(player.id, player.status)}>
                Сменить статус
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
                <button onClick={() => removeHint(player.id, hint)} className="remove-hint-button">
                  &#10006; {/* Крестик для удаления */}
                </button>
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
                Сменить статус
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
                Вернуть в игру
              </button>
              <button onClick={() => removePlayer(player.id)}>
                Удалить
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
