import { useState, useEffect, useCallback } from "react";
import { showNotification, requestNotificationPermission } from "@/utils/pushNotifications";

const LOCAL_REMINDERS_KEY = "vivaLivre_reminders";

export interface ReminderSettings {
  enabled: boolean;
  time: string; // HH:MM format
  days: number[]; // 0=Sunday, 1=Monday, etc.
  type: "motivation" | "checkin" | "both";
  lastNotificationDate: string | null;
}

const DEFAULT_SETTINGS: ReminderSettings = {
  enabled: false,
  time: "09:00",
  days: [1, 2, 3, 4, 5], // Monday to Friday by default
  type: "both",
  lastNotificationDate: null,
};

const MOTIVATION_MESSAGES = [
  "🌟 Você está no caminho certo! Continue firme!",
  "💪 Cada dia sem uso é uma vitória. Parabéns!",
  "🌱 Sua saúde agradece cada escolha saudável que você faz.",
  "🎯 Mantenha o foco! Você é mais forte do que imagina.",
  "🌈 Um novo dia, uma nova oportunidade de vitória!",
  "⭐ Você está construindo uma vida melhor, dia após dia.",
  "🏆 Seu esforço vale muito! Continue assim!",
  "💚 Cuide de você. Você merece uma vida livre!",
  "🚀 Cada passo conta. Continue avançando!",
  "🌻 Hoje é mais um dia de conquistas. Acredite em você!",
];

export function useReminders() {
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_SETTINGS);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    loadSettings();
    checkNotificationPermission();
  }, []);

  useEffect(() => {
    if (settings.enabled && notificationPermission === "granted") {
      scheduleNextReminder();
    }
  }, [settings, notificationPermission]);

  const loadSettings = () => {
    const stored = localStorage.getItem(LOCAL_REMINDERS_KEY);
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  };

  const checkNotificationPermission = async () => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  };

  const saveSettings = (newSettings: ReminderSettings) => {
    localStorage.setItem(LOCAL_REMINDERS_KEY, JSON.stringify(newSettings));
    setSettings(newSettings);
  };

  const updateSettings = (updates: Partial<ReminderSettings>) => {
    const newSettings = { ...settings, ...updates };
    saveSettings(newSettings);
  };

  const enableReminders = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setNotificationPermission("granted");
      updateSettings({ enabled: true });
      return true;
    }
    return false;
  };

  const disableReminders = () => {
    updateSettings({ enabled: false });
  };

  const getRandomMotivationMessage = () => {
    const index = Math.floor(Math.random() * MOTIVATION_MESSAGES.length);
    return MOTIVATION_MESSAGES[index];
  };

  const scheduleNextReminder = useCallback(() => {
    if (!settings.enabled) return;

    const now = new Date();
    const today = now.getDay();
    const [hours, minutes] = settings.time.split(":").map(Number);

    // Check if we should show notification now
    const todayStr = now.toISOString().split("T")[0];
    
    if (
      settings.days.includes(today) &&
      settings.lastNotificationDate !== todayStr
    ) {
      const scheduledTime = new Date();
      scheduledTime.setHours(hours, minutes, 0, 0);

      const timeDiff = scheduledTime.getTime() - now.getTime();

      if (timeDiff > 0 && timeDiff < 60000) {
        // Within the next minute
        setTimeout(() => {
          triggerReminder();
        }, timeDiff);
      } else if (timeDiff <= 0 && timeDiff > -60000) {
        // Just passed the scheduled time (within last minute)
        triggerReminder();
      }
    }

    // Set interval to check every minute
    const checkInterval = setInterval(() => {
      const currentNow = new Date();
      const currentDay = currentNow.getDay();
      const currentTodayStr = currentNow.toISOString().split("T")[0];
      const currentHour = currentNow.getHours();
      const currentMinute = currentNow.getMinutes();

      if (
        settings.enabled &&
        settings.days.includes(currentDay) &&
        currentHour === hours &&
        currentMinute === minutes &&
        settings.lastNotificationDate !== currentTodayStr
      ) {
        triggerReminder();
      }
    }, 60000);

    return () => clearInterval(checkInterval);
  }, [settings]);

  const triggerReminder = () => {
    const todayStr = new Date().toISOString().split("T")[0];
    
    if (settings.type === "motivation" || settings.type === "both") {
      showNotification("Viva+ Livre - Motivação Diária", {
        body: getRandomMotivationMessage(),
        tag: "daily-motivation",
      });
    }

    if (settings.type === "checkin" || settings.type === "both") {
      setTimeout(() => {
        showNotification("Viva+ Livre - Check-in", {
          body: "📋 Como foi seu dia? Registre seu progresso no app!",
          tag: "daily-checkin",
        });
      }, settings.type === "both" ? 5000 : 0);
    }

    // Update last notification date
    const updatedSettings = { ...settings, lastNotificationDate: todayStr };
    saveSettings(updatedSettings);
  };

  const testNotification = () => {
    if (notificationPermission === "granted") {
      showNotification("Viva+ Livre - Teste", {
        body: getRandomMotivationMessage(),
        tag: "test-notification",
      });
    }
  };

  return {
    settings,
    notificationPermission,
    updateSettings,
    enableReminders,
    disableReminders,
    testNotification,
  };
}
