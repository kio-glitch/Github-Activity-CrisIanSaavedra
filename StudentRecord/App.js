import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';

export default function App() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState('');
  const [course, setCourse] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Using 127.0.0.1 instead of localhost to bypass macOS IPv6 resolution bugs in browsers
  const API_URL = 'http://127.0.0.1:5001/api/students';

  // Cross-platform helper for alerts (works on Web & Mobile)
  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  // Fetch Student Records (READ)
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Add New Student Record (CREATE)
  const handleAddStudent = async () => {
    if (!name.trim() || !course.trim() || !yearLevel.trim()) {
      showAlert('Validation Error', 'Please fill out all fields.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          course: course.trim(),
          yearLevel: yearLevel.trim(),
        }),
      });

      if (response.ok) {
        setName('');
        setCourse('');
        setYearLevel('');
        fetchStudents(); // Refresh the student list automatically
      } else {
        showAlert('Error', 'Failed to save student record.');
      }
    } catch (error) {
      console.error('Error adding student:', error);
      showAlert('Connection Error', 'Could not connect to the backend server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.innerContainer}
      >
        <Text style={styles.headerTitle}>Student Records System</Text>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <Text style={styles.sectionTitle}>Add New Student</Text>
          <TextInput
            style={styles.input}
            placeholder="Student Name"
            placeholderTextColor="#888"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Course"
            placeholderTextColor="#888"
            value={course}
            onChangeText={setCourse}
          />
          <TextInput
            style={styles.input}
            placeholder="Year Level"
            placeholderTextColor="#888"
            value={yearLevel}
            onChangeText={setYearLevel}
          />
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
            onPress={handleAddStudent}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Save Student Record</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Display Section */}
        <Text style={styles.sectionTitle}>Enrolled Students List</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#40739e" style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            data={students}
            keyExtractor={(item, index) => (item._id ? item._id.toString() : index.toString())}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardName}>{item.name}</Text>
                <Text style={styles.cardDetail}>Course: {item.course}</Text>
                <Text style={styles.cardDetail}>Year Level: {item.yearLevel}</Text>
              </View>
            )}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No student records found in MongoDB.</Text>
            }
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  innerContainer: {
    flex: 1,
    padding: 20,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#2f3640',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#353b48',
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  input: {
    backgroundColor: '#f1f2f6',
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#dcdde1',
    color: '#000',
  },
  submitButton: {
    backgroundColor: '#40739e',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#7f8c8d',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderLeftWidth: 4,
    borderLeftColor: '#40739e',
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2f3640',
  },
  cardDetail: {
    fontSize: 13,
    color: '#718093',
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#718093',
    marginTop: 20,
  },
});