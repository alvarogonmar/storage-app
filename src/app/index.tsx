import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const PREF_KEY = "@app_theme_preference";
const SECURE_TOKEN_KEY = "auth_user_session_jwt";

export default function StorageDemoScreen() {
  const [themePref, setThemePref] = useState<string>("light");
  const [inputToken, setInputToken] = useState<string>("");
  const [storedToken, setStoredToken] = useState<string | null>(null);

  // Load Initial Storage Data
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        // 1. Read Unencrypted Preference from AsyncStorage
        const savedTheme = await AsyncStorage.getItem(PREF_KEY);
        if (savedTheme) setThemePref(savedTheme);

        // 2. Read Encrypted Token from SecureStore
        const token = await SecureStore.getItemAsync(SECURE_TOKEN_KEY);
        setStoredToken(token);
      } catch {
        Alert.alert("Storage Error", "Failed to read persistent storage.");
      }
    };
    void loadStoredData();
  }, []);

  const handleToggleTheme = async () => {
    const nextTheme = themePref === "dark" ? "light" : "dark";
    setThemePref(nextTheme);
    await AsyncStorage.setItem(PREF_KEY, nextTheme);
  };

  const handleSaveToken = async () => {
    if (!inputToken.trim()) {
      Alert.alert("Validation Error", "Please enter a valid token string.");
      return;
    }
    await SecureStore.setItemAsync(SECURE_TOKEN_KEY, inputToken, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED,
    });
    setStoredToken(inputToken);
    setInputToken("");
    Alert.alert(
      "SecureStore Success",
      "JWT Token stored in Hardware Keystore!",
    );
  };

  const handlePurgeStorage = async () => {
    await AsyncStorage.removeItem(PREF_KEY);
    await SecureStore.deleteItemAsync(SECURE_TOKEN_KEY);
    setThemePref("light");
    setStoredToken(null);
    Alert.alert("Storage Purged", "All keys removed from device storage.");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Local Storage Comparison</Text>

      {/* AsyncStorage Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          1. AsyncStorage (Unencrypted Preference)
        </Text>
        <Text style={styles.cardText}>
          Current Theme Setting:{" "}
          <Text style={styles.highlight}>{themePref}</Text>
        </Text>
        <Pressable style={styles.btnSecondary} onPress={handleToggleTheme}>
          <Text style={styles.btnText}>Toggle & Persist Theme</Text>
        </Pressable>
      </View>

      {/* SecureStore Section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          2. SecureStore (Hardware Encrypted Token)
        </Text>
        <TextInput
          style={styles.textInput}
          value={inputToken}
          onChangeText={setInputToken}
          placeholder="Enter Sensitive JWT Token..."
          placeholderTextColor="#64748b"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Pressable style={styles.btnPrimary} onPress={handleSaveToken}>
          <Text style={styles.btnText}>Save Secret to Hardware Vault</Text>
        </Pressable>

        <View style={styles.statusBox}>
          <Text style={styles.statusLabel}>Stored Secret Token:</Text>
          <Text style={styles.statusValue}>
            {storedToken ? storedToken : "⚠️ No token stored in SecureStore."}
          </Text>
        </View>
      </View>

      {/* Storage Reset Controls */}
      <Pressable style={styles.btnDanger} onPress={handlePurgeStorage}>
        <Text style={styles.btnText}>Purge All Stored Data</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0f19" },
  content: { padding: 16 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#38bdf8",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#1e293b",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#f8fafc",
    marginBottom: 8,
  },
  cardText: { color: "#cbd5e1", fontSize: 13, marginBottom: 12 },
  highlight: { color: "#38bdf8", fontWeight: "bold" },
  textInput: {
    backgroundColor: "#0f172a",
    color: "#ffffff",
    borderWidth: 1,
    borderColor: "#475569",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    marginBottom: 12,
  },
  btnPrimary: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  btnSecondary: {
    backgroundColor: "#0284c7",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  btnDanger: {
    backgroundColor: "#ef4444",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  btnText: { color: "#ffffff", fontWeight: "bold", fontSize: 14 },
  statusBox: {
    backgroundColor: "#0f172a",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  statusLabel: { color: "#64748b", fontSize: 11, fontWeight: "bold" },
  statusValue: {
    color: "#4ade80",
    fontSize: 13,
    marginTop: 4,
    fontFamily: "monospace",
  },
});
