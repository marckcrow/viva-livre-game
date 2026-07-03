// Conteúdo estoico curado — citações, missões diárias e reflexões.
// Fontes: Marco Aurélio (Meditações), Sêneca (Cartas a Lucílio), Epicteto (Enchiridion).

export interface StoicQuote {
  text: string;
  author: "Marco Aurélio" | "Sêneca" | "Epicteto";
  source?: string;
}

export const STOIC_QUOTES: StoicQuote[] = [
  { text: "Você tem poder sobre sua mente — não sobre eventos externos. Perceba isto, e encontrará força.", author: "Marco Aurélio", source: "Meditações" },
  { text: "Não são as coisas que perturbam os homens, mas os julgamentos que fazem delas.", author: "Epicteto", source: "Enchiridion" },
  { text: "Toda dificuldade na vida nos apresenta uma oportunidade de nos voltarmos para dentro.", author: "Epicteto" },
  { text: "Enquanto esperamos viver, a vida passa.", author: "Sêneca", source: "Cartas a Lucílio" },
  { text: "Como é ridículo não fugir de nossa própria maldade, o que é possível, e tentar fugir da dos outros, o que é impossível.", author: "Marco Aurélio", source: "Meditações" },
  { text: "Não é o homem que tem pouco, mas o que deseja mais, que é pobre.", author: "Sêneca" },
  { text: "Comece o dia dizendo a si mesmo: hoje encontrarei o ingrato, o violento, o traiçoeiro, o invejoso. Mas nada disso pode me ferir, pois ninguém pode me impor o feio.", author: "Marco Aurélio" },
  { text: "A dificuldade mostra o que os homens são. Quando surge um desafio, lembre-se de que Deus, como um treinador, lhe deu um parceiro rude.", author: "Epicteto" },
  { text: "Em qualquer lugar que possas viver, ali podes viver bem.", author: "Marco Aurélio" },
  { text: "Não deixes que o poder do pensamento seja escravo dos movimentos do corpo.", author: "Marco Aurélio" },
  { text: "Nós sofremos mais na imaginação do que na realidade.", author: "Sêneca" },
  { text: "É preciso muita vida para aprender a viver.", author: "Sêneca" },
  { text: "Não deseje que as coisas aconteçam como você quer. Deseje que aconteçam como acontecem, e você viverá em paz.", author: "Epicteto" },
  { text: "A felicidade da tua vida depende da qualidade dos teus pensamentos.", author: "Marco Aurélio" },
  { text: "Onde não há esforço, não há virtude.", author: "Sêneca" },
];

export interface StoicMission {
  title: string;
  body: string;
  practice: string;
}

export const STOIC_MISSIONS: StoicMission[] = [
  {
    title: "Antes de agir por impulso, respire",
    body: "Hoje, antes de ceder a uma vontade, faça três respirações longas e diga em silêncio: eu não sou escravo dessa vontade.",
    practice: "Ao sentir o impulso, pause por 60 segundos antes de qualquer ação.",
  },
  {
    title: "Distinguir o que controlo",
    body: "Existem coisas em nosso poder e coisas que não estão. Hoje, ao me irritar com algo, pergunto: isso está em meu poder?",
    practice: "Escreva 1 situação do dia e classifique: controlável ou não.",
  },
  {
    title: "Praemeditatio malorum",
    body: "Sêneca ensinava a visualizar antecipadamente as dificuldades. Hoje, imagine o pior que pode acontecer — e perceba: você sobrevive.",
    practice: "Antecipe mentalmente uma dificuldade possível de hoje e planeje sua resposta.",
  },
  {
    title: "Memento mori",
    body: "Lembra-te de que és mortal. Não como peso, mas como despertar: hoje é um presente. Como quer vivê-lo?",
    practice: "Aja hoje como se este fosse seu último dia — com atenção, não com pressa.",
  },
  {
    title: "A vista de cima",
    body: "Marco Aurélio imaginava-se olhando o mundo do alto. Seus problemas eram pequenos vistos de longe. Faça o mesmo.",
    practice: "Pare por 2 minutos e observe seu problema atual como se olhasse de outro planeta.",
  },
  {
    title: "Voluntária desconforto",
    body: "Escolha, hoje, uma pequena renúncia consciente. Uma refeição mais simples. Um prazer adiado. O músculo da vontade cresce assim.",
    practice: "Escolha uma pequena renúncia hoje e cumpra-a com serenidade.",
  },
  {
    title: "Não é a coisa, é meu julgamento",
    body: "Não é o que acontece que te fere — é como você interpreta. Hoje, ao reagir, questione seu próprio pensamento antes.",
    practice: "Anote 1 reação forte do dia e reescreva o pensamento de forma mais justa.",
  },
  {
    title: "Amor fati",
    body: "Amar o próprio destino. Não apenas suportar o que veio, mas dizer sim ao que já é. Hoje, aceite antes de julgar.",
    practice: "Diga 'sim' internamente ao primeiro imprevisto do dia, antes de reagir.",
  },
  {
    title: "Sirva sem esperar retorno",
    body: "O sábio faz o bem porque é o bem — não pela recompensa. Hoje, ajude alguém sem contar a ninguém.",
    practice: "Pratique um ato de bondade discreta hoje.",
  },
  {
    title: "Silêncio como disciplina",
    body: "Epicteto dizia: em uma reunião, fale pouco. Ouvir é começar a governar-se. Hoje, ouça mais do que fala.",
    practice: "Em uma conversa hoje, escute sem interromper por 5 minutos completos.",
  },
];

// Deterministic daily pick using date as seed.
export function getDailyIndex(arrayLength: number, offset = 0): number {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return (dayOfYear + offset) % arrayLength;
}

export function getDailyQuote(): StoicQuote {
  return STOIC_QUOTES[getDailyIndex(STOIC_QUOTES.length)];
}

export function getDailyMission(): StoicMission {
  return STOIC_MISSIONS[getDailyIndex(STOIC_MISSIONS.length, 3)];
}
