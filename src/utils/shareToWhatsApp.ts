export const shareToWhatsApp = (text: string, title?: string) => {
  const fullText = title ? `*${title}*\n\n${text}` : text;
  const encodedText = encodeURIComponent(fullText);
  const whatsappUrl = `https://wa.me/?text=${encodedText}`;
  window.open(whatsappUrl, "_blank");
};

export const formatAiResponseForShare = (response: string, context?: string) => {
  let shareText = "🌟 *Viva Livre - Orientações da IA*\n\n";
  
  if (context) {
    shareText += `📌 ${context}\n\n`;
  }
  
  shareText += response;
  shareText += "\n\n---\n💚 Baixe o app Viva Livre e comece sua jornada!";
  
  return shareText;
};
