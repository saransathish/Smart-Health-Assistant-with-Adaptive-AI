import React, { useState } from 'react';
import axios from 'axios';
import './css/Chatbot.css';

interface Message {
    text: string;
    sender: 'user' | 'bot';
}

const Chatbot: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (inputText.trim()) {
            const userMessage: Message = { text: inputText, sender: 'user' };
            setMessages((prevMessages) => [...prevMessages, userMessage]);
            setInputText('');

            try {
                const response = await axios.post('http://127.0.0.1:8000/api/chatbot/chat/', {
                    message: inputText,
                    history: messages.map((msg) => ({
                        role: msg.sender === 'user' ? 'user' : 'assistant',
                        content: msg.text,
                    })),
                });

                const botMessage: Message = { text: response.data.response, sender: 'bot' };
                setMessages((prevMessages) => [...prevMessages, botMessage]);
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
    };

    return (
        <div className="chatbot-container">
            <div className="chatbot-box">
                <h2>SMART CARE</h2>
                <div className="chat-window">
                    {messages.map((message, index) => (
                        <div key={index} className={`message ${message.sender}`}>
                            {message.text}
                        </div>
                    ))}
                </div>
                <form onSubmit={handleSendMessage} className="chat-input">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type a message..."
                        required
                    />
                    <button type="submit">Send</button>
                </form>
            </div>
        </div>
    );
};

export default Chatbot;