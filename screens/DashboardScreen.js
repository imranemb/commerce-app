import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;


export default function DashboardScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [loadingp2, setLoadingp2] = useState(false);
   const fetchPredictions = async () => {
      setLoadingp2(true);
      try {
        const res = await fetch(`http://10.1.7.95:3000/predictions`);
        const json = await res.json();
        setData(json);
      } catch (e) {
        Alert.alert('Erreur', 'Impossible de charger les prévisions');
      } finally {
        setLoadingp2(false);
      }
    };
 console.log("Test 1");
  useEffect(() => {
  fetch(`http://10.1.7.95:3000/dashboard`)
    .then((res) => {
      console.log('Status:', res.status);
      if (!res.ok) throw new Error('Erreur HTTP: ' + res.status);
      return res.json();
    })
    .then((data) => {
      console.log('Data reçue:', data);
      setStats(data);
      setLoading(false);
    })
    .catch((error) => {
      console.error('Erreur lors du fetch:', error);
      setLoading(false);
    });

  fetchPredictions();  
}, []);


  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }
  
 

    if (loadingp2) {
      return <ActivityIndicator size="large" style={{ marginTop: 20 }} />;
    }
  
    if (!data.length) {
      return <Text style={{ textAlign: 'center', marginTop: 20 }}>Aucune donnée de prévision disponible.</Text>;
    }
  
    const labels = data.map(d => d.date.slice(5)); // Format MM-DD
    const values = data.map(d => d.expectedSales);

  return (
    <>
   <ScrollView contentContainerStyle={styles.container}>
  <Text style={styles.header}>Tableau de bord</Text>

  <View style={styles.metricsContainer}>
    <View style={styles.card}>
      <Text style={styles.title}>Commandes aujourd'hui</Text>
      <Text style={styles.value}>{stats.todayOrders}</Text>
    </View>

    <View style={styles.card}>
      <Text style={styles.title}>Commandes totales</Text>
      <Text style={styles.value}>{stats.totalOrders}</Text>
    </View>

    <View style={styles.card}>
      <Text style={styles.title}>Ventes du jour (€)</Text>
      <Text style={styles.value}>{stats.todaySales.toFixed(2)}</Text>
    </View>

    <View style={styles.card}>
      <Text style={styles.title}>Ventes totales (€)</Text>
      <Text style={styles.value}>{stats.totalSales.toFixed(2)}</Text>
    </View>
  </View>
  <View style={styles.chartContainer}>
  <Text style={styles.chartTitle}>Prévisions de ventes</Text>
  <LineChart
    data={{
      labels,
      datasets: [{ data: values }],
    }}
    width={screenWidth - 40}
    height={220}
    yAxisLabel="€"
    chartConfig={{
  backgroundGradientFrom: '#f5f9ff',   // fond clair bleu pastel
  backgroundGradientTo: '#f5f9ff',
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(0, 53, 128, ${opacity})`, // #003580 foncé mais lumineux
  
  propsForDots: {
    r: '6',
    strokeWidth: '3',
    stroke: '#0071c2',  // bleu clair intense
    fill: '#cce4ff',    // halo bleu très doux
  },
  propsForBackgroundLines: {
    stroke: '#d8e4f7',  // gris bleu très clair
    strokeDasharray: '', // lignes pleines
  },
  strokeWidth: 3,
  useShadowColorFromDataset: false,
}}
    bezier
    style={{ borderRadius: 20 }}
  />
</View>
</ScrollView>



        </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#F7F8FA',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 35,
    color: '#1A1A1A',
    letterSpacing: 0.5,
  },

  // Grille 2 colonnes pour les cartes
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
   
  },

  card: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },

  title: {
    fontSize: 14,
    
    color: '#A0A3B1',
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.3,
  },

  value: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F1F1F',
  },

  chartContainer: {
   marginTop:20,
   marginBottom:40,
   backgroundColor: '#F7F8FA',
  },

  chartTitle: {
    paddingBottom:15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1A1A1A',
  },
});
