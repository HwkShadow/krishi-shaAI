'use client';
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLocalization } from "@/context/localization-context";
import { Bell, CloudRain, Bug, Sun, Wind, Loader2 } from "lucide-react";
import { getWeatherAlerts, WeatherAlert } from "@/ai/flows/weather-alert-flow";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { TranslatedContent } from "@/context/community-context";

const iconMap: { [key: string]: React.ElementType } = {
  'weather': CloudRain,
  'pest': Bug,
  'heat': Sun,
  'wind': Wind,
  'other': Bell,
};

export default function AlertsPage() {
  const { translate, language } = useLocalization();
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAlerts() {
      if (!user?.location) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const result = await getWeatherAlerts({ location: user.location });
        setAlerts(result.alerts);
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
        setAlerts([]); // Clear alerts on error
      } finally {
        setIsLoading(false);
      }
    }

    fetchAlerts();
  }, [user?.location]);

  const getTranslatedAlertContent = (content: TranslatedContent) => {
    return content[language] || content.en;
  }


  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-headline flex items-center gap-3"><Bell className="text-primary"/> {translate('proactiveAlerts', 'Proactive Alerts')}</h1>
        <p className="text-muted-foreground">{translate('alertsSubtitle', 'Timely warnings to help you stay one step ahead.')}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : alerts.length > 0 ? (
        <div className="space-y-4">
          {alerts.map((alert, index) => {
             const Icon = iconMap[alert.type] || iconMap.other;
             return (
                <Alert key={index} variant={alert.severity === 'high' ? 'destructive' : undefined}>
                    <Icon className="h-4 w-4" />
                    <div className="flex justify-between items-start w-full">
                        <div>
                            <AlertTitle>{getTranslatedAlertContent(alert.title)}</AlertTitle>
                            <AlertDescription>{getTranslatedAlertContent(alert.description)}</AlertDescription>
                        </div>
                    </div>
                </Alert>
             )
          })}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center h-64 text-center">
            <CardContent className="pt-6">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No Alerts Right Now</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    We couldn't find any critical alerts for your location. Check back later.
                </p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
