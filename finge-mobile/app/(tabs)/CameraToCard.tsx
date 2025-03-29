import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

interface StockInfo {
  symbol: string;
  price: string;
  change: string;
  changePercent: string;
}

interface CompanyData {
  companyName: string;
  // other company-related data from Llama Vision API, e.g., logo URL, description, etc.
  logo: string;
  description: string;
}

interface ProductCardProps {
  imageUri: string;
  company: CompanyData;
  stock: StockInfo;
}

const ProductCard: React.FC<ProductCardProps> = ({ imageUri, company, stock }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: imageUri }} style={styles.productImage} />
      <View style={styles.infoContainer}>
        <Text style={styles.companyName}>{company.companyName}</Text>
        <Text style={styles.companyDesc}>{company.description}</Text>
        <Text style={styles.stockSymbol}>Stock: {stock.symbol}</Text>
        <Text style={styles.stockPrice}>Price: ${stock.price}</Text>
        <Text
          style={[
            styles.stockChange,
            { color: stock.change.startsWith('+') ? '#4CAF50' : '#F44336' },
          ]}
        >
          {stock.change} ({stock.changePercent})
        </Text>
      </View>
    </View>
  );
};

export default function CameraToCard() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'You need to grant camera access.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      // Once the image is set, you can now process it:
      processImage(uri);
    }
  };

  const processImage = async (uri: string) => {
    setLoading(true);
    try {
      // 1. Call Llama Vision API to extract company information.
      // Replace with your API endpoint, key, and body details.
      const visionResponse = await fetch('https://api.llamavision.com/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_LLAMA_VISION_API_KEY',
        },
        body: JSON.stringify({ imageUri: uri }),
      });
      const visionData = await visionResponse.json();
      // Assume visionData returns an object with companyName, logo, description, etc.
      const company: CompanyData = {
        companyName: visionData.companyName, // e.g., "Apple Inc."
        logo: visionData.logo || 'https://logo.clearbit.com/apple.com',
        description: visionData.description || 'Company description here',
      };
      setCompanyData(company);

      // 2. Use the company data (or symbol) to fetch stock info.
      // For example, using Alpha Vantage:
      const API_KEY = 'YOUR_ALPHA_VANTAGE_API_KEY';
      const stockResponse = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(
          company.companyName
        )}&apikey=${API_KEY}`
      );
      const stockJson = await stockResponse.json();
      // Parse the response (adjust parsing based on your API's response format)
      const stock: StockInfo = {
        symbol: stockJson['Global Quote']['01. symbol'] || '',
        price: stockJson['Global Quote']['05. price'] || '',
        change: stockJson['Global Quote']['09. change'] || '',
        changePercent: stockJson['Global Quote']['10. change percent'] || '',
      };
      setStockInfo(stock);
    } catch (error) {
      console.error('Error processing image and fetching data:', error);
      Alert.alert('Error', 'Failed to process the image and fetch data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Processing image and fetching data...</Text>
      </View>
    );
  }

  // If all data is available, display the product card
  if (imageUri && companyData && stockInfo) {
    return <ProductCard imageUri={imageUri} company={companyData} stock={stockInfo} />;
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
        <Ionicons name="camera" size={40} color="white" />
        <Text style={styles.buttonText}>Take a Photo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cameraButton: {
    backgroundColor: '#4A9780',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    padding: 15,
    marginVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  infoContainer: {
    flex: 1,
    paddingLeft: 15,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  companyDesc: {
    fontSize: 14,
    color: '#555',
    marginVertical: 5,
  },
  stockSymbol: {
    fontSize: 16,
    marginTop: 5,
  },
  stockPrice: {
    fontSize: 16,
    color: '#007AFF',
    marginTop: 5,
  },
  stockChange: {
    fontSize: 16,
    marginTop: 5,
  },
});