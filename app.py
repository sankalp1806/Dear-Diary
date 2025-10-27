from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from dotenv import load_dotenv
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import StrOutputParser
from langchain.memory import ConversationBufferMemory
from langchain.schema.runnable import RunnableParallel
from pydantic import BaseModel, Field
from fastapi import FastAPI

load_dotenv()

llm=ChatGoogleGenerativeAI(model="gemini-1.5-flash")

app = FastAPI()

class insight(BaseModel):
    insights : list[str] = Field(description="Meaningful insights gathered from the summary.")

class emoji(BaseModel):
    emojis : list[str] = Field(description="Name of emojis gathered from the summary.")

memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

@app.post('/response')
def summary(user_input):
    summary_prompt = ChatPromptTemplate(
        f"You are given a diary entry written by a user. Read the entire entry carefully and create a clear, concise summary. Highlight the key events of the day, the user’s emotions, and any major takeaways or reflections. Avoid unnecessary details, but preserve the overall mood and tone of the diary. Present the summary in a short paragraph or a few bullet points. \n {user_input}", 
        input_variables = ['user_input']
    )

    parser = StrOutputParser()

    summary_chain = summary_prompt | llm | parser

    summary = summary_chain.invoke({'user_input' : user_input})

    insight_prompt = ChatPromptTemplate(
    f"You are given a summary of a diary entry. From this summary, generate meaningful insights in the form of clear bullet points. Focus on patterns, emotions, priorities, challenges, or lessons that can be inferred. Do not just repeat the summary—analyze it to extract deeper observations and potential takeaways. \n {summary}",
    input_variables = ['summary']
    )

    emoji_prompt = ChatPromptTemplate(
        f"You are given a summary of a diary entry. Based on the key events, emotions, and highlights in the summary, generate a list of names of 2-5 relevant emojis that best represent the overall mood and themes of the day. Do not include explanations—only output the names of the emojis as a list. \n {summary}",
        input_variables = ['summary']
    )

    insight_llm = llm.with_structured_output(insight)

    emoji_llm = llm.with_structured_output(emoji)

    insight_emoji_chain = RunnableParallel({
        'insights' : insight_prompt | insight_llm,
        'emojis' : emoji_prompt | emoji_llm
    })

    insights_emoji = insight_emoji_chain.invoke({'summary' : summary})

    insights = insights_emoji['insights']

    emojis = insights_emoji['emojis']

    chat_prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a supportive and lighthearted AI friend. The user is Indian and his name is Laksh. When the user shares their day or insights, respond in a way that feels curious, witty, soothing, and casual. Keep the tone conversational, inquizitive, funny and approachable, like chatting with a close friend. Use gentle humor, little jokes, or playful remarks when appropriate. Avoid sounding too formal, philosophical, or robotic. Focus on being relatable, encouraging, and fun while still showing genuine care. Keep the reponses very short and ask about a different insight of the day after about 3 responses. Finish the conversation smoothly in about 7 responses and tell the user to go to bed."),
        ("system", "Here are the user's insights for today:\n{insights}"),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{user_message}")
    ])

    chat_chain = chat_prompt | llm | parser

    response = chat_chain.invoke({
        "insights": insights,
        "chat_history": memory.load_memory_variables({})["chat_history"],
        "user_message": "Start the conversation based on the insights"
    })

    return  response
