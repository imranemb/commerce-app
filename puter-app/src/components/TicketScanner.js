import React, { useState, useEffect, useCallback } from 'react';

export default function TicketScanner({ onResult, imageUrl }) {
  const [loading, setLoading] = useState(false);

  const handleScan = useCallback(async (imageUrl) => {
    if (!imageUrl) return;
    setLoading(true);
    try {
      const prompt = `
Lis ce ticket de caisse et retourne-moi les produits sous forme JSON dans ce format :

{
  "items": [
    {
      "name": "Nom du produit",
      "quantity": 1,
      "price": 12.5
    }
  ],
  "total": 99.99
}

Ne retourne rien d’autre que le JSON. Ne mets aucun texte autour. Si tu vois un prix total, inclus-le. Sinon additionne les prix * quantités.`;

      const result = await window.puter.ai.chat(prompt, imageUrl);
      console.log("Résultat Puter:", result);

      if (onResult) {
        const jsonOnly = JSON.parse(result.message.content);
        onResult(jsonOnly);
      }
    } catch (err) {
      console.error("Erreur lors du scan:", err);
    } finally {
      setLoading(false);
    }
  }, [onResult]); // dépendance ici nécessaire si onResult peut changer

  useEffect(() => {
    if (imageUrl) {
      handleScan(imageUrl);
    }
  }, [imageUrl, handleScan]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Scanner le Ticket de Caisse</h2>
      <input
        id="ticket-url"
        type="text"
        placeholder="Entrer l’URL de l’image du ticket"
        style={{ width: "80%" }}
      />
      <button
        onClick={() => {
          const url = document.getElementById("ticket-url").value;
          if (url) {
            handleScan(url);
          }
        }}
      >
        {loading ? "Chargement..." : "Analyser le ticket"}
      </button>
    </div>
  );
}
