import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TextInput, Button, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Pressable
} from 'react-native';


export default function ProductScreen() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [editingProductId, setEditingProductId] = useState(null);

  const fetchProducts = async () => {
    const res = await fetch(`http://10.1.7.95:3000/products`);
    const data = await res.json();
    setProducts(data);
  
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setQuantity('');
    setEditingProductId(null);
  };

  const addOrUpdateProduct = async () => {
    if (!name.trim() || !price || !quantity) {
    alert("Veuillez remplir tous les champs avant de continuer.");
    return;
  }
    const product = { name, price: Number(price), quantity: Number(quantity) };
      console.log("editingProductId before:", editingProductId);
    if (editingProductId) {
      console.log("editingProductId after:", editingProductId);
      await fetch(`http://10.1.7.95:3000/products/${editingProductId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
    } else {
      await fetch(`http://10.1.7.95:3000/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
    }

    await fetchProducts();
    resetForm();
  };

  const deleteProduct = async (id) => {
    await fetch(`http://10.1.7.95:3000/products/${id}`, { method: 'DELETE' });
    fetchProducts();
    alert('Produit supprimé');
  };

  const startEdit = (product) => {
    setEditingProductId(product._id);
    setName(product.name);
    setPrice(String(product.price));
    setQuantity(String(product.quantity));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={styles.title}>Produits en stock</Text>

        {products.map((item) => (
          <View key={item._id} style={styles.productItem}>
            <Text>{item.name} - {item.price}€ - {item.quantity} pcs</Text>
            <View style={styles.buttonRow}>
              <Pressable style={styles.iconButton} onPress={() => startEdit(item)}>
  <Text style={styles.iconText}>✏️</Text>
</Pressable>
<Pressable style={styles.iconButtonDanger} onPress={() => deleteProduct(item._id)}>
  <Text style={styles.iconText}>🗑️</Text>
</Pressable>
            </View>
          </View>
        ))}

        <Text style={{ marginTop: 20, fontWeight: 'bold' }}>
          {editingProductId ? 'Modifier le produit' : 'Ajouter un produit'}
        </Text>

        <TextInput placeholder="Nom" value={name} onChangeText={setName} style={styles.input} />
        <TextInput placeholder="Prix" value={price} onChangeText={setPrice} keyboardType="numeric" style={styles.input} />
        <TextInput placeholder="Quantité" value={quantity} onChangeText={setQuantity} keyboardType="numeric" style={styles.input} />

        <Pressable
  style={[
    styles.primaryButton,
    (!name.trim() || !price || !quantity) && { opacity: 0.5 },
  ]}
  onPress={addOrUpdateProduct}
  disabled={!name.trim() || !price || !quantity}
>
  <Text style={styles.primaryButtonText}>
    {editingProductId ? "Mettre à jour" : "Ajouter"}
  </Text>
</Pressable>

        {editingProductId && (
          <View style={{ marginTop: 10 }}>
            <Pressable style={styles.secondaryButton} onPress={resetForm}>
  <Text style={styles.secondaryButtonText}>Annuler la modification</Text>
</Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  title: {
    padding: 20,
    paddingTop: 60,
    fontSize: 28,
    fontWeight: '600',
    color: '#1F2937', // slate-800
    marginBottom: 20,
    textAlign: 'center',
  },
  productItem: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#0f172a', // slate-900
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb', // gray-200
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    columnGap: 12,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F9FAFB', // gray-50
    borderWidth: 1,
    borderColor: '#E5E7EB', // gray-200
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    color: '#111827', // gray-900
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },
  primaryButton: {
  backgroundColor: '#2563EB',
  paddingVertical: 14,
  paddingHorizontal: 20,
  borderRadius: 14,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#2563EB',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 8,
  marginTop: 16,
},
primaryButtonText: {
  color: '#ffffff',
  fontSize: 16,
  fontWeight: '600',
},

secondaryButton: {
  backgroundColor: '#F3F4F6',
  paddingVertical: 14,
  paddingHorizontal: 20,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
  marginTop: 10,
},
secondaryButtonText: {
  color: '#374151',
  fontSize: 15,
  fontWeight: '500',
},

iconButton: {
  backgroundColor: '#E0F2FE',
  paddingVertical: 8,
  paddingHorizontal: 14,
  borderRadius: 10,
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#0284C7',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 4,
},

iconButtonDanger: {
  backgroundColor: '#FEE2E2',
  paddingVertical: 8,
  paddingHorizontal: 14,
  borderRadius: 10,
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#DC2626',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 4,
},

iconText: {
  fontSize: 16,
  fontWeight: '600',
}
});
