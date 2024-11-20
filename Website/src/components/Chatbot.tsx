// import React, { useState } from "react";
// import axios from "axios";
// import "./css/styles.css"; // Add this for styling

// const ChatbotUI: React.FC = () => {
//   const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
//   const [input, setInput] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(false);

//   const handleSend = async () => {
//     if (!input.trim()) return;
//     const modifiedInput = `${input.trim()} (within 50 words)`;
//     const userMessage = { role: "user", content: modifiedInput };
//     setMessages((prev) => [...prev, userMessage]);
//     setInput("");
//     setLoading(true);

//     const options = {
//       method: "POST",
//       url: "https://chatgpt-42.p.rapidapi.com/chatbotapi",
//       headers: {
//         "x-rapidapi-key": "0a607eeb25msha83e3f98c643f42p1e8d71jsn99685d9413f5",
//         "x-rapidapi-host": "chatgpt-42.p.rapidapi.com",
//         "Content-Type": "application/json",
//       },
//       data: {
//         bot_id: "OEXJ8qFp5E5AwRwymfPts90vrHnmr8yZgNE171101852010w2S0bCtN3THp448W7kDSfyTf3OpW5TUVefz",
//         messages: [...messages, userMessage],
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
//       console.log(response.data.result)
//       const botMessage = { role: "bot", content: response.data?.result || "No response received." };
//       setMessages((prev) => [...prev, botMessage]);
//     } catch (err) {
//       setMessages((prev) => [...prev, { role: "bot", content: "Error: no responce from BERT." }]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="chatbot-container">
//       <div className="chatbot-header">SmartCare</div>
//       <div className="chatbot-chat-window">
//         {messages.map((message, index) => (
//           <div
//             key={index}
//             className={`chatbot-message ${message.role === "user" ? "user" : "bot"}`}
//           >
//             {message.content}
//           </div>
//         ))}
//         {loading && <div className="chatbot-message bot">Loading...</div>}
//       </div>
//       <div className="chatbot-input-area">
//         <input
//           type="text"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           placeholder="Type a message..."
//         />
//         <button onClick={handleSend} disabled={loading}>
//           Send
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ChatbotUI;


import React, { useState } from "react";
import axios from "axios";
import "./css/styles.css"; // Add this for styling

const ChatbotUI: React.FC = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState<string>(""); 
  const [loading, setLoading] = useState<boolean>(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessageContent = input.trim();  // The message that will be displayed
    const modifiedInput = `${userMessageContent} (within 10 to 20 words and you need to answer only medical question else say only has medical knowledge)`;  // Modify for API request

    const userMessage = { role: "user", content: userMessageContent }; // Send only the original content to UI
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    const options = {
      method: "POST",
      url: "https://chatgpt-42.p.rapidapi.com/chatbotapi",
      headers: {
        "x-rapidapi-key": "0a607eeb25msha83e3f98c643f42p1e8d71jsn99685d9413f5",
        "x-rapidapi-host": "chatgpt-42.p.rapidapi.com",
        "Content-Type": "application/json",
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
      console.log(response.data.result);
      const botMessage = { role: "bot", content: response.data?.result || "No response received." };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "bot", content: "Error: no response from BERT." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">SmartCare</div>
      <div className="chatbot-chat-window">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chatbot-message ${message.role === "user" ? "user" : "bot"}`}
          >
            {message.content}
          </div>
        ))}
        {loading && <div className="chatbot-message bot">Loading...</div>}
      </div>
      <div className="chatbot-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={handleSend} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatbotUI;
