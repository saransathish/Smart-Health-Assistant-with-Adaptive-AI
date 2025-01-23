# Required imports
import streamlit as st
import langchain
from langchain_community.llms import Ollama
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
import speech_recognition as sr
import cv2
import numpy as np
import torch
from transformers import pipeline
import pytesseract
from PIL import Image

class MedicalChatbot:
    def __init__(self):
        # Initialize Ollama LLM
        self.llm = Ollama(model="llama2")
        
        # Initialize conversation memory
        self.memory = ConversationBufferMemory(return_messages=True)
        
        # Create conversation chain
        self.conversation = ConversationChain(
            llm=self.llm, 
            memory=self.memory, 
            verbose=True
        )
        
        # Initialize medical image analysis model
        self.image_analyzer = self._load_medical_image_model()
        
        # Initialize speech recognition
        self.recognizer = sr.Recognizer()
    
    def _load_medical_image_model(self):
        # Load medical image analysis model (using a pre-trained model for medical image classification)
        model = pipeline(
            "image-classification", 
            model="facebook/convnext-base-224-22k",
            device=0 if torch.cuda.is_available() else -1
        )
        return model
    
    def process_voice_input(self):
        """Process voice input and convert to text"""
        with sr.Microphone() as source:
            st.info("Listening... Please speak now.")
            audio = self.recognizer.listen(source)
            try:
                text = self.recognizer.recognize_google(audio)
                return text
            except sr.UnknownValueError:
                st.error("Sorry, could not understand audio")
                return ""
            except sr.RequestError:
                st.error("Could not request results from speech recognition service")
                return ""
    
    def analyze_medical_image(self, image):
        """Analyze medical image using pre-trained model"""
        try:
            # Convert image to PIL format if it's not already
            if not isinstance(image, Image.Image):
                image = Image.fromarray(image)
            
            # Perform image analysis
            results = self.image_analyzer(image)
            
            # Extract text from image using OCR
            ocr_text = pytesseract.image_to_string(image)
            
            return {
                "classification": results,
                "ocr_text": ocr_text
            }
        except Exception as e:
            st.error(f"Image analysis error: {e}")
            return None
    
    def generate_medical_response(self, user_input, context=None):
        """Generate medical response using LLM"""
        try:
            # Add context from image analysis if available
            if context:
                full_input = f"{user_input}\n\nAdditional Context: {context}"
            else:
                full_input = user_input
            
            # Generate response
            response = self.conversation.predict(input=full_input)
            return response
        except Exception as e:
            st.error(f"Response generation error: {e}")
            return "I'm sorry, I couldn't generate a response. Please try again."

def main():
    st.title("Medical AI Assistant")
    
    # Initialize chatbot
    chatbot = MedicalChatbot()
    
    # Sidebar for additional controls
    st.sidebar.header("Medical AI Tools")
    
    # Voice Input Section
    st.sidebar.subheader("Voice Input")
    if st.sidebar.button("Start Voice Input"):
        voice_input = chatbot.process_voice_input()
        if voice_input:
            st.sidebar.text(f"Recognized: {voice_input}")
    
    # Image Upload Section
    st.sidebar.subheader("Medical Image Analysis")
    uploaded_image = st.sidebar.file_uploader("Upload Medical Image", type=["png", "jpg", "jpeg"])
    
    # Main Chat Interface
    user_input = st.text_input("Enter your medical query:")
    
    # Process Image if Uploaded
    image_context = None
    if uploaded_image is not None:
        # Read and process the uploaded image
        image = Image.open(uploaded_image)
        st.image(image, caption="Uploaded Medical Image", width=300)
        
        # Analyze the image
        image_analysis = chatbot.analyze_medical_image(image)
        if image_analysis:
            st.sidebar.json(image_analysis)
            image_context = str(image_analysis)
    
    # Generate Response
    if st.button("Send"):
        if user_input:
            # Generate response with optional image context
            response = chatbot.generate_medical_response(user_input, image_context)
            
            # Display conversation history
            st.write("You:", user_input)
            st.write("AI:", response)

if __name__ == "__main__":
    main()