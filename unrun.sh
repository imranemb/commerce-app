#!/bin/bash

echo "Arrêt de tous les processus Node.js liés au projet..."

# Trouver et tuer tous les node / npm / expo / react-native liés
# (⚠️ Vérifie bien avant sur ta machine)
pkill -f "node server.js"
pkill -f "npm"
pkill -f "expo"
pkill -f "react-native"

echo "Tous les processus ont été arrêtés."
