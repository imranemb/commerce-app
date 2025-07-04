import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Pressable,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";


export default function ScanTicket() {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [photoUri, setPhotoUri] = useState(null);

  const cameraRef = useRef(null);

  // Permissions caméra avec hook
  const [permission, requestPermission] = useCameraPermissions();

  const fetchLastTicket = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://10.1.7.95:3000/latest-ticket`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTicket(data);
    } catch (error) {
      console.error("Erreur lors de la récupération du ticket :", error);
    } finally {
      setLoading(false);
    }
  };

  const openCamera = async () => {
    if (!permission || !permission.granted) {
      const permissionResult = await requestPermission();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission refusée",
          "Vous devez autoriser l'accès à la caméra."
        );
        return;
      }
    }
    setCameraVisible(true);
    setPhotoUri(null);
  };

  const takePicture = async () => {
    const photo = await cameraRef.current?.takePictureAsync();
    if (photo?.uri) {
      setPhotoUri(photo.uri);
      setCameraVisible(false);
    }
  };

  useEffect(() => {
  const uploadPhoto = async (uri) => {
    if (!uri) return;

    const formData = new FormData();
    formData.append('image', {
      uri,
      name: 'ticket.jpg',
      type: 'image/jpeg',
    });

    try {
      const response = await fetch(`http://10.1.7.95:3000/upload-image`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();
      console.log('Image envoyée :', data.imageUrl);
    } catch (err) {
      console.error('Erreur envoi image:', err);
    }
  };

  uploadPhoto(photoUri);
}, [photoUri]);

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.name}>{item.name}</Text>
      <Text>Quantité : {item.quantity}</Text>
      <Text>Prix : {item.price}€</Text>
    </View>
  );

  if (!permission) {
    return <View><Text>Chargement des permissions...</Text></View>;
  }

  if (cameraVisible) {
    return (
      <View style={{ flex: 1 }}>
        <CameraView
          style={{ flex: 1 }}
          ref={cameraRef}
          isActive={true}
          photo={true}
        >
          <View style={styles.cameraControls}>
            <Pressable onPress={takePicture} style={styles.shutterBtn}>
              <Text style={{ color: "white", fontSize: 18 }}>📷</Text>
            </Pressable>
            <Pressable
              onPress={() => setCameraVisible(false)}
              style={styles.closeBtn}
            >
              <Text style={{ color: "white", fontSize: 18 }}>✕</Text>
            </Pressable>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dernier Ticket</Text>

      <Pressable style={styles.primaryButton} onPress={fetchLastTicket}>
  <Text style={styles.primaryButtonText}>📥 Charger le dernier ticket</Text>
</Pressable>
      <View style={{ marginVertical: 10 }} />
      <Pressable style={styles.secondaryButton} onPress={openCamera}>
  <Text style={styles.secondaryButtonText}>📸 Prendre une photo</Text>
</Pressable>

      {loading && (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />
      )}

      {ticket && (
        <>
          <FlatList
            data={ticket.items}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderItem}
            style={{ marginTop: 20 }}
          />
          <Text style={styles.total}>Total : {ticket.total}€</Text>
        </>
      )}

      {photoUri && (
        <Image
          source={{ uri: photoUri }}
          style={{ width: "100%", height: 50, marginTop: 20, borderRadius: 10 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 35,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  item: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  total: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2563EB',
    textAlign: 'right',
    marginTop: 20,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    position: 'absolute',
    bottom: 40,
    width: '100%',
    paddingHorizontal: 20,
  },
  shutterBtn: {
    backgroundColor: '#2563EB',
    padding: 18,
    borderRadius: 50,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  closeBtn: {
    backgroundColor: '#F43F5E',
    padding: 18,
    borderRadius: 50,
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  primaryButton: {
  backgroundColor: '#2563EB', // bleu Booking / Linear
  paddingVertical: 14,
  paddingHorizontal: 20,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#2563EB',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.15,
  shadowRadius: 10,
 
},
primaryButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},

secondaryButton: {
  backgroundColor: '#E0E7FF',
  paddingVertical: 14,
  paddingHorizontal: 20,
  borderRadius: 12,
  alignItems: 'center',
  justifyContent: 'center',
  shadowColor: '#6366F1',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  marginBottom: 20,
},
secondaryButtonText: {
  color: '#1E3A8A',
  fontSize: 16,
  fontWeight: '600',
}
});

