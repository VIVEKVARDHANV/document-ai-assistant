from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from langchain.text_splitter import CharacterTextSplitter
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.chains import RetrievalQA
from langchain.llms import OpenAI
import os
import tempfile

# Create FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
embeddings = OpenAIEmbeddings()
vector_store = None

# Upload endpoint
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    global vector_store
    
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        # Process Excel file
        df = pd.read_excel(tmp_path)
        text = "\n".join([str(row) for row in df.to_dict(orient='records')])
        
        # Split text into chunks
        text_splitter = CharacterTextSplitter(
            separator="\n",
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
        )
        chunks = text_splitter.split_text(text)
        
        # Create vector store
        vector_store = FAISS.from_texts(chunks, embeddings)
        
        os.unlink(tmp_path)
        return {"message": "File processed successfully"}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Ask endpoint
@app.post("/ask")
async def ask_question(data: dict):
    global vector_store
    if not vector_store:
        raise HTTPException(status_code=400, detail="Please upload a document first")
    
    try:
        qa = RetrievalQA.from_chain_type(
            llm=OpenAI(temperature=0),
            chain_type="stuff",
            retriever=vector_store.as_retriever(),
        )
        
        result = qa.run(data['question'])
        return {"answer": result}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))