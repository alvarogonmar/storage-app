import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

export default function CreateLogScreen() {
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [description, setDescription] = useState('');

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Validation Error', 'Please complete title and description.');
      return;
    }

    try {
      const inspectorId = (await SecureStore.getItemAsync('current_inspector_id')) || 'INS-4821';
      const db = await SQLite.openDatabaseAsync('audit_vault.db');

      // 🛠️ SETUP STORAGE: Create the table if it does not exist yet
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS inspection_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          inspector_id TEXT NOT NULL,
          title TEXT NOT NULL,
          severity TEXT NOT NULL,
          description TEXT NOT NULL
        );
      `);

      // ✅ SECURE: Parameterized Query Insertion
      await db.runAsync(
        `INSERT INTO inspection_logs (inspector_id, title, severity, description) VALUES (?, ?, ?, ?);`,
        [inspectorId, title, severity, description]
      );

      Alert.alert('Success', 'Inspection log saved to SQLite database!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Database Error', 'Failed to save log entry.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Log Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Substation Router Inspection"
        placeholderTextColor="#64748b"
      />

      <Text style={styles.label}>Severity Level</Text>
      <View style={styles.severityRow}>
        {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((level) => (
          <Pressable
            key={level}
            onPress={() => setSeverity(level)}
            style={[styles.chip, severity === level && styles.chipActive]}
          >
            <Text style={styles.chipText}>{level}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Inspection Notes & Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter detailed audit findings..."
        placeholderTextColor="#64748b"
        multiline
        numberOfLines={4}
      />

      <Pressable style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save Log to SQLite</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19', padding: 16 },
  label: { color: '#cbd5e1', fontSize: 12, fontWeight: 'bold', marginTop: 12, marginBottom: 4 },
  input: {
    backgroundColor: '#1e293b',
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
  },
  textArea: { height: 100, textAlignVertical: 'top', paddingTop: 10 },
  severityRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  chip: {
    backgroundColor: '#1e293b',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipActive: { backgroundColor: '#0284c7', borderColor: '#38bdf8' },
  chipText: { color: '#ffffff', fontSize: 11, fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 24 },
  saveBtnText: { color: '#ffffff', fontWeight: 'bold', fontSize: 14 },
});
