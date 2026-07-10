// Banco de missões diárias — textos originais e curtos.
export interface StoicMission {
  id: string;
  text: string;
  hint?: string;
}

export const STOIC_MISSIONS: StoicMission[] = [
  { id: "sem-celular", text: "Passe dez minutos sem tocar no celular.", hint: "Escolha um momento e deixe o aparelho fora de alcance." },
  { id: "ouvir-sem-interromper", text: "Ouça alguém até o fim, sem interromper.", hint: "Repare no impulso de responder antes da hora." },
  { id: "tarefa-adiada", text: "Cumpra uma pequena tarefa que estava adiando.", hint: "Algo simples que caiba em quinze minutos." },
  { id: "aceitar-desconforto", text: "Aceite um desconforto leve sem reclamar.", hint: "Calor, fome breve, uma fila. Só observe." },
  { id: "organizar-prioridade", text: "Organize a próxima prioridade do seu dia.", hint: "Escreva e diga em voz baixa qual é." },
  { id: "agradecer-alguem", text: "Agradeça alguém de forma específica.", hint: "Diga exatamente o que a pessoa fez que ajudou você." },
  { id: "caminhar-dez", text: "Caminhe por dez minutos com atenção ao corpo.", hint: "Sem fones. Só respirar e observar." },
  { id: "responder-com-calma", text: "Responda com calma a uma contrariedade.", hint: "Uma pausa curta antes já muda a resposta." },
  { id: "evitar-reclamacao", text: "Evite uma reclamação desnecessária hoje.", hint: "Observe quando ela vem e escolha o silêncio." },
  { id: "terminar-antes", text: "Termine uma tarefa antes de começar outra.", hint: "Uma coisa por vez, do início ao fim." },
  { id: "revisar-noite", text: "Reserve cinco minutos à noite para revisar o dia.", hint: "O que fiz bem? O que posso melhorar?" },
  { id: "gesto-generosidade", text: "Faça um pequeno gesto de generosidade.", hint: "Sem esperar nada em troca, nem reconhecimento." },
  { id: "pausar-antes", text: "Pause três respirações antes da próxima resposta importante.", hint: "Inspire, segure, solte. Só depois fale." },
  { id: "escrever-tres", text: "Escreva três coisas que você controla hoje.", hint: "Escolhas, esforço, palavras." },
  { id: "desacelerar-refeicao", text: "Faça uma refeição sem pressa, sem telas.", hint: "Sinta o sabor, mastigue devagar." },
];

// Seleção determinística por data (mesmo dia = mesma missão para o mesmo usuário)
export function getMissionOfDay(date = new Date(), seed = ""): StoicMission {
  const key = `${date.toISOString().slice(0, 10)}-${seed}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  const idx = Math.abs(hash) % STOIC_MISSIONS.length;
  return STOIC_MISSIONS[idx];
}

export const DAILY_REFLECTIONS = [
  "O que depende de você hoje?",
  "Uma pequena ação constante vale mais que um grande gesto isolado.",
  "Concentre-se no próximo passo. Só ele.",
  "Nem toda situação exige uma resposta imediata.",
  "O que você não pode mudar, pode atravessar com serenidade.",
  "Distinguir fatos de interpretações já é meio caminho.",
  "Cumprir o essencial já torna o dia significativo.",
];

export function getReflectionOfDay(date = new Date()): string {
  const day = Math.floor(date.getTime() / 86400000);
  return DAILY_REFLECTIONS[day % DAILY_REFLECTIONS.length];
}
