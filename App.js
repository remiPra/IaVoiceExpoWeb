import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { View, TextInput, Button, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import * as Speech from 'expo-speech';
import Constants from 'expo-constants';

// Ancienne méthode (dépréciée)
// const apiKey = Constants.manifest.extra.API_KEY;

// Nouvelle méthode recommandée
const apiKey = Constants.expoConfig.extra.API_KEY;
console.log(apiKey); // Log la clé API


export default function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [voice, setVoice] = useState(null);

  useEffect(() => {
    (async () => {
      await Speech.speak('Bonjour, je suis prêt à discuter avec vous.', { language: 'fr' });
    })();
  }, []);

  useEffect(() => {
    const setVoiceList = () => {
      setVoice(Speech.voices.find(v => v.language.startsWith('fr')) || Speech.voices[0]); // Préférez une voix française
    };

    if (Speech.onVoicesDidChange) {
      Speech.onVoicesDidChange = setVoiceList;
    }

    return () => {
      Speech.onVoicesDidChange = null;
    };
  }, []);

  const handleInputChange = (text) => {
    setInput(text);
   
  };

  const sendMessage = async () => {
    if (input.trim() !== '') {
      try {
        const userMessage = { role: 'user', content: input };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setInput('');
        const data = {
          messages: updatedMessages,
          model: 'mixtral-8x7b-32768',
        };

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', data, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.EXPO_PUBLIC_GROQ_API_KEY}`,
          },
        });

        const assistantMessage = response.data.choices[0].message.content;
        setMessages((prevMessages) => [...prevMessages, { role: 'assistant', content: assistantMessage }]);
        speak(assistantMessage);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const speak = (text) => {
    if (voice) {
      Speech.speak(text, { voice: voice });
    } else {
      Speech.speak(text);
    }
  };

  const stopSpeaking = () => {
    Speech.stop();
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <TextInput
        style={{
          backgroundColor: 'white', width: 300, height: 50, borderWidth: 1, borderRadius: 50,
          borderColor: 'gray', padding: 10, marginRight: 10, marginBottom: 50 , marginTop: 50
        }}
        value={input}
        onChangeText={handleInputChange}
        placeholder="Dites quelque chose"
      />
      <View style={{ marginBottom: 40, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity style={styles.button} onPress={sendMessage}>
          <Text style={styles.text}>envoyer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={stopSpeaking}>
          <Text style={styles.text}>Stop</Text>
        </TouchableOpacity>

      </View>
      <ScrollView style={{ marginTop: 60, height: '70%', width: '80%', marginBottom: 20 }}>
        {messages.map((message, index) => (
          <View key={index} style={{ marginBottom: 10 }}>
            <Text style={{ color: message.role === 'user' ? 'black' : 'green' }}>
              {`${message.role}: ${message.content}`}
            </Text>
          </View>
        ))}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 100, height: 100,
    backgroundColor: '#007bff',
    padding: 10,
    marginHorizontal: 5,
    // borderRadius: "50%",
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowOffset: { width: 1, height: 1 },
    shadowColor: 'black',
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  text: {
    color: 'white',
    fontSize: 16,
  },
});

