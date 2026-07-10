import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import DisclaimerFooter from "@/components/jornada/DisclaimerFooter";

const JornadaEmBreve = ({ title, description }: { title: string; description: string }) => (
  <>
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display">
          <Sparkles className="w-5 h-5 text-accent" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>{description}</p>
        <p>
          Esta seção será liberada na próxima etapa da Jornada. Enquanto isso, você já
          pode praticar em <strong>Meu dia</strong>: check-in emocional, círculo de
          controle, prioridades, virtude do dia e missão prática.
        </p>
      </CardContent>
    </Card>
    <DisclaimerFooter />
  </>
);

export default JornadaEmBreve;
