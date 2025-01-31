// import React, { useState, useRef, useEffect } from 'react';
// import './css/Chatbot.css';
// interface Message {
//   role: 'user' | 'assistant';
//   content: string;
//   timestamp: string;
// }
// interface ChatResponse {
//   response: string;
//   history: Message[];
// }
// const API_CONFIG = {
//   BASE_URL: 'http://localhost:8000',
//   ENDPOINTS: {
//     CHAT: '/api/chatbot/chat/'
//   }
// };
// export const Chatbot: React.FC = () => {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };
//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);
//   const formatTimestamp = () => {
//     const now = new Date();
//     return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };
//   const sendMessageToBackend = async (message: string, history: Message[]) => {
//     const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT}`;
    
//     try {
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Accept': 'application/json',
//         },
//         mode: 'cors', 
//         body: JSON.stringify({
//           message: message,
//           history: history.map(msg => ({
//             role: msg.role,
//             content: msg.content
//           }))
//         }),
//       });
//       console.log('Response status:', response.status);
//       const responseData = await response.json();
//       console.log('Response data:', responseData);
//       if (!response.ok) {
//         throw new Error(responseData.error || `Server error: ${response.status}`);
//       }
//       return responseData;
//     } catch (error) {
//       console.error('API Error:', error);
//       if (error instanceof Error) {
//         throw new Error(
//           error.message === 'Failed to fetch' 
//             ? 'Cannot connect to server. Please check if the server is running.'
//             : error.message
//         );
//       }
//       throw new Error('An unexpected error occurred');
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!inputMessage.trim() || isLoading) return;
//     const userMessage = inputMessage.trim();
//     setInputMessage('');
//     setIsLoading(true);
//     setError(null);
//     const newUserMessage = {
//       role: 'user' as const,
//       content: userMessage,
//       timestamp: formatTimestamp()
//     };
//     setMessages(prev => [...prev, newUserMessage]);
//     try {
//       const data = await sendMessageToBackend(userMessage, messages);
//       setMessages(prev => [
//         ...prev,
//         {
//           role: 'assistant',
//           content: data.response,
//           timestamp: formatTimestamp()
//         }
//       ]);
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
//       setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };
//   const handleRetry = async () => {
//     if (messages.length === 0) return;
//     const lastUserMessage = messages[messages.length - 1];
//     if (lastUserMessage.role !== 'user') return;
//     setError(null);
//     setIsLoading(true);
//     try {
//       const data = await sendMessageToBackend(
//         lastUserMessage.content, 
//         messages.slice(0, -1)
//       );
//       setMessages(prev => [
//         ...prev,
//         {
//           role: 'assistant',
//           content: data.response,
//           timestamp: formatTimestamp()
//         }
//       ]);
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : 'Failed to retry message';
//       setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };
//   return (
//     <div className="chatbot-container">
//       <div className="chatbot-header">
//         <div className="header-icon">👨‍⚕️</div>
//         <div className="header-text">
//           <h1>Medical Assistant</h1>
//           <span className="connection-status">
//             {error ? 'Connection Error' : 'Connected'}
//           </span>
//         </div>
//       </div>
//       <div className="messages-container">
//         {messages.length === 0 ? (
//           <div className="welcome-message">
//             <h2>Hello! 👋</h2>
//             <p>I'm your medical assistant. How can I help you today?</p>
//           </div>
//         ) : (
//           messages.map((message, index) => (
//             <div
//               key={index}
//               className={`message-wrapper ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
//             >
//               <div className="message">
//                 <div className="message-content">{message.content}</div>
//                 <div className="message-timestamp">{message.timestamp}</div>
//               </div>
//             </div>
//           ))
//         )}
//         {isLoading && (
//           <div className="message-wrapper assistant-message">
//             <div className="message">
//               <div className="typing-indicator">
//                 <span></span>
//                 <span></span>
//                 <span></span>
//               </div>
//             </div>
//           </div>
//         )}
//         {error && (
//           <div className="error-message">
//             <p>{error}</p>
//             <button onClick={handleRetry} className="retry-button">
//               Try Again
//             </button>
//           </div>
//         )}
//         <div ref={messagesEndRef} />
//       </div>
//       <form onSubmit={handleSubmit} className="input-form">
//         <input
//           type="text"
//           value={inputMessage}
//           onChange={(e) => setInputMessage(e.target.value)}
//           placeholder="Type your medical question here..."
//           disabled={isLoading}
//         />
//         <button type="submit" disabled={!inputMessage.trim() || isLoading}>
//           {isLoading ? (
//             <span className="sending">Sending...</span>
//           ) : (
//             <span className="send-icon">➤</span>
//           )}
//         </button>
//       </form>
//     </div>
//   );
// };
// export default Chatbot;

