#!/bin/bash

# Arrêt sur erreur
set -e

echo "Démarrage du backend/server.js sur le port 3000 avec clear cache..."
cd backend

export PORT=3000
node server.js --clear &

echo "Démarrage du puter-app sur le port 3001 avec clear cache..."
cd ../puter-app
export BROWSER=none
PORT=3001 npm run start &

echo "Démarrage du mobile-app avec clear cache..."
cd ../mobile-app
npm run start &

wait
