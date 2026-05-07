import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Heart, Send, Trash2, Users, ArrowLeft, LogOut, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Post {
  id: string;
  alias: string;
  category: string;
  content: string;
  created_at: string;
  user_id: string;
  reactions?: { count: number; mine: boolean };
}

const CATEGORIES = [
  { value: "victory", label: "Vitória 🏆" },
  { value: "support", label: "Apoio 🤝" },
  { value: "prayer", label: "Oração 🙏" },
  { value: "vent", label: "Desabafo 💭" },
];

const Community = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [alias, setAlias] = useState(localStorage.getItem("vivaLivre_alias") || "Anônimo");
  const [category, setCategory] = useState("victory");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) loadPosts();
  }, [user]);

  const loadPosts = async () => {
    const { data: p } = await supabase
      .from("community_posts")
      .select("*")
      .eq("is_hidden", false)
      .order("created_at", { ascending: false })
      .limit(50);
    if (!p) return;
    const ids = p.map(x => x.id);
    const { data: rx } = await supabase.from("community_reactions").select("post_id, user_id").in("post_id", ids);
    const counts = new Map<string, { count: number; mine: boolean }>();
    rx?.forEach(r => {
      const v = counts.get(r.post_id) || { count: 0, mine: false };
      v.count++;
      if (r.user_id === user!.id) v.mine = true;
      counts.set(r.post_id, v);
    });
    setPosts(p.map(x => ({ ...x, reactions: counts.get(x.id) || { count: 0, mine: false } })));
  };

  const submit = async () => {
    if (content.trim().length < 5) {
      toast({ title: "Escreva um pouco mais", variant: "destructive" });
      return;
    }
    setPosting(true);
    try {
      const { data: mod } = await supabase.functions.invoke("community-moderate", { body: { content: content.trim() } });
      if (mod && !mod.ok) {
        toast({ title: "Post não publicado", description: mod.reason || "Conteúdo fora das diretrizes.", variant: "destructive" });
        return;
      }
      localStorage.setItem("vivaLivre_alias", alias.trim() || "Anônimo");
      const { error } = await supabase.from("community_posts").insert({
        user_id: user!.id,
        alias: alias.trim() || "Anônimo",
        category,
        content: content.trim(),
      });
      if (error) throw error;
      setContent("");
      toast({ title: "Publicado 💙" });
      loadPosts();
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  const toggleReact = async (post: Post) => {
    if (post.reactions?.mine) {
      await supabase.from("community_reactions").delete().eq("post_id", post.id).eq("user_id", user!.id).eq("emoji", "❤️");
    } else {
      await supabase.from("community_reactions").insert({ post_id: post.id, user_id: user!.id, emoji: "❤️" });
    }
    loadPosts();
  };

  const remove = async (id: string) => {
    await supabase.from("community_posts").delete().eq("id", id);
    loadPosts();
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Dashboard
          </Button>
          <h1 className="font-bold flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Comunidade</h1>
          <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate("/"); }}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compartilhe sua jornada</CardTitle>
            <CardDescription>Anônimo, moderado por IA. Sem julgamento, sem ódio.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Apelido</Label>
                <Input value={alias} onChange={e => setAlias(e.target.value)} maxLength={20} />
              </div>
              <div>
                <Label>Categoria</Label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-10 rounded-md border bg-background px-3 text-sm">
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
            </div>
            <Textarea rows={4} maxLength={500} value={content} onChange={e => setContent(e.target.value)}
              placeholder="O que você quer compartilhar hoje?" />
            <Button onClick={submit} disabled={posting} className="w-full">
              {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Publicar</>}
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <AnimatePresence>
            {posts.map(p => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Card>
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span><strong className="text-foreground">{p.alias}</strong> · {CATEGORIES.find(c => c.value === p.category)?.label || p.category}</span>
                      <span>{format(new Date(p.created_at), "dd/MM HH:mm", { locale: ptBR })}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{p.content}</p>
                    <div className="flex items-center justify-between pt-1">
                      <button onClick={() => toggleReact(p)} className={`flex items-center gap-1 text-sm ${p.reactions?.mine ? "text-destructive" : "text-muted-foreground"} hover:text-destructive transition`}>
                        <Heart className={`w-4 h-4 ${p.reactions?.mine ? "fill-current" : ""}`} />
                        {p.reactions?.count || 0}
                      </button>
                      {p.user_id === user?.id && (
                        <button onClick={() => remove(p.id)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          {posts.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">Seja o primeiro a compartilhar 💙</p>}
        </div>
      </main>
    </div>
  );
};

export default Community;
