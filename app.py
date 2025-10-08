from fastapi import FastAPI
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain.memory import ConversationBufferMemory
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema.runnable import RunnableParallel
from pydantic import BaseModel as PydanticBaseModel, Field

load_dotenv()
app = FastAPI(title="Diary Chatbot API")
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash")
parser = StrOutputParser()
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

class Message(BaseModel):
    message: str

class DiaryRequest(BaseModel):
    diary_entry: str

class InsightModel(PydanticBaseModel):
    insights: list[str] = Field(description="Meaningful insights from the diary summary")

class EmojiModel(PydanticBaseModel):
    emojis: list[str] = Field(description="Relevant emoji names for the diary summary")

# Use a global dictionary to store insights per user/session if needed
# For simplicity, we'll use a single global variable.
insights_storage = {"insights": []}

@app.post("/process-diary")
async def process_diary(request: DiaryRequest):
    global insights_storage
    # Summary
    summary_prompt_template = ChatPromptTemplate.from_template(
        "You are given a diary entry written by a user. Read the entire entry carefully and create a clear, concise summary. Highlight the key events of the day, the user’s emotions, and any major takeaways or reflections. Avoid unnecessary details, but preserve the overall mood and tone of the diary. Present the summary in a short paragraph or a few bullet points. \n {diary_entry}"
    )
    summary_chain = summary_prompt_template | llm | parser
    summary = summary_chain.invoke({"diary_entry": request.diary_entry})

    # Insights + Emojis
    insight_prompt_template = ChatPromptTemplate.from_template(
       "You are given a summary of a diary entry. From this summary, generate meaningful insights in the form of clear bullet points. Focus on patterns, emotions, priorities, challenges, or lessons that can be inferred. Do not just repeat the summary—analyze it to extract deeper observations and potential takeaways. \n {summary}"
    )

    emoji_prompt_template = ChatPromptTemplate.from_template(
        "You are given a summary of a diary entry. Based on the key events, emotions, and highlights in the summary, generate a list of names of 2-5 relevant emojis that best represent the overall mood and themes of the day. Do not include explanations—only output the names of the emojis as a list. \n {summary}"
    )

    insight_llm = llm.with_structured_output(InsightModel)
    emoji_llm = llm.with_structured_output(EmojiModel)

    insight_emoji_chain = RunnableParallel({
        "insights": insight_prompt_template | insight_llm,
        "emojis": emoji_prompt_template | emoji_llm
    })

    result = insight_emoji_chain.invoke({"summary": summary})
    
    # Store insights for the chat endpoint
    insights_storage["insights"] = result["insights"].insights
    
    # Clear conversation memory for the new entry
    memory.clear()

    return {
        "summary": summary,
        "insights": insights_storage["insights"],
        "emojis": result["emojis"].emojis
    }

@app.post("/chat")
async def chat(message: Message):
    global insights_storage
    
    insights = insights_storage.get("insights", [])

    chat_prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a supportive and lighthearted AI friend. The user is Indian and his name is Laksh. "
                   "When the user shares their day or insights, respond in a curious, witty, soothing, and casual way. "
                   "Keep tone playful and fun, avoid being too formal. End conversations smoothly after ~7 responses, "
                   "reminding the user to go to bed."),
        ("system", "Here are the user's insights for today:\n{insights}"),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{message}")
    ])

    chat_chain = chat_prompt | llm | parser

    chat_history = memory.load_memory_variables({}).get("chat_history", [])

    response = chat_chain.invoke({
        "insights": insights,
        "chat_history": chat_history,
        "message": message.message
    })

    memory.save_context({"input": message.message}, {"output": response})

    return {"reply": response}
