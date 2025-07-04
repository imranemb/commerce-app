import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Button, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, Pressable
} from 'react-native';

export default function SalesStatusScreen() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'delivered', 'cancelled'

  const fetchSales = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://10.1.7.95:3000/sales`);
      const data = await res.json();
      setSales(data);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de récupérer les ventes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const showStatusOptions = (saleId, currentStatus) => {
    Alert.alert(
      'Changer le statut',
      `Statut actuel : ${currentStatus}`,
      [
        { text: '🕐 Pending', onPress: () => updateStatus(saleId, 'pending') },
        { text: '✅ Livré', onPress: () => updateStatus(saleId, 'delivered') },
        { text: '❌ Annulé', onPress: () => updateStatus(saleId, 'cancelled') },
        { text: 'Annuler', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const updateStatus = async (saleId, newStatus) => {
    try {
      const res = await fetch(`http://10.1.7.95:3000/sales/${saleId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await res.json();

      if (res.ok) {
        Alert.alert('Succès', `Statut mis à jour : ${newStatus}`);
        fetchSales();
      } else {
        Alert.alert('Erreur', result.message || 'Impossible de mettre à jour le statut');
      }
    } catch (e) {
      Alert.alert('Erreur', e.message);
    }
  };
const statusColor = (status) => {
  switch (status) {
    case 'pending': return '#f59e0b';
    case 'delivered': return '#10b981';
    case 'cancelled': return '#ef4444';
    default: return '#6b7280';
  }
};

  const renderItem = ({ item }) => (
    <View style={styles.saleItem}>
      <Text style={styles.clientText}>
        Client: {item.customer?.firstName || 'N/A'} {item.customer?.lastName || ''} Tél: {item.customer?.phone || ''}
      </Text>
      <Text>Date: {new Date(item.date).toLocaleString()}</Text>
      <Text>Total: {item.total.toFixed(2)} €</Text>
      <Text>
  Status: <Text style={{ fontWeight: 'bold', color: statusColor(item.status) }}>{item.status}</Text>
</Text>
      <Pressable
  style={styles.changeStatusButton}
  onPress={() => showStatusOptions(item._id, item.status)}
>
  <Text style={styles.changeStatusText}>📝 Changer statut</Text>
</Pressable>
    </View>
  );

  const filteredSales = filter === 'all' ? sales : sales.filter(s => s.status === filter);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Statut des commandes</Text>

      {/* Filtres */}
      <View style={styles.filters}>
        {['all', 'pending', 'delivered', 'cancelled'].map(status => (
          <TouchableOpacity
            key={status}
            style={[styles.filterButton, filter === status && styles.activeFilter]}
            onPress={() => setFilter(status)}
          >
            <Text style={{ color: filter === status ? '#fff' : '#000' }}>
              {status === 'all' ? 'Tous' : status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Liste */}
      {filteredSales.length === 0 ? (
        <Text>Aucune vente trouvée.</Text>
      ) : (
        <FlatList
          data={filteredSales}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <Pressable style={styles.refreshButton} onPress={fetchSales}>
  <Text style={styles.refreshText}>🔄 Rafraîchir</Text>
</Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f9fbfc',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  clientText: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 6,
    color: '#0f172a',
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#cbd5e1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
  },
  activeFilter: {
    backgroundColor: '#2563eb',
    shadowColor: '#93c5fd',
  },
  saleItem: {
    marginBottom: 20,
    padding: 18,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  changeStatusButton: {
    marginTop: 12,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  changeStatusText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: 0.3,
  },
  refreshButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
  },
  refreshText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});

