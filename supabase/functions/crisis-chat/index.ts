import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `Você é um assistente de apoio emocional especializado em ajudar pessoas que estão enfrentando momentos difíceis na jornada de recuperação de vícios (álcool e tabaco).

DIRETRIZES IMPORTANTES:
- Seja empático, acolhedor e não-julgador
- Use linguagem simples e reconfortante
- Ofereça técnicas práticas de enfrentamento (respiração, distração, etc.)
- Celebre pequenas vitórias e reforce o progresso do usuário
- Em casos de crise severa, sugira buscar ajuda profissional (CVV 188, CAPS, etc.)
- Mantenha respostas concisas mas significativas
- Use emojis com moderação para tornar a conversa mais acolhedora

TÉCNICAS QUE VOCÊ PODE SUGERIR:
- Exercícios de respiração profunda (4-7-8)
- Técnica de aterramento (5 sentidos)
- Distração saudável (caminhada, música, ligar para alguém)
- Beber água ou comer algo saudável
- Lembrar dos motivos para parar
- Visualizar os benefícios já conquistados

Lembre-se: você está aqui para apoiar, não substituir tratamento profissional.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas solicitações. Por favor, aguarde um momento." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Limite de uso atingido. Tente novamente mais tarde." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "Erro no serviço de IA" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Crisis chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
