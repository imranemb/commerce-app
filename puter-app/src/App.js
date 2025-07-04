import React, { useState, useEffect } from 'react';
import TicketScanner from './components/TicketScanner';
import { io } from 'socket.io-client';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const socket = io(BACKEND_URL, {
  transports: ['websocket'], // 👈 Force le transport
}); // 🔁 Mets l'IP du backend ici

function App() {
  const [result, setResult] = useState(null);
  const [photoUri, setPhotoUri] = useState('');

  // ⚡️ Connexion WebSocket
useEffect(() => {
  socket.on('connect', () => {
    console.log('Connecté au serveur WebSocket');
  });

   socket.on('connect_error', (err) => {
    console.error('❌ Erreur de connexion WebSocket :', err.message);
  });
  
  socket.on('welcome', (data) => {
    console.log('Message de bienvenue reçu:', data);
  });

  socket.on('new-ticket-image', ({ imageUrl }) => {
    console.log('Nouvelle image reçue par socket:', imageUrl);
    setPhotoUri(imageUrl);
  });

  return () => {
    socket.off('welcome');
    socket.off('new-ticket-image');
   
  };
}, []);


  // Appelle le backend avec le résultat analysésssss
  useEffect(() => {
    const sendTicket = async () => {
      if (!result) return;
      try {
        const response = await fetch(`${BACKEND_URL}/scan-ticket`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result),
        });
        const data = await response.json();
        console.log('Réponse du serveur :', data);
      } catch (error) {
        console.error('Erreur lors de l’envoi du ticket :', error);
      }
    };

    sendTicket();
  }, [result]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Plateforme de Scan de Ticket de Caisse</h1>
      <TicketScanner onResult={setResult} imageUrl={photoUri} />
      {result && (
        <pre style={{ backgroundColor: "#f7f7f7", padding: "20px" }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
      
    </div>
   
  );
}

export default App;
