import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Section,
} from 'https://esm.sh/@react-email/components@0.0.22'
import * as React from 'https://esm.sh/react@18.3.1'

interface EncouragementEmailProps {
  userName: string
  daysClean: number
  achievementName?: string
}

const getMilestoneMessage = (days: number) => {
  if (days === 1) return "Você deu o primeiro passo! 🌱"
  if (days === 7) return "Uma semana inteira de vitória! 💪"
  if (days === 15) return "15 dias de força e determinação! ⭐"
  if (days === 30) return "Um mês de conquista! 🏆"
  if (days === 60) return "60 dias de transformação real! 🎯"
  if (days === 100) return "100 dias de liberdade total! 👑"
  
  // Mensagens para marcos de 7 dias
  if (days % 7 === 0) return `${days} dias de progresso contínuo! 🎉`
  
  return `Mais um dia de vitória! Você está há ${days} dias limpo! ✨`
}

const getEncouragementText = (days: number) => {
  if (days === 1) {
    return "O primeiro passo é sempre o mais importante. Você tomou a decisão de mudar e isso mostra sua força interior."
  }
  if (days === 7) {
    return "Uma semana completa! Seu corpo já está começando a agradecer. Continue firme nessa jornada."
  }
  if (days === 15) {
    return "Quinze dias de superação! Você está provando a si mesmo que é capaz de muito mais do que imaginava."
  }
  if (days === 30) {
    return "Um mês inteiro! Parabéns por essa conquista incrível. Você está construindo uma nova versão de si mesmo."
  }
  if (days === 60) {
    return "Dois meses de transformação! Os benefícios para sua saúde e bem-estar são enormes. Continue assim!"
  }
  if (days === 100) {
    return "Cem dias! Você é uma inspiração. Sua jornada de liberdade está sólida e seu exemplo pode ajudar outros."
  }
  
  return "Cada dia importa. Você está construindo uma vida mais saudável e livre, um dia de cada vez."
}

export const EncouragementEmail = ({
  userName,
  daysClean,
  achievementName,
}: EncouragementEmailProps) => (
  <Html>
    <Head />
    <Preview>{getMilestoneMessage(daysClean)}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🎉 {getMilestoneMessage(daysClean)}</Heading>
        
        <Text style={greeting}>
          Olá, {userName}!
        </Text>
        
        <Section style={statsSection}>
          <Text style={statsText}>
            <strong style={statsNumber}>{daysClean}</strong>
            <br />
            {daysClean === 1 ? 'dia limpo' : 'dias limpos'}
          </Text>
        </Section>
        
        <Text style={text}>
          {getEncouragementText(daysClean)}
        </Text>
        
        {achievementName && (
          <Section style={achievementSection}>
            <Text style={achievementText}>
              🏆 Nova conquista desbloqueada: <strong>{achievementName}</strong>
            </Text>
          </Section>
        )}
        
        <Text style={text}>
          Continue acessando seu painel para acompanhar seu progresso e registrar seu dia a dia.
        </Text>
        
        <Text style={footer}>
          Você está no controle da sua jornada. Continue assim! 💪
          <br />
          <br />
          Viva+ Livre
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EncouragementEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  maxWidth: '580px',
}

const h1 = {
  color: '#333',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0 40px',
  lineHeight: '1.3',
}

const greeting = {
  color: '#333',
  fontSize: '18px',
  lineHeight: '26px',
  padding: '0 40px',
  marginBottom: '20px',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  padding: '0 40px',
  marginBottom: '20px',
}

const statsSection = {
  backgroundColor: '#f0f9ff',
  borderRadius: '8px',
  padding: '30px',
  margin: '30px 40px',
  textAlign: 'center' as const,
}

const statsText = {
  margin: 0,
  fontSize: '16px',
  color: '#666',
}

const statsNumber = {
  fontSize: '48px',
  fontWeight: 'bold',
  color: '#0ea5e9',
  display: 'block',
  marginBottom: '8px',
}

const achievementSection = {
  backgroundColor: '#fef3c7',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 40px',
}

const achievementText = {
  margin: 0,
  fontSize: '16px',
  color: '#92400e',
  textAlign: 'center' as const,
}

const footer = {
  color: '#8898aa',
  fontSize: '14px',
  lineHeight: '24px',
  padding: '0 40px',
  marginTop: '32px',
}
