import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Use the correct IP address based on platform
const BACKEND_URL = Platform.select({
  ios: 'http://10.29.123.212:8000',
  android: 'http://10.0.2.2:8000',
  default: 'http://10.29.123.212:8000',
});


export default function CameraScanner() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [stockInfo, setStockInfo] = useState<any>(null);
  const router = useRouter();

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "You need to grant camera access.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      await uploadImage(uri);
    }
  };

  const uploadImage = async (uri: string) => {
    setLoading(true);
    try {
      console.log('Starting image upload to:', BACKEND_URL);
      console.log('Image URI:', uri);

      // Create form data
      const formData = new FormData();
      formData.append("file", {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as any);

      // First, upload the image
      console.log('Sending upload request...');
      const uploadResponse = await fetch(`${BACKEND_URL}/upload-image`, {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload response status:', uploadResponse.status);
      
      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Upload failed:', errorText);
        throw new Error(`Upload failed with status ${uploadResponse.status}: ${errorText}`);
      }

      const uploadResult = await uploadResponse.json();
      console.log("Upload successful:", uploadResult);

      setStockInfo(uploadResult);

    } catch (error) {
      console.error("Error details:", error);
      Alert.alert(
        "Upload Failed",
        __DEV__ 
          ? `Error: ${(error as Error).message}`
          : "Failed to process image. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={30} color="#4A4A4A" />
      </TouchableOpacity>

      <Text style={styles.header}>Camera Scanner</Text>

      {image ? (
        <>
          <Image source={{ uri: image }} style={styles.image} />
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : (
            <TouchableOpacity style={styles.retakeButton} onPress={openCamera}>
              <Text style={styles.buttonText}>📷 Retake Photo</Text>
            </TouchableOpacity>
          )}

          {stockInfo && (
            <View style={styles.infoContainer}>
              <Text style={styles.infoTitle}>Ticker: {stockInfo.ticker}</Text>
              {stockInfo.yahooFinance && (
                <>
                  <Text style={styles.infoText}>
                    Company: {stockInfo.yahooFinance.companyName}
                  </Text>
                  <Text style={styles.infoText}>
                    Price: {stockInfo.yahooFinance.price}
                  </Text>
                </>
              )}
              {stockInfo.nasdaq && (
                <Text style={styles.infoText}>
                  NASDAQ: {stockInfo.nasdaq.lastSalePrice}
                </Text>
              )}
            </View>
          )}
        </>
      ) : (
        <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
          <Ionicons name="camera" size={40} color="white" />
          <Text style={styles.buttonText}>Open Camera</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  image: { width: 250, height: 250, borderRadius: 10 },
  cameraButton: {
    backgroundColor: "#4A90E2",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  retakeButton: {
    backgroundColor: "#34A853",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  backButton: { position: "absolute", top: 50, left: 20 },
  infoContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
  },
  infoTitle: { fontSize: 18, fontWeight: "bold" },
  infoText: { fontSize: 16, marginTop: 5 },
});