// import React, { useState, useRef, useEffect } from 'react';
// import './css/Chatbot.css';

// interface Message {
//   role: 'user' | 'assistant';
//   content: string;
//   timestamp: string;
// }

// interface ChatResponse {
//   response: string;
//   session_id: string;
// }

// const API_CONFIG = {
//   BASE_URL: 'http://localhost:8000',
//   ENDPOINTS: {
//     CHAT: '/api/chatbot/chat/'
//   }
// };

// export const Chatbot: React.FC = () => {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [sessionId, setSessionId] = useState<string>('');
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   // Load session from localStorage on component mount
//   useEffect(() => {
//     const savedSession = localStorage.getItem('medical_chat_session');
//     if (savedSession) {
//       const { sessionId: savedSessionId, messages: savedMessages } = JSON.parse(savedSession);
//       setSessionId(savedSessionId);
//       setMessages(savedMessages);
//     }
//   }, []);

//   // Save session to localStorage whenever it updates
//   useEffect(() => {
//     if (sessionId && messages.length > 0) {
//       localStorage.setItem('medical_chat_session', JSON.stringify({
//         sessionId,
//         messages
//       }));
//     }
//   }, [sessionId, messages]);

//   // Scroll to the bottom of the chat window when messages update
//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const formatTimestamp = () => {
//     const now = new Date();
//     return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   const sendMessageToBackend = async (message: string) => {
//     const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT}`;
    
//     try {
//       const response = await fetch(url, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Accept': 'application/json',
//         },
//         mode: 'cors',
//         body: JSON.stringify({
//           message: message,
//           session_id: sessionId
//         }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || `Server error: ${response.status}`);
//       }

//       const data: ChatResponse = await response.json();
      
//       // Update session ID if received from backend
//       if (data.session_id && !sessionId) {
//         setSessionId(data.session_id);
//       }

//       return data.response;

//     } catch (error) {
//       console.error('API Error:', error);
//       if (error instanceof Error) {
//         throw new Error(
//           error.message === 'Failed to fetch' 
//             ? 'Cannot connect to server. Please check if the server is running.'
//             : error.message
//         );
//       }
//       throw new Error('An unexpected error occurred');
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!inputMessage.trim() || isLoading) return;

//     const userMessage = inputMessage.trim();
//     setInputMessage('');
//     setIsLoading(true);
//     setError(null);

//     const newUserMessage = {
//       role: 'user' as const,
//       content: userMessage,
//       timestamp: formatTimestamp()
//     };

//     setMessages(prev => [...prev, newUserMessage]);

//     try {
//       const response = await sendMessageToBackend(userMessage);
      
//       setMessages(prev => [
//         ...prev,
//         {
//           role: 'assistant',
//           content: response,
//           timestamp: formatTimestamp()
//         }
//       ]);
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
//       setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const clearConversation = () => {
//     setMessages([]);
//     setSessionId('');
//     localStorage.removeItem('medical_chat_session');
//   };

//   const handleRetry = async () => {
//     if (messages.length === 0) return;
//     const lastUserMessage = messages[messages.length - 1];
//     if (lastUserMessage.role !== 'user') return;

