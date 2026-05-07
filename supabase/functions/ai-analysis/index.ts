import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "relapse") {
      systemPrompt = `Você é um conselheiro compassivo e especializado em dependência de álcool e tabaco. 
Seu papel é oferecer suporte emocional, entender os gatilhos da recaída e fornecer estratégias práticas para prevenção futura.
Seja empático, não julgue, e ofereça esperança. Lembre-se que recaídas fazem parte do processo de recuperação.
Responda em português brasileiro, de forma acolhedora e prática.`;
      
      userPrompt = `O usuário teve uma recaída e compartilhou o seguinte:

Gatilho/Motivo: ${data.trigger || "Não informado"}
Como se sentiu: ${data.feeling || "Não informado"}
O que consumiu: ${data.substance || "Não informado"}
Quantidade: ${data.amount || "Não informado"}
Dias limpos antes da recaída: ${data.daysCleanBefore || 0}

Por favor, ofereça:
1. Palavras de acolhimento e compreensão
2. Análise do gatilho e como evitá-lo no futuro
3. 3 estratégias práticas para quando sentir vontade
4. Uma mensagem motivacional para recomeçar

Mantenha a resposta concisa mas acolhedora.`;
    } else if (type === "testimony") {
      systemPrompt = `Você é um psicólogo especializado em dependência química e comportamental.
Analise o depoimento do usuário de forma profissional e empática.
Identifique padrões, forças e áreas de atenção.
Responda em português brasileiro.`;
      
      userPrompt = `Analise o seguinte depoimento de alguém em recuperação:

"${data.testimony}"

Contexto:
- Dias em recuperação: ${data.daysClean || 0}
- Tipo de dependência: ${data.dependencyType || "álcool e/ou tabaco"}

Por favor, forneça:
1. Análise dos pontos fortes identificados no depoimento
2. Áreas que merecem atenção
3. Sugestões personalizadas para o próximo passo na jornada
4. Uma reflexão inspiradora baseada no que foi compartilhado`;
    } else if (type === "journal") {
      systemPrompt = `Você é um conselheiro emocional, empático e laico, com sensibilidade espiritual cristã.
Pode citar eventualmente passagens da Bíblia católica (com referência) quando trouxerem conforto, sem impor religião.
Acolha sentimentos sem julgar. Nunca dê conselhos médicos. Use português brasileiro, tom humano e curto (máx. 6 parágrafos).`;
      userPrompt = `Entrada do diário (humor: ${data.mood || "n/d"}):
"${data.content}"

Responda com:
1. Acolhimento sincero do que foi sentido
2. Um pequeno insight ou perspectiva
3. Uma sugestão prática e gentil para hoje
4. (Opcional) Um versículo curto que conforte, com referência`;
    } else if (type === "daily_tips") {
      systemPrompt = `Você é um coach de bem-estar especializado em recuperação de dependências.
Forneça dicas práticas, motivacionais e baseadas em evidências.
Responda em português brasileiro de forma concisa e inspiradora.`;
      
      userPrompt = `Baseado no perfil do usuário:
- Dias limpos: ${data.daysClean || 0}
- Consumos recentes: ${data.recentConsumptions || 0}
- Fase atual: ${data.currentPhase || 1}
- Último registro: ${data.lastConsumption || "Nenhum"}

Gere 3 dicas personalizadas e uma mensagem motivacional para hoje.
Considere a fase da recuperação e adapte as dicas ao momento.
Formato: JSON com { tips: string[], motivation: string }`;
    } else {
      throw new Error("Invalid analysis type");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas solicitações. Aguarde um momento e tente novamente." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Limite de uso atingido. Entre em contato com o suporte." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao processar sua solicitação." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ response: content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
