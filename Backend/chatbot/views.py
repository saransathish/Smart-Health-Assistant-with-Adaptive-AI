# import os
# import json
# import pandas as pd
# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# from langchain_mistralai.chat_models import ChatMistralAI
# from langchain.chains import RetrievalQA
# from langchain.vectorstores import FAISS
# from langchain.embeddings import HuggingFaceEmbeddings
# from langchain.text_splitter import CharacterTextSplitter
# from langchain.document_loaders import DataFrameLoader

# # Load the medical dataset
# def load_medical_data():
#     df = pd.read_csv("data/medQuad/smallmedQuad.csv")
#     return df

# # Create embeddings and vector store
# def create_vector_store(df):
#     # Convert the DataFrame into LangChain documents
#     loader = DataFrameLoader(df, page_content_column="Question")
#     documents = loader.load()

#     # Split the documents into chunks
#     text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
#     texts = text_splitter.split_documents(documents)

#     # Create embeddings
#     embeddings = HuggingFaceEmbeddings()

#     # Create the vector store
#     vectorstore = FAISS.from_documents(texts, embeddings)
#     return vectorstore

# # Initialize the Mistral LLM
# def initialize_llm():
#     return ChatMistralAI(api_key=os.getenv("MISTRAL_API_KEY"))

# # Create the RAG pipeline
# def create_rag_pipeline(vectorstore, llm):
#     return RetrievalQA.from_chain_type(
#         llm=llm,
#         chain_type="stuff",
#         retriever=vectorstore.as_retriever(),
#     )

# # Load data and initialize components
# df = load_medical_data()
# vectorstore = create_vector_store(df)
# llm = initialize_llm()
# qa_chain = create_rag_pipeline(vectorstore, llm)

# # Chatbot endpoint
# @csrf_exempt
# def chatbot(request):
#     if request.method == "POST":
#         try:
#             data = json.loads(request.body)
#             user_message = data.get("message")
#             conversation_history = data.get("history", [])

#             # Add the user message to the conversation history
#             conversation_history.append({"role": "user", "content": user_message})

#             # Get the chatbot's response
#             response = qa_chain.invoke({"question": user_message})["answer"]

#             # Add the chatbot's response to the conversation history
#             conversation_history.append({"role": "assistant", "content": response})

#             return JsonResponse({
#                 "response": response,
#                 "history": conversation_history,
#             })
#         except Exception as e:
#             return JsonResponse({"error": str(e)}, status=500)
#     return JsonResponse({"error": "Invalid request method"}, status=400)

# import json
# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# from langchain.llms import HuggingFacePipeline
# from langchain.chains import LLMChain
# from langchain.prompts import PromptTemplate
# from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
# import torch

# def initialize_model():
#     """Initialize the medical LLM model"""
#     MODEL_NAME = "microsoft/BioGPT-Large"  # Alternative: "medalpaca/medalpaca-7b"
    
#     tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
#     model = AutoModelForCausalLM.from_pretrained(
#         MODEL_NAME,
#         device_map="auto" if torch.cuda.is_available() else "cpu",
#         trust_remote_code=True,
#         load_in_8bit=True if torch.cuda.is_available() else False
#     )
    
#     pipe = pipeline(
#         "text-generation",
#         model=model,
#         tokenizer=tokenizer,
#         max_length=512,
#         temperature=0.7,
#         top_p=0.95,
#         repetition_penalty=1.15,
#         do_sample=True
#     )
    
#     llm = HuggingFacePipeline(pipeline=pipe)
#     return llm

# # Initialize the medical prompt template
# MEDICAL_PROMPT = PromptTemplate(
#     input_variables=["chat_history", "query"],
#     template="""You are an advanced medical AI assistant trained to provide accurate and helpful medical information. 
    
# Previous conversation:
# {chat_history}

# Current query: {query}

# Please provide a clear, accurate medical response while maintaining professional medical terminology where appropriate. 
# If you're unsure about anything, be transparent about the limitations of your knowledge.

# Medical Response:"""
# )

# # Initialize components
# medical_llm = initialize_model()
# medical_chain = LLMChain(llm=medical_llm, prompt=MEDICAL_PROMPT)

# def format_chat_history(history):
#     """Format the chat history into a string"""
#     formatted_history = ""
#     if history:
#         for message in history:
#             role = message.get("role", "")
#             content = message.get("content", "")
#             formatted_history += f"{role.capitalize()}: {content}\n"
#     return formatted_history

# @csrf_exempt
# def chatbot(request):
#     """Chatbot endpoint handling the conversation"""
#     if request.method == "POST":
#         try:
#             data = json.loads(request.body)
#             user_message = data.get("message", "").strip()
#             conversation_history = data.get("history", [])

#             if not user_message:
#                 return JsonResponse({
#                     "error": "Empty message received"
#                 }, status=400)

