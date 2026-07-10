import { Info } from "lucide-react";

const DisclaimerFooter = () => (
  <footer className="mt-10 border-t pt-4 pb-8 text-xs text-muted-foreground flex items-start gap-2 max-w-3xl">
    <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
    <p>
      Este conteúdo é educativo e inspirado em princípios estoicos clássicos. Não
      substitui acompanhamento profissional de saúde física ou mental. Em caso de
      sofrimento intenso, procure ajuda especializada.
    </p>
  </footer>
);

export default DisclaimerFooter;