//     setError(null);
//     setIsLoading(true);

//     try {
//       const response = await sendMessageToBackend(lastUserMessage.content);
      
//       setMessages(prev => [
//         ...prev,
//         {
//           role: 'assistant',
//           content: response,
//           timestamp: formatTimestamp()
//         }
//       ]);
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : 'Failed to retry message';
//       setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="chatbot-container">
//       <div className="chatbot-header">
//         <div className="header-icon">👨‍⚕️</div>
//         <div className="header-text">
//           <h1>Medical Assistant</h1>
//           <span className="connection-status">
//             {error ? 'Connection Error' : 'Connected'}
//           </span>
//         </div>
//         <button 
//           onClick={clearConversation} 
//           className="clear-button"
//           title="Clear conversation"
//         >
//           🗑️
//         </button>
//       </div>

//       <div className="messages-container">
//         {messages.length === 0 ? (
//           <div className="welcome-message">
//             <h2>Hello! 👋</h2>
//             <p>I'm your medical assistant. How can I help you today?</p>
//           </div>
//         ) : (
//           messages.map((message, index) => (
//             <div
//               key={`${message.timestamp}-${index}`}
//               className={`message-wrapper ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
//             >
//               <div className="message">
//                 <div className="message-content">{message.content}</div>
//                 <div className="message-timestamp">{message.timestamp}</div>
//               </div>
//             </div>
//           ))
//         )}

//         {isLoading && (
//           <div className="message-wrapper assistant-message">
//             <div className="message">
//               <div className="typing-indicator">
//                 <span></span>
//                 <span></span>
//                 <span></span>
//               </div>
//             </div>
//           </div>
//         )}

//         {error && (
//           <div className="error-message">
//             <p>{error}</p>
//             <button onClick={handleRetry} className="retry-button">
//               Try Again
//             </button>
//           </div>
//         )}

//         <div ref={messagesEndRef} />
//       </div>

//       <form onSubmit={handleSubmit} className="input-form">
//         <input
//           type="text"
//           value={inputMessage}
//           onChange={(e) => setInputMessage(e.target.value)}
//           placeholder="Type your medical question here..."
//           disabled={isLoading}
//           className="message-input"
//         />
//         <button 
//           type="submit" 
//           disabled={!inputMessage.trim() || isLoading}
//           className="send-button"
//         >
//           {isLoading ? (
//             <span className="sending">Sending...</span>
//           ) : (
//             <span className="send-icon">➤</span>
//           )}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Chatbot;

// import React, { useState, useRef, useEffect } from 'react';
// import './css/Chatbot.css';

// interface Message {
//   role: 'user' | 'assistant';
//   content: string;
//   timestamp: string;
// }

// interface ChatResponse {
//   success: boolean;
//   response: string;
//   disclaimer?: string;
// }

// const API_CONFIG = {
//   BASE_URL: 'http://localhost:8000',
//   ENDPOINTS: {
//     CHAT: '/api/chatbot/chat/'  // Updated endpoint to match Django view
//   }
// };

// export const Chatbot: React.FC = () => {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   // Load chat history from localStorage on component mount
//   useEffect(() => {
//     const savedChat = localStorage.getItem('medical_chat_history');
//     if (savedChat) {
//       setMessages(JSON.parse(savedChat));
//     }
//   }, []);

//   // Save chat history to localStorage whenever it updates
//   useEffect(() => {
//     if (messages.length > 0) {
//       localStorage.setItem('medical_chat_history', JSON.stringify(messages));
//     }
//   }, [messages]);

//   // Scroll to bottom when messages update
//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   const formatTimestamp = () => {
//     const now = new Date();
//     return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   const sendMessageToBackend = async (query: string) => {
//     const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT}`;
    
//     try {
//         const response = await fetch(url, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Accept': 'application/json',
//             },
//             credentials: 'include',  // Important for CORS
//             mode: 'cors',           // Explicitly state CORS mode
//             body: JSON.stringify({ query }),
//         });

