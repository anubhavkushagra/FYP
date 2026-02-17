import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv

# --- YOUR REQUESTED IMPORTS ---
from langchain.chat_models import init_chat_model
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_community.embeddings import HuggingFaceBgeEmbeddings
from qdrant_client import QdrantClient

# --- CONFIGURATION ---
# ⚠️ Make sure this matches your Qdrant collection name
COLLECTION_NAME = "semantic_chunking_with_metadata_bge"
QDRANT_HOST = "localhost"
QDRANT_PORT = 6333

#load_dotenv()
# ⚠️ Set your API key here (or better, in your terminal environment)
os.environ["OPENAI_API_KEY"] = ""

# --- INITIALIZATION ---
app = FastAPI(title="Medical RAG API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Initialize Qdrant
client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)

# 2. Initialize BGE Embeddings
print("📥 Loading BGE Model...")
embedding_model = HuggingFaceBgeEmbeddings(
    model_name="BAAI/bge-small-en",
    model_kwargs={"device": "cpu"},
    encode_kwargs={"normalize_embeddings": True}
)

# 3. Initialize Chat Model (Modern Way)
llm = init_chat_model("gpt-4o-mini", model_provider="openai")

# --- DATA MODELS ---
class QueryRequest(BaseModel):
    question: str

class Source(BaseModel):
    content: str
    metadata: dict

class QueryResponse(BaseModel):
    answer: str
    sources: List[Source]

# --- PROMPT TEMPLATE ---
prompt_template = ChatPromptTemplate.from_messages([
    ("system", "You are a DSM-5 clinical evaluation specialist."),
    ("human", """
    Answer the user's question based ONLY on the following context.
    
    CONTEXT:
    {context}

    QUESTION:
    {question}

    If the answer is not in the context, state that you do not have enough information.
    """)
])

# --- API ENDPOINT ---
@app.post("/ask", response_model=QueryResponse)
async def ask_question(request: QueryRequest):
    try:
        print(f"🔎 Question received: {request.question}")

        # 1. Embed Question
        query_vector = embedding_model.embed_query(request.question)

        # 2. Search Qdrant (Using the exact method from your benchmark script)
        results = client.query_points(
            collection_name=COLLECTION_NAME,
            query=query_vector,
            limit=5,
            with_vectors=False # We only need payload
        ).points

        if not results:
            return QueryResponse(answer="No relevant medical data found.", sources=[])

        # 3. Format Context
        context_text = ""
        sources_list = []

        for point in results:
            # Handle different payload structures
            content = point.payload.get("text", "") or point.payload.get("content", "")
            metadata = point.payload
            
            context_text += f"---\n{content}\n"
            sources_list.append(Source(content=content, metadata=metadata))

        # 4. Generate Answer
        chain = prompt_template | llm | StrOutputParser()
        answer = chain.invoke({
            "context": context_text,
            "question": request.question
        })

        return QueryResponse(answer=answer, sources=sources_list)

    except Exception as e:
        print(f"❌ Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)