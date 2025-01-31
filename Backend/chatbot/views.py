
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
os.environ["MISTRAL_API_KEY"] = "fKvEx9jkjolPiDfSY2h6HF3RcZGyX6hi"
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
        response["Access-Control-Allow-Origin"] = "*"
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