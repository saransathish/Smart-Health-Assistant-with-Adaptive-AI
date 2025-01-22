import os
import json
import pandas as pd
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from langchain_mistralai.chat_models import ChatMistralAI
from langchain.chains import RetrievalQA
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.text_splitter import CharacterTextSplitter
from langchain.document_loaders import DataFrameLoader

# Load the medical dataset
def load_medical_data():
    df = pd.read_csv("data/med_data.csv")
    return df

# Create embeddings and vector store
def create_vector_store(df):
    # Convert the DataFrame into LangChain documents
    loader = DataFrameLoader(df, page_content_column="Question")
    documents = loader.load()

    # Split the documents into chunks
    text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    texts = text_splitter.split_documents(documents)

    # Create embeddings
    embeddings = HuggingFaceEmbeddings()

    # Create the vector store
    vectorstore = FAISS.from_documents(texts, embeddings)
    return vectorstore

# Initialize the Mistral LLM
def initialize_llm():
    return ChatMistralAI(api_key=os.getenv("MISTRAL_API_KEY"))

# Create the RAG pipeline
def create_rag_pipeline(vectorstore, llm):
    return RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=vectorstore.as_retriever(),
    )

# Load data and initialize components
df = load_medical_data()
vectorstore = create_vector_store(df)
llm = initialize_llm()
qa_chain = create_rag_pipeline(vectorstore, llm)

# Chatbot endpoint
@csrf_exempt
def chatbot(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            user_message = data.get("message")
            conversation_history = data.get("history", [])

            # Add the user message to the conversation history
            conversation_history.append({"role": "user", "content": user_message})

            # Get the chatbot's response
            response = qa_chain.run(user_message)

            # Add the chatbot's response to the conversation history
            conversation_history.append({"role": "assistant", "content": response})

            return JsonResponse({
                "response": response,
                "history": conversation_history,
            })
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Invalid request method"}, status=400)