//         if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(errorData.message || `Server error: ${response.status}`);
//         }

//         const data = await response.json();
//         return data;

//     } catch (error) {
//         console.error('API Error:', error);
//         throw error;
//     }
// };
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!inputMessage.trim() || isLoading) return;

//     const userMessage = inputMessage.trim();
//     setInputMessage('');
//     setIsLoading(true);
//     setError(null);

//     const newUserMessage = {
//       role: 'user' as const,
//       content: userMessage,
//       timestamp: formatTimestamp()
//     };

//     setMessages(prev => [...prev, newUserMessage]);

//     try {
//       const response = await sendMessageToBackend(userMessage);
      
//       setMessages(prev => [
//         ...prev,
//         {
//           role: 'assistant',
//           content: response,
//           timestamp: formatTimestamp()
//         }
//       ]);
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
//       setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const clearConversation = () => {
//     setMessages([]);
//     localStorage.removeItem('medical_chat_history');
//   };

//   const handleRetry = async () => {
//     if (messages.length === 0) return;
//     const lastUserMessage = messages[messages.length - 1];
//     if (lastUserMessage.role !== 'user') return;

//     setError(null);
//     setIsLoading(true);

//     try {
//       const response = await sendMessageToBackend(lastUserMessage.content);
      
//       setMessages(prev => [
//         ...prev,
//         {
//           role: 'assistant',
//           content: response,
//           timestamp: formatTimestamp()
//         }
//       ]);
//     } catch (error) {
//       const errorMessage = error instanceof Error ? error.message : 'Failed to retry message';
//       setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="chatbot-container">
//       <div className="chatbot-header">
//         <div className="header-icon">👨‍⚕️</div>
//         <div className="header-text">
//           <h1>SmartCare Medical Assistant</h1>
//           <span className="connection-status">
//             {error ? 'Connection Error' : 'Connected'}
//           </span>
//         </div>
//         <button 
//           onClick={clearConversation} 
//           className="clear-button"
//           title="Clear conversation"
//         >
//           🗑️
//         </button>
//       </div>

//       <div className="messages-container">
//         {messages.length === 0 ? (
//           <div className="welcome-message">
//             <h2>Hello! 👋</h2>
//             <p>I'm SmartCare, your medical assistant. How can I help you today?</p>
//             <p className="disclaimer">
//               Note: I provide general medical information only. Always consult with a healthcare 
//               professional for specific medical advice.
//             </p>
//           </div>
//         ) : (
//           messages.map((message, index) => (
//             <div
//               key={`${message.timestamp}-${index}`}
//               className={`message-wrapper ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
//             >
//               <div className="message">
//                 <div className="message-content">{message.content}</div>
//                 <div className="message-timestamp">{message.timestamp}</div>
//               </div>
//             </div>
//           ))
//         )}

//         {isLoading && (
//           <div className="message-wrapper assistant-message">
//             <div className="message">
//               <div className="typing-indicator">
//                 <span></span>
//                 <span></span>
//                 <span></span>
//               </div>
//             </div>
//           </div>
//         )}

//         {error && (
//           <div className="error-message">
//             <p>{error}</p>
//             <button onClick={handleRetry} className="retry-button">
//               Try Again
//             </button>
//           </div>
//         )}

//         <div ref={messagesEndRef} />
//       </div>

//       <form onSubmit={handleSubmit} className="input-form">
//         <input
//           type="text"
//           value={inputMessage}
//           onChange={(e) => setInputMessage(e.target.value)}
//           placeholder="Type your medical question here..."
//           disabled={isLoading}
//           className="message-input"
//         />
//         <button 
//           type="submit" 
//           disabled={!inputMessage.trim() || isLoading}
//           className="send-button"
//         >
//           {isLoading ? (
//             <span className="sending">Sending...</span>
//           ) : (
//             <span className="send-icon">➤</span>
//           )}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Chatbot;