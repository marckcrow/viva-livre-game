import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2 } from "lucide-react";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(8, "Mínimo 8 caracteres").max(72),
});

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handle = async (mode: "in" | "up") => {
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast({ title: "Verifique os dados", description: parsed.error.errors[0].message, variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      if (mode === "up") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/community` },
        });
        if (error) throw error;
        toast({ title: "Conta criada", description: "Confirme seu email para ativar." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/community");
      }
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const google = async () => {
    setLoading(true);
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/community` });
    if (r.error) {
      toast({ title: "Erro Google", description: String(r.error), variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2"><Sparkles className="w-8 h-8 text-primary" /></div>
          <CardTitle>Entrar na Comunidade</CardTitle>
          <CardDescription>O app continua 100% anônimo. Login só é necessário para participar da comunidade.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="in">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="in">Entrar</TabsTrigger>
              <TabsTrigger value="up">Criar conta</TabsTrigger>
            </TabsList>
            {(["in", "up"] as const).map(mode => (
              <TabsContent key={mode} value={mode} className="space-y-3 mt-4">
                <div><Label>Email</Label><Input value={email} onChange={e => setEmail(e.target.value)} type="email" /></div>
                <div><Label>Senha</Label><Input value={password} onChange={e => setPassword(e.target.value)} type="password" /></div>
                <Button className="w-full" onClick={() => handle(mode)} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === "in" ? "Entrar" : "Criar conta"}
                </Button>
              </TabsContent>
            ))}
          </Tabs>
          <div className="my-4 flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-px bg-border flex-1" /> ou <div className="h-px bg-border flex-1" />
          </div>
          <Button variant="outline" className="w-full" onClick={google} disabled={loading}>
            Continuar com Google
          </Button>
          <Button variant="ghost" className="w-full mt-2" onClick={() => navigate("/dashboard")}>
            Voltar ao app anônimo
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