#             # Format the chat history
#             formatted_history = format_chat_history(conversation_history)

#             # Generate response using the medical chain
#             response = medical_chain.run({
#                 "chat_history": formatted_history,
#                 "query": user_message
#             })

#             # Update conversation history
#             conversation_history.append({"role": "user", "content": user_message})
#             conversation_history.append({"role": "assistant", "content": response})

#             return JsonResponse({
#                 "response": response,
#                 "history": conversation_history,
#             })

#         except json.JSONDecodeError:
#             return JsonResponse({
#                 "error": "Invalid JSON data"
#             }, status=400)
#         except Exception as e:
#             return JsonResponse({
#                 "error": f"Error processing request: {str(e)}"
#             }, status=500)

#     return JsonResponse({
#         "error": "Invalid request method"
#     }, status=400)

# import os
# import json
# from typing import Dict, List
# from django.http import JsonResponse
# from django.views.decorators.csrf import csrf_exempt
# from langchain_mistralai.chat_models import ChatMistralAI
# from langchain.agents import Tool, AgentExecutor, create_react_agent
# from langchain.prompts import PromptTemplate
# from langchain.memory import ConversationBufferMemory
# from langchain.tools import tool
# from django.core.cache import cache

# # Tool definitions
# @tool
# def medical_diagnosis_checker(symptoms: str) -> str:
#     """Check symptoms and provide general medical information. Only use for medical queries."""
#     # This would typically connect to a medical knowledge base or API
#     # For now, we'll return a placeholder response
#     return "Based on the symptoms described, please consult a healthcare professional for proper diagnosis."

# @tool
# def medication_info(medication: str) -> str:
#     """Provide general information about medications."""
#     # This would typically connect to a medication database
#     return f"This tool provides general information about {medication}. Please consult a healthcare provider for specific medical advice."

# @tool
# def first_aid_guide(condition: str) -> str:
#     """Provide basic first aid information."""
#     return f"Here are general first aid guidelines for {condition}. For emergencies, please call emergency services immediately."

# class MedicalChatbot:
#     def __init__(self):
#         self.llm = ChatMistralAI(
#             api_key=os.getenv("MISTRAL_API_KEY"),
#             model="mistral-medium",
#             temperature=0.7,
#         )
        
#         # Define tools
#         self.tools = [
#             Tool(
#                 name="MedicalDiagnosisChecker",
#                 func=medical_diagnosis_checker,
#                 description="Use this tool for checking medical symptoms and getting general medical information"
#             ),
#             Tool(
#                 name="MedicationInfo",
#                 func=medication_info,
#                 description="Use this tool for getting information about medications"
#             ),
#             Tool(
#                 name="FirstAidGuide",
#                 func=first_aid_guide,
#                 description="Use this tool for getting basic first aid information"
#             )
#         ]
        
#         # Define the prompt template for medical focus
#         self.prompt = PromptTemplate.from_template("""
#             You are a medical chatbot assistant. Only answer medical-related questions and politely decline
#             non-medical queries. Always remind users to consult healthcare professionals for specific medical advice.
#             Use the available tools to provide helpful information.

#             Previous conversation history: {chat_history}
            
#             Human: {input}
            
#             Assistant: Let me help you with your medical query. I'll use my tools and knowledge to provide
#             general information, but remember that this isn't a substitute for professional medical advice.
            
#             {agent_scratchpad}
#         """)
        
#         # Create the agent
#         self.agent = create_react_agent(
#             llm=self.llm,
#             tools=self.tools,
#             prompt=self.prompt
#         )
        
#         self.agent_executor = AgentExecutor(
#             agent=self.agent,
#             tools=self.tools,
#             verbose=True,
#             max_iterations=3
#         )

#     def get_response(self, user_message: str, session_id: str) -> str:
#         # Get or create session memory
#         memory_key = f"chat_memory_{session_id}"
#         memory = cache.get(memory_key)
        
#         if memory is None:
#             memory = ConversationBufferMemory(
#                 memory_key="chat_history",
#                 return_messages=True
#             )
        
#         # Execute the agent with memory
#         response = self.agent_executor.invoke({
#             "input": user_message,
#             "chat_history": memory.load_memory_variables({})["chat_history"]
#         })
        
#         # Update memory
#         memory.save_context(
#             {"input": user_message},
#             {"output": response["output"]}
#         )
        
#         # Save memory back to cache with expiration (e.g., 1 hour)
#         cache.set(memory_key, memory, timeout=3600)
        
#         return response["output"]

# # Initialize the chatbot
# medical_chatbot = MedicalChatbot()

# @csrf_exempt
# def chatbot(request):
#     if request.method == "POST":
#         try:
#             data = json.loads(request.body)
#             user_message = data.get("message")
#             session_id = request.session.session_key
            
#             # Create session if it doesn't exist
#             if not session_id:
#                 request.session.create()
#                 session_id = request.session.session_key
            
