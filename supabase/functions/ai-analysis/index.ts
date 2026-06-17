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
    } else if (type === "triggers") {
      systemPrompt = `Você é um psicólogo especializado em prevenção de recaídas em dependências de álcool e tabaco.
Analise padrões emocionais do diário do usuário para identificar gatilhos de risco e propor alertas preventivos.
Seja empático, prático e direto. Português brasileiro.
RETORNE APENAS JSON VÁLIDO no formato:
{
  "riskLevel": "low" | "medium" | "high",
  "summary": "1-2 frases sobre o estado emocional atual",
  "triggers": [{ "name": "string curta", "evidence": "trecho ou padrão observado", "severity": "low|medium|high" }],
  "patterns": ["observação 1", "observação 2"],
  "alerts": [{ "title": "alerta preventivo", "action": "ação concreta sugerida" }],
  "affirmation": "frase curta de encorajamento"
}`;
      userPrompt = `Analise as últimas entradas do diário emocional (mais recentes primeiro):

${(data.entries || []).map((e: any, i: number) => `[${i + 1}] ${e.date} | humor: ${e.mood}\n${e.content}`).join("\n\n")}

Contexto adicional:
- Dias limpos atuais: ${data.daysClean ?? "n/d"}
- Recaídas recentes (30d): ${data.recentRelapses ?? 0}

Identifique até 4 gatilhos recorrentes, até 3 padrões emocionais e até 3 alertas preventivos com ação concreta.
Calibre o riskLevel: high se humor predominantemente "low/bad" + recaídas recentes; medium se sinais mistos; low se estável/positivo.`;
    } else if (type === "action_plan") {
      systemPrompt = `Você é um especialista em prevenção de recaídas em álcool e tabaco, treinado em terapia cognitivo-comportamental e técnicas de regulação emocional (grounding, respiração, urge surfing).
Sua missão: gerar um PLANO DE AÇÃO IMEDIATO, prático e executável AGORA, para alguém que acabou de receber um alerta de risco.
Tom: humano, calmo, direto. Português brasileiro. Sem julgamento. Foco em ação concreta nos próximos minutos e horas.
RETORNE APENAS JSON VÁLIDO no formato:
{
  "title": "título curto e acolhedor do plano",
  "intro": "1-2 frases que acalmam e contextualizam por que esse plano existe agora",
  "immediateSteps": [
    { "minutes": 1, "title": "ação curta", "description": "instrução clara e executável em poucos minutos", "icon": "breath|water|move|call|write|distract|ground" }
  ],
  "nextHours": [
    { "title": "estratégia para as próximas horas", "description": "instrução prática" }
  ],
  "avoid": ["situação ou pensamento a evitar agora"],
  "emergencyContacts": [
    { "name": "CVV - Centro de Valorização da Vida", "contact": "188", "when": "se a vontade ficar incontrolável ou houver pensamentos de se machucar" }
  ],
  "mantra": "frase curta para repetir mentalmente"
}`;
      userPrompt = `Contexto do alerta de risco recebido:

Nível de risco: ${data.riskLevel || "medium"}
Resumo emocional: ${data.summary || "n/d"}
Principais gatilhos identificados: ${(data.triggers || []).map((t: any) => `${t.name} (${t.severity})`).join(", ") || "n/d"}
Padrões observados: ${(data.patterns || []).join("; ") || "n/d"}
Alertas preventivos já apontados: ${(data.alerts || []).map((a: any) => a.title).join("; ") || "n/d"}
Dias limpos: ${data.daysClean ?? "n/d"}
Recaídas recentes (30d): ${data.recentRelapses ?? 0}

Gere de 4 a 6 passos imediatos (cada um executável em 1 a 10 minutos), 2 a 4 estratégias para as próximas horas, 2 a 3 itens a evitar agora, e 1 a 2 contatos de emergência apropriados ao Brasil (inclua CVV 188 quando o risco for high). Seja específico aos gatilhos informados, não genérico.`;
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
