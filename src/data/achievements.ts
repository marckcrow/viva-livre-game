// Extended achievements system with daily, weekly, monthly, and goal-based badges

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  daysRequired: number;
  category: "daily" | "weekly" | "monthly" | "milestone" | "goal";
}

export const achievements: Achievement[] = [
  // Daily achievements
  { id: "first_day", name: "Primeiro Passo", description: "Completou seu primeiro dia", icon: "🌱", daysRequired: 1, category: "daily" },
  { id: "two_days", name: "Segundo Dia", description: "Dois dias de conquista", icon: "🌿", daysRequired: 2, category: "daily" },
  { id: "three_days", name: "Trio Vencedor", description: "Três dias consecutivos", icon: "🍀", daysRequired: 3, category: "daily" },
  { id: "five_days", name: "Mão Cheia", description: "Cinco dias de força", icon: "✋", daysRequired: 5, category: "daily" },

  // Weekly achievements
  { id: "one_week", name: "Uma Semana Forte", description: "7 dias de determinação", icon: "🌟", daysRequired: 7, category: "weekly" },
  { id: "two_weeks", name: "Duas Semanas", description: "14 dias de progresso", icon: "💫", daysRequired: 14, category: "weekly" },
  { id: "three_weeks", name: "Três Semanas", description: "21 dias formando hábito", icon: "⭐", daysRequired: 21, category: "weekly" },

  // Monthly achievements
  { id: "one_month", name: "Mês de Conquista", description: "30 dias de vitória", icon: "🏅", daysRequired: 30, category: "monthly" },
  { id: "45_days", name: "Força Inabalável", description: "45 dias de resiliência", icon: "💪", daysRequired: 45, category: "monthly" },
  { id: "two_months", name: "Transformação Real", description: "60 dias de mudança", icon: "🎖️", daysRequired: 60, category: "monthly" },
  { id: "three_months", name: "Trimestre de Ouro", description: "90 dias de conquista", icon: "🥇", daysRequired: 90, category: "monthly" },

  // Milestone achievements
  { id: "100_days", name: "Centenário", description: "100 dias de liberdade", icon: "💯", daysRequired: 100, category: "milestone" },
  { id: "150_days", name: "Guerreiro", description: "150 dias de batalha vencida", icon: "⚔️", daysRequired: 150, category: "milestone" },
  { id: "six_months", name: "Semestre Vitorioso", description: "180 dias de superação", icon: "🏆", daysRequired: 180, category: "milestone" },
  { id: "nine_months", name: "Renascimento", description: "270 dias de nova vida", icon: "🦋", daysRequired: 270, category: "milestone" },
  
  // Goal achievements
  { id: "one_year", name: "Um Ano Livre", description: "365 dias de liberdade total", icon: "👑", daysRequired: 365, category: "goal" },
  { id: "500_days", name: "Lenda Viva", description: "500 dias de inspiração", icon: "🌈", daysRequired: 500, category: "goal" },
  { id: "two_years", name: "Veterano", description: "730 dias de vitória", icon: "🎯", daysRequired: 730, category: "goal" },
  { id: "1000_days", name: "Mestre da Vida", description: "1000 dias de conquista", icon: "🔱", daysRequired: 1000, category: "goal" },
  { id: "three_years", name: "Liberdade Eterna", description: "3 anos de vida plena", icon: "🌅", daysRequired: 1095, category: "goal" },
  { id: "five_years", name: "Lenda Imortal", description: "5 anos de vitória absoluta", icon: "🏛️", daysRequired: 1825, category: "goal" },
];

export const categoryLabels: Record<string, { label: string; emoji: string }> = {
  daily: { label: "Diárias", emoji: "📅" },
  weekly: { label: "Semanais", emoji: "📆" },
  monthly: { label: "Mensais", emoji: "🗓️" },
  milestone: { label: "Marcos", emoji: "🎯" },
  goal: { label: "Metas", emoji: "🏆" },
};
