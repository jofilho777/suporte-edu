import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Inicializa o cliente OpenAI com a API key do .env
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(request: NextRequest) {
  try {
    // Verifica se a API key existe
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "") {
      return NextResponse.json(
        { error: "OPENAI_API_KEY não configurada" },
        { status: 500 }
      );
    }

    // Obtém as mensagens do corpo da requisição
    const { messages } = await request.json();

    // Verifica se as mensagens existem
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Formato de mensagens inválido" },
        { status: 400 }
      );
    }

    // Formata as mensagens para o formato da OpenAI
    const openaiMessages = messages.map((msg: any) => ({
      role: msg.role === "ai" ? "assistant" : msg.role,
      content: msg.content,
    }));

    // Faz a requisição para a API da OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: openaiMessages,
      temperature: 0.7,
      max_tokens: 500,
    });

    // Obtém a resposta
    const aiResponse = completion.choices[0].message.content;

    // Retorna a resposta
    return NextResponse.json({ aiResponse });
  } catch (error: any) {
    console.error("Erro na API:", error);
    return NextResponse.json(
      { error: error.message || "Erro desconhecido" },
      { status: 500 }
    );
  }
} 