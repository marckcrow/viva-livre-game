import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { BookHeart, Sparkles, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useJournal, moodEmoji, moodLabel, JournalEntry } from "@/hooks/useJournal";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const MOODS: JournalEntry["mood"][] = ["great", "good", "neutral", "low", "bad"];

const EmotionalJournal = () => {
  const { entries, addEntry, updateEntry, deleteEntry } = useJournal();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<JournalEntry["mood"]>("neutral");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (content.trim().length < 10) {
      toast({ title: "Escreva um pouco mais", description: "Pelo menos algumas palavras.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const entry = addEntry({ content: content.trim(), mood });
    try {
      const { data, error } = await supabase.functions.invoke("ai-analysis", {
        body: { type: "journal", data: { content: entry.content, mood: moodLabel(entry.mood) } },
      });
      if (error) throw error;
      updateEntry(entry.id, { aiResponse: data.response });
    } catch (e: any) {
      toast({ title: "IA indisponível", description: "Sua entrada foi salva. Tente analisar mais tarde.", variant: "destructive" });
    } finally {
      setLoading(false);
      setContent("");
      setMood("neutral");
      setOpen(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookHeart className="w-5 h-5 text-primary" /> Diário Emocional
        </CardTitle>
        <CardDescription>Escreva o que sente. A IA acolhe e responde com empatia.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Sparkles className="w-4 h-4 mr-2" /> Nova entrada
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Como você está se sentindo?</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-between gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMood(m)}
                    className={`flex-1 p-3 rounded-lg border text-2xl transition ${
                      mood === m ? "border-primary bg-primary/10" : "border-border hover:bg-muted"
                    }`}
                    title={moodLabel(m)}
                  >
                    {moodEmoji(m)}
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="Desabafe sem filtros... medos, gratidão, vitórias, dores."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                maxLength={2000}
              />
              <Button onClick={submit} disabled={loading} className="w-full">
                {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</> : "Salvar e receber acolhida"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Nenhuma entrada ainda. Comece quando quiser. 💙</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {entries.slice(0, 5).map((e) => (
              <div key={e.id} className="p-3 rounded-lg border bg-muted/30 space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{moodEmoji(e.mood)} {moodLabel(e.mood)} · {format(new Date(e.createdAt), "dd/MM HH:mm", { locale: ptBR })}</span>
                  <button onClick={() => deleteEntry(e.id)} className="hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm whitespace-pre-wrap">{e.content}</p>
                {e.aiResponse && (
                  <div className="text-sm bg-primary/5 border border-primary/20 rounded p-2 whitespace-pre-wrap">
                    <span className="text-xs font-semibold text-primary flex items-center gap-1 mb-1">
                      <Sparkles className="w-3 h-3" /> Acolhida
                    </span>
                    {e.aiResponse}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmotionalJournal;
