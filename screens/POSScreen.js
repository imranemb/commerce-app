import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, Button, TouchableOpacity,
  StyleSheet, SafeAreaView, Alert, Modal, TextInput, Pressable
} from 'react-native';


export default function POSScreen() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [phone, setPhone] = useState('');
  const fetchProducts = async () => {
    const res = await fetch(`http://10.1.7.95:3000/products`);
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();

   // const interval = setInterval(() => {
   // fetchProducts(); // mise à jour régulière
 // }, 5000); // toutes les 5 secondes

  //return () => clearInterval(interval); // nettoie le timer au démontage
  }, []);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item._id === product._id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) =>
      prev
        .map((item) => (item._id === id ? { ...item, qty: item.qty - 1 } : item))
        .filter((item) => item.qty > 0)
    );
  };

const validateSale = async () => {
  try {
    // 🔍 Vérification du panier
    if (!Array.isArray(cart) || cart.length === 0) {
      Alert.alert("❌ Panier vide");
      return;
    }
 if (!firstName || !lastName || !phone) {
  Alert.alert("❌ Merci de remplir les infos client.");
  return;
}
    // 🔍 Vérification du contenu du panier
    for (const item of cart) {
      if (!item._id || !item.qty || !item.price) {
        console.error("❌ Problème dans un item du panier :", item);
        Alert.alert("❌ Données invalides dans un produit du panier");
        return;
      }
    }

    const payload = {
      items: cart.map((item) => ({
        productId: item._id,
        quantity: item.qty,
        price: item.price,
      })),
      total: cart.reduce((sum, item) => sum + item.qty * item.price, 0),
      customer: {
    firstName,
    lastName,
    phone,
  },
      date: new Date(),
    };

    console.log("📦 Données envoyées à /sell :", JSON.stringify(payload, null, 2));

    const res = await fetch(`http://10.1.7.95:3000/sell`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    console.log("✅ Réponse backend :", result);

    if (res.ok) {
      Alert.alert("✅ Vente validée !");
      setCart([]);
      setShowCart(false);
      fetchProducts();
    } else {
      Alert.alert("❌ Erreur lors de l'envoi", result?.message || "Erreur inconnue");
    }
  } catch (e) {
    console.error("💥 Exception lors de validateSale:", e);
    Alert.alert("Erreur réseau", e.message);
  }
};


  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>🧾 POS - Sélectionnez les produits</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.product}>
            <Text>{item.name} - {item.price}€</Text>
            <Pressable style={styles.primaryButton} onPress={() => addToCart(item)}>
  <Text style={styles.primaryButtonText}>Ajouter</Text>
</Pressable>
          </View>
        )}
      />
      <TouchableOpacity style={styles.cartButton} onPress={() => setShowCart(true)}>
        <Text style={styles.cartText}>🛍️ Panier ({cart.length})</Text>
      </TouchableOpacity>

      <Modal
        visible={showCart}
        animationType="slide"
        onRequestClose={() => setShowCart(false)}
      >
        <View style={{ flex: 1, padding: 20 }}>
          <Text style={styles.title}>🛒 Panier</Text>
          {cart.length === 0 ? (
            <Text>Panier vide</Text>
          ) : (
            <>
              {cart.map((item) => (
                <View key={item._id} style={styles.cartItem}>
                  <Text>{item.name} x {item.qty} = {(item.qty * item.price).toFixed(2)} €</Text>
                  <Pressable style={styles.removeButton} onPress={() => removeFromCart(item._id)}>
  <Text style={styles.removeButtonText}>−</Text>
</Pressable>
                </View>
              ))}
              <Text style={{ marginTop: 10, fontWeight: 'bold' }}>
                Total : {cart.reduce((sum, item) => sum + item.qty * item.price, 0).toFixed(2)} €
              </Text>
              <View style={{ marginVertical: 10 }}>
  <Text>👤 Prénom</Text>
  <TextInput
    value={firstName}
    onChangeText={setFirstName}
    placeholder="Prénom"
    style={styles.input}
  />
  <Text>👤 Nom</Text>
  <TextInput
    value={lastName}
    onChangeText={setLastName}
    placeholder="Nom"
    style={styles.input}
  />
  <Text>📞 Téléphone</Text>
  <TextInput
    value={phone}
    onChangeText={setPhone}
    placeholder="Téléphone"
    keyboardType="phone-pad"
    style={styles.input}
  />
</View>
              <Pressable style={styles.successButton} onPress={validateSale}>
  <Text style={styles.successButtonText}>Valider la vente</Text>
</Pressable>
            </>
          )}
          <View style={{ marginTop: 20 }}>
            <Pressable style={styles.secondaryButton} onPress={() => setShowCart(false)}>
  <Text style={styles.secondaryButtonText}>Fermer</Text>
</Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F7FA', // fond doux, légerement bleuté
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#1E293B',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  product: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 14,
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 2,
  },
  cartButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#2563EB', // bleu moderne
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 30,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 3,
  },
  cartText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.5,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: '#CBD5E1',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    fontSize: 16,
    color: '#1F2937',
    marginVertical: 8,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  removeButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  successButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  successButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#334155',
    fontWeight: '600',
    fontSize: 15,
  },
});

