import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Bell, BellOff, TestTube, Clock, Calendar } from "lucide-react";
import { useReminders } from "@/hooks/useReminders";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DAYS_OF_WEEK = [
  { value: 0, label: "Dom", fullLabel: "Domingo" },
  { value: 1, label: "Seg", fullLabel: "Segunda" },
  { value: 2, label: "Ter", fullLabel: "Terça" },
  { value: 3, label: "Qua", fullLabel: "Quarta" },
  { value: 4, label: "Qui", fullLabel: "Quinta" },
  { value: 5, label: "Sex", fullLabel: "Sexta" },
  { value: 6, label: "Sáb", fullLabel: "Sábado" },
];

const ReminderSettings = () => {
  const {
    settings,
    notificationPermission,
    updateSettings,
    enableReminders,
    disableReminders,
    testNotification,
  } = useReminders();

  const [isEnabling, setIsEnabling] = useState(false);

  const handleToggle = async (checked: boolean) => {
    if (checked) {
      setIsEnabling(true);
      const success = await enableReminders();
      setIsEnabling(false);
      
      if (success) {
        toast({
          title: "Lembretes ativados! 🔔",
          description: "Você receberá notificações nos horários configurados.",
        });
      } else {
        toast({
          title: "Permissão negada",
          description: "Permita notificações no navegador para receber lembretes.",
          variant: "destructive",
        });
      }
    } else {
      disableReminders();
      toast({
        title: "Lembretes desativados",
        description: "Você não receberá mais notificações.",
      });
    }
  };

  const handleDayToggle = (day: number) => {
    const newDays = settings.days.includes(day)
      ? settings.days.filter((d) => d !== day)
      : [...settings.days, day].sort((a, b) => a - b);
    
    updateSettings({ days: newDays });
  };

  const handleTimeChange = (time: string) => {
    updateSettings({ time });
  };

  const handleTypeChange = (type: "motivation" | "checkin" | "both") => {
    updateSettings({ type });
  };

  const handleTestNotification = () => {
    if (notificationPermission !== "granted") {
      toast({
        title: "Permissão necessária",
        description: "Ative os lembretes primeiro para testar.",
        variant: "destructive",
      });
      return;
    }
    
    testNotification();
    toast({
      title: "Notificação enviada!",
      description: "Verifique suas notificações.",
    });
  };

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {settings.enabled ? (
            <Bell className="w-5 h-5 text-primary" />
          ) : (
            <BellOff className="w-5 h-5 text-muted-foreground" />
          )}
          Lembretes Diários
        </CardTitle>
        <CardDescription>
          Configure notificações para motivação e check-in
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="reminder-toggle" className="text-base font-medium">
              Ativar lembretes
            </Label>
            <p className="text-sm text-muted-foreground">
              Receba notificações motivacionais
            </p>
          </div>
          <Switch
            id="reminder-toggle"
            checked={settings.enabled}
            onCheckedChange={handleToggle}
            disabled={isEnabling}
          />
        </div>

        {settings.enabled && (
          <>
            {/* Time Picker */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Horário do lembrete
              </Label>
              <Input
                type="time"
                value={settings.time}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-full md:w-40"
              />
            </div>

            {/* Days of Week */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Dias da semana
              </Label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <Button
                    key={day.value}
                    variant={settings.days.includes(day.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDayToggle(day.value)}
                    className="min-w-[3rem]"
                    title={day.fullLabel}
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Notification Type */}
            <div className="space-y-2">
              <Label>Tipo de lembrete</Label>
              <Select value={settings.type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="motivation">🌟 Apenas motivação</SelectItem>
                  <SelectItem value="checkin">📋 Apenas check-in</SelectItem>
                  <SelectItem value="both">✨ Motivação + Check-in</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Test Button */}
            <Button
              variant="outline"
              onClick={handleTestNotification}
              className="w-full"
            >
              <TestTube className="w-4 h-4 mr-2" />
              Testar notificação
            </Button>

            {/* Info */}
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <p>
                💡 <strong>Dica:</strong> Mantenha o app aberto ou instalado como PWA para receber notificações no horário programado.
              </p>
            </div>
          </>
        )}

        {notificationPermission === "denied" && (
          <div className="bg-destructive/10 text-destructive rounded-lg p-4 text-sm">
            <p>
              ⚠️ As notificações estão bloqueadas no navegador. Vá às configurações do navegador para permitir notificações deste site.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ReminderSettings;
