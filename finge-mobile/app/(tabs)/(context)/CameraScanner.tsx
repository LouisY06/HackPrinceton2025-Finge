import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function FoodScanner() {
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
        sendImageToDatabase(uri); // ✅ Use this one
      }
    };
  
    const sendImageToDatabase = async (uri: string) => {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", {
        uri,
        name: "photo.jpg",
        type: "image/jpeg",
      } as any);
  
      try {
        // 1. Upload image to backend & store in MongoDB
        const res = await fetch("http://<your-ip>:8000/save-image", {
          method: "POST",
          body: formData,
          headers: { "Content-Type": "multipart/form-data" },
        });
  
        const json = await res.json();
        console.log("Image saved with ID:", json.image_id);
  
        // 2. Call analysis endpoint
        const analysis = await fetch("http://<your-ip>:8000/analyze-latest");
        const result = await analysis.json();
        setStockInfo(result);
      } catch (e) {
        console.error("Error uploading image:", e);
        Alert.alert("Error", "Failed to send image to backend.");
      } finally {
        setLoading(false);
      }
    };
  
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
  infoContainer: { marginTop: 20, padding: 10, backgroundColor: "#f0f0f0", borderRadius: 10 },
  infoTitle: { fontSize: 18, fontWeight: "bold" },
  infoText: { fontSize: 16, marginTop: 5 },
});
