
import streamlit as st
from langchain.chains import ConversationalRetrievalChain
from langchain.llms import OpenAI
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate
from langchain.tools import Tool
from langchain.agents import initialize_agent, Tool, AgentType
from transformers import AutoModel, AutoTokenizer
import torch

# Load SAPBERT Model
@st.cache_resource
def load_sapbert_model():
    model_name = "cambridgeltl/SapBERT-from-PubMedBERT-fulltext"  # SAPBERT Hugging Face Model
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModel.from_pretrained(model_name)
    return model, tokenizer

# Function to Embed Query Using SAPBERT
def embed_query(query, model, tokenizer):
    tokens = tokenizer(query, return_tensors="pt", padding=True, truncation=True, max_length=128)
    with torch.no_grad():
        embeddings = model(**tokens).pooler_output
    return embeddings

# Tool: SAPBERT Semantic Search
def sapbert_tool(input_text: str) -> str:
    """
    A tool that uses SAPBERT embeddings to find semantic relations in the medical domain.
    """
    embeddings = embed_query(input_text, sapbert_model, sapbert_tokenizer)
    # Add logic to use these embeddings for similarity search or retrieval
    # For example: Compare against a database of medical terms
    return "This is a placeholder response for SAPBERT functionality."

# Initialize SAPBERT Model
sapbert_model, sapbert_tokenizer = load_sapbert_model()

# LangChain Tools
sapbert_tool_instance = Tool(
    name="SAPBERT Semantic Search",
    func=sapbert_tool,
    description="Uses SAPBERT embeddings for semantic search in medical contexts."
)

# LangChain LLM (e.g., GPT-4)
llm = OpenAI(temperature=0.7, model_name="gpt-4")  # Replace with your LLM of choice

# LangChain Memory
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

# LangChain Agent
tools = [sapbert_tool_instance]
agent = initialize_agent(tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, memory=memory)

# Streamlit App
st.title("Smart Adaptive Learning Medical Chatbot")
st.write("Powered by SAPBERT, LangChain, and GPT-4.")

# User Input
user_input = st.text_input("Ask a medical question:")

if user_input:
    with st.spinner("Processing..."):
        response = agent.run(user_input)
        st.success("Response:")
        st.write(response)

# Display Chat History
if "chat_history" in memory.buffer:
    st.write("### Chat History")
    for message in memory.buffer:
        role = "You" if message["role"] == "user" else "Bot"
        st.write(f"**{role}:** {message['content']}")
