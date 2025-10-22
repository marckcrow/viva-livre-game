import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Heart, QrCode } from "lucide-react";

const Donate = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-hero p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <Card className="shadow-glow">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-gradient-achievement p-4 rounded-full shadow-achievement">
                <Heart className="w-12 h-12 text-accent-foreground" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">Apoie o Viva+ Livre</CardTitle>
            <CardDescription className="text-base">
              Sua contribuição ajuda a manter esta plataforma gratuita e acessível para todos que buscam liberdade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-muted rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-3">
                <QrCode className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="font-semibold text-lg">PIX</h3>
                  <p className="text-sm text-muted-foreground">
                    Escaneie o QR Code ou copie a chave
                  </p>
                </div>
              </div>

              <div className="bg-background p-8 rounded-lg flex justify-center items-center">
                <div className="text-center space-y-4">
                  <div className="bg-primary/10 p-4 rounded-lg inline-block">
                    <QrCode className="w-32 h-32 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    QR Code PIX
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Chave PIX (Celular)</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value="85985035473"
                    readOnly
                    className="flex-1 px-4 py-2 bg-background border rounded-md text-center font-mono"
                  />
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText("85985035473");
                    }}
                    variant="outline"
                  >
                    Copiar
                  </Button>
                </div>
              </div>
            </div>

            <div className="text-center space-y-2 text-sm text-muted-foreground">
              <p>💚 Qualquer valor faz a diferença</p>
              <p>🙏 Muito obrigado pelo seu apoio!</p>
              <p>🌱 Juntos construímos um futuro mais livre</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Donate;
