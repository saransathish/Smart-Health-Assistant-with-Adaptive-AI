
// import React, { useState } from "react";
// import { 
//   StyleSheet, 
//   View, 
//   Text, 
//   TextInput, 
//   TouchableOpacity, 
//   ScrollView, 
//   KeyboardAvoidingView, 
//   Platform 
// } from "react-native";
// import axios from "axios";

// const ChatbotMobile: React.FC = () => {
//   const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
//   const [input, setInput] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(false);

//   const handleSend = async () => {
//     if (!input.trim()) return;

//     // Prepare the API input but leave UI input unchanged
//     const modifiedInput = `${input.trim()} (within 10 to 20 words and you need to answer only medical question else say only has medical knowledge)`;
//     const userMessage = { role: "user", content: input.trim() }; // Display only user input in the UI
//     setMessages((prev) => [...prev, userMessage]);
//     setInput("");
//     setLoading(true);

//     const options = {
//       method: "POST",
//       url: "https://chatgpt-42.p.rapidapi.com/chatbotapi",
//       headers: {
//         'x-rapidapi-key': 'e813c98573msh5b4dd5910352d7fp18d809jsn2452fd0a2647',
//     'x-rapidapi-host': 'chatgpt-42.p.rapidapi.com',
//     'Content-Type': 'application/json'
//       },
//       data: {
//         bot_id: "OEXJ8qFp5E5AwRwymfPts90vrHnmr8yZgNE171101852010w2S0bCtN3THp448W7kDSfyTf3OpW5TUVefz",
//         messages: [...messages, { role: "user", content: modifiedInput }],
//         user_id: "unique-user-id",
//         temperature: 0.9,
//         top_k: 5,
//         top_p: 0.9,
//         max_tokens: 256,
//         model: "gpt 3.5",
//       },
//     };

//     try {
//       const response = await axios.request(options);
//       const botMessage = { role: "bot", content: response.data?.result || "No response received." };
//       setMessages((prev) => [...prev, botMessage]);
//     } catch (err) {
//       setMessages((prev) => [...prev, { role: "bot", content: "Error: no responce from BERT." }]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       style={styles.container}
//       behavior={Platform.OS === "ios" ? "padding" : undefined}
//     >
//       <View style={styles.header}>
//         <Text style={styles.headerText}>SmartCare</Text>
//       </View>
//       <ScrollView style={styles.chatWindow}>
//         {messages.map((message, index) => (
//           <View
//             key={index}
//             style={[
//               styles.message,
//               message.role === "user" ? styles.userMessage : styles.botMessage,
//             ]}
//           >
//             <Text style={styles.messageText}>{message.content}</Text>
//           </View>
//         ))}
//         {loading && (
//           <View style={[styles.message, styles.botMessage]}>
//             <Text style={styles.messageText}>Loading...</Text>
//           </View>
//         )}
//       </ScrollView>
//       <View style={styles.inputArea}>
//         <TextInput
//           style={styles.input}
//           value={input}
//           onChangeText={setInput}
//           placeholder="Type a message..."
//         />
//         <TouchableOpacity onPress={handleSend} style={styles.sendButton} disabled={loading}>
//           <Text style={styles.sendButtonText}>Send</Text>
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//   },
//   header: {
//     backgroundColor: "#4a90e2",
//     padding: 15,
//     alignItems: "center",
//   },
//   headerText: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   chatWindow: {
//     flex: 1,
//     padding: 10,
//   },
//   message: {
//     marginVertical: 5,
//     padding: 10,
//     borderRadius: 10,
//     maxWidth: "75%",
//   },
//   userMessage: {
//     alignSelf: "flex-end",
//     backgroundColor: "#d1f5d3",
//   },
//   botMessage: {
//     alignSelf: "flex-start",
//     backgroundColor: "#e6e6e6",
//   },
//   messageText: {
//     fontSize: 16,
//   },
//   inputArea: {
//     flexDirection: "row",
//     padding: 10,
//     borderTopWidth: 1,
//     borderColor: "#ccc",
//   },
//   input: {
//     flex: 1,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderRadius: 5,
//     padding: 10,
//     fontSize: 16,
//     marginRight: 10,
//   },
//   sendButton: {
//     backgroundColor: "#4a90e2",
//     borderRadius: 5,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 15,
//     paddingVertical: 10,
//   },
//   sendButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
// });

// export default ChatbotMobile;

import React, { useState, useRef, useEffect } from "react";
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  Animated,
  ActivityIndicator 
} from "react-native";
import axios from "axios";

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: number;
}

const ChatbotMobile: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const modifiedInput = `${input.trim()} (within 10 to 20 words and you need to answer only medical question else say only has medical knowledge)`;
    const userMessage: Message = { 
      id: `user_${Date.now()}`, 
      role: "user", 
      content: input.trim(),
      timestamp: Date.now()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const options = {
      method: "POST",
      url: "https://chatgpt-42.p.rapidapi.com/chatbotapi",
      headers: {
        'x-rapidapi-key': 'e813c98573msh5b4dd5910352d7fp18d809jsn2452fd0a2647',
        'x-rapidapi-host': 'chatgpt-42.p.rapidapi.com',
        'Content-Type': 'application/json'
      },
      data: {
        bot_id: "OEXJ8qFp5E5AwRwymfPts90vrHnmr8yZgNE171101852010w2S0bCtN3THp448W7kDSfyTf3OpW5TUVefz",
        messages: [...messages, { role: "user", content: modifiedInput }],
        user_id: "unique-user-id",
        temperature: 0.9,
        top_k: 5,
        top_p: 0.9,
        max_tokens: 256,
        model: "gpt 3.5",
      },
    };

    try {
      const response = await axios.request(options);
      const botMessage: Message = { 
        id: `bot_${Date.now()}`, 
        role: "bot", 
        content: response.data?.result || "No response received.",
        timestamp: Date.now()
      };
      
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const errorMessage: Message = { 
        id: `error_${Date.now()}`, 
        role: "bot", 
        content: "Error: no response from BERT.",
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View 
        style={[
          styles.message,
          isUser ? styles.userMessage : styles.botMessage,
        ]}
      >
        <Text style={[styles.messageText, isUser && styles.userMessageText]}>
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>SmartCare AI Assistant</Text>
      </View>

      {/* Chat Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatWindow}
        showsVerticalScrollIndicator={false}
        inverted
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={11}
      />

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#4a90e2" />
        </View>
      )}

      {/* Input Area */}
      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type your medical question..."
          placeholderTextColor="#888"
          multiline={true}
          numberOfLines={3}
        />
        <TouchableOpacity 
          onPress={handleSend} 
          style={[
            styles.sendButton, 
            (loading || !input.trim()) && styles.sendButtonDisabled
          ]} 
          disabled={loading || !input.trim()}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  header: {
    backgroundColor: "#4a90e2",
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
  },
  chatWindow: {
    flexGrow: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  message: {
    marginVertical: 5,
    padding: 12,
    borderRadius: 12,
    maxWidth: "85%",
    alignSelf: "flex-start",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#e7f3ff",
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f0f0",
  },
  messageText: {
    fontSize: 16,
    color: "black",
    lineHeight: 22,
  },
  userMessageText: {
    color: "#4a90e2",
  },
  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    color:"black"
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    marginRight: 10,
    maxHeight: 100,
    color:"black"
  },
  sendButton: {
    backgroundColor: "#4a90e2",
    borderRadius: 25,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#4a90e2",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: "#a0c4e8",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
});

export default ChatbotMobile;