#             # Get response from chatbot
#             response = medical_chatbot.get_response(user_message, session_id)
            
#             # Get conversation history from cache
#             memory_key = f"chat_memory_{session_id}"
#             memory = cache.get(memory_key)
#             history = []
            
#             if memory:
#                 history = memory.load_memory_variables({})["chat_history"]
            
#             return JsonResponse({
#                 "response": response,
#                 "history": history,
#                 "session_id": session_id
#             })
            
#         except Exception as e:
#             return JsonResponse({
#                 "error": str(e),
#                 "detail": "An error occurred while processing your request"
#             }, status=500)
            
#     return JsonResponse({"error": "Invalid request method"}, status=400)


from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from langchain_mistralai.chat_models import ChatMistralAI
from langchain.memory import ConversationBufferMemory
from langchain.tools import DuckDuckGoSearchRun
from langchain.agents import initialize_agent, Tool, AgentType
from langchain.schema import HumanMessage, SystemMessage
import json
import os

# Initialize Mistral AI
os.environ["MISTRAL_API_KEY"] = "your-mistral-api-key"
llm = ChatMistralAI(
    model="mistral-medium",
    temperature=0.7,
    max_tokens=2048,
    top_p=0.9,
    streaming=False
)

@method_decorator(csrf_exempt, name='dispatch')
class Chatbot(View):
    def __init__(self):
        super().__init__()
        # Initialize memory
        self.memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True
        )
        
        # Initialize search tool
        self.search = DuckDuckGoSearchRun()
        
        # Define tools
        self.tools = [
            Tool(
                name="Medical Search",
                func=self.medical_search,
                description="Search for medical information"
            )
        ]
        
        # Initialize the agent
        self.agent = initialize_agent(
            self.tools,
            llm,
            agent=AgentType.CONVERSATIONAL_REACT_DESCRIPTION,
            memory=self.memory,
            verbose=True,
            handle_parsing_errors=True,
            max_iterations=2
        )

        # Define system message for direct LLM fallback
        self.system_message = """You are SmartCare, a medical AI assistant. Important guidelines:
        1. Provide accurate medical information with appropriate disclaimers
        2. Never make definitive diagnoses
        3. Always recommend consulting healthcare professionals
        4. Use reliable medical sources
        5. Be clear about limitations
        6. In emergencies, direct users to immediate medical attention
        """

    def medical_search(self, query: str) -> str:
        """Enhanced medical search function"""
        try:
            enhanced_query = f"medical information about {query} from reliable medical sources"
            return self.search.run(enhanced_query)
        except Exception as e:
            return f"Error performing medical search: {str(e)}"

    def get_response(self, query: str) -> str:
        """Get response while handling potential errors"""
        try:
            if not query:
                return "Please provide a valid question."
            
            try:
                # Try using the agent first
                return self.agent.run(input=query)
            except Exception as agent_error:
                # Fallback to direct LLM if agent fails
                messages = [
                    SystemMessage(content=self.system_message),
                    HumanMessage(content=query)
                ]
                response = llm.invoke(messages)
                return response.content if hasattr(response, 'content') else str(response)
                
        except Exception as e:
            return f"I apologize, but I encountered an error. Please try rephrasing your question. Error: {str(e)}"

    def options(self, request, *args, **kwargs):
        """Handle preflight CORS requests"""
        response = JsonResponse({})
        response["Access-Control-Allow-Origin"] = "http://localhost:5173"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, X-CSRFToken"
        return response

    def post(self, request, *args, **kwargs):
        """Handle POST requests"""
        try:
            # Parse the request body
            data = json.loads(request.body)
            query = data.get('query', '')
            
            if not query:
                response_data = {
                    'success': False,
                    'response': 'No query provided'
                }
                status_code = 400
            else:
                # Get response from the model
                bot_response = self.get_response(query)
                response_data = {
                    'success': True,
                    'response': bot_response,
                    'disclaimer': ("This information is for educational purposes only. "
                                 "Please consult with a healthcare provider for medical advice.")
                }
                status_code = 200

        except json.JSONDecodeError:
            response_data = {
                'success': False,
                'response': 'Invalid JSON data'
            }
            status_code = 400
            
        except Exception as e:
            response_data = {
                'success': False,
                'response': f'Error: {str(e)}'
            }
            status_code = 500

        # Create response with CORS headers
        response = JsonResponse(response_data, status=status_code)
        response["Access-Control-Allow-Origin"] = "http://localhost:5173"
        response["Access-Control-Allow-Credentials"] = "true"
        return response

    def get(self, request, *args, **kwargs):
        """Handle GET requests"""
        response = JsonResponse({
            'success': False,
            'response': 'Please use POST method to interact with SmartCare'
        }, status=405)
        response["Access-Control-Allow-Origin"] = "http://localhost:5173"
        return response