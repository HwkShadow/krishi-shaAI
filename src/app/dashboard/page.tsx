'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, Bot, Mic, ArrowRight, Sun, Wind, Droplets, Cloud, Bell, ClipboardList, MessageSquare, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useLocalization } from "@/context/localization-context";
import { useEffect, useState } from "react";
import { getWeather, GetWeatherOutput } from "@/ai/flows/get-weather-flow";

export default function DashboardPage() {
  const { user } = useAuth();
  const { translate } = useLocalization();
  const [weather, setWeather] = useState<GetWeatherOutput | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      setGreeting(translate('goodMorning', 'Good Morning'));
    } else if (currentHour < 18) {
      setGreeting(translate('goodAfternoon', 'Good Afternoon'));
    } else {
      setGreeting(translate('goodEvening', 'Good Evening'));
    }
  }, [translate]);
  
  const features = [
    {
      title: translate('aiAssistant', "AI Assistant"),
      description: translate('askAnyQuestion', "Ask any question"),
      icon: Bot,
      href: "/dashboard/query",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: translate('plantDoctor', "Plant Doctor"),
      description: translate('diagnoseWithPhoto', "Diagnose with a photo"),
      icon: Stethoscope,
      href: "/dashboard/diagnose",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: translate('voiceQuery', "Voice Query"),
      description: translate('askWithYourVoice', "Ask with your voice"),
      icon: Mic,
      href: "/dashboard/query",
      color: "bg-purple-500 hover:bg-purple-600",
    },
  ];

  const quickOverview = [
      { id: 1, title: "AI Queries", value: "0", icon: MessageSquare },
      { id: 2, title: "Farm Activities", value: "1", icon: ClipboardList },
      { id: 3, title: "New Alerts", value: "3", icon: Bell },
  ]
  
  useEffect(() => {
    async function fetchWeather() {
      if (user?.location) {
        setWeatherLoading(true);
        try {
          const weatherData = await getWeather({ location: user.location });
          setWeather(weatherData);
        } catch (error) {
          console.error("Failed to fetch weather:", error);
          setWeather({ temperature: 28, condition: "Partly Cloudy", wind: 12, humidity: 65 });
        } finally {
          setWeatherLoading(false);
        }
      } else {
        setWeather({ temperature: 28, condition: "Partly Cloudy", wind: 12, humidity: 65 });
        setWeatherLoading(false);
      }
    }
    fetchWeather();
  }, [user?.location]);


  return (
    <div className="space-y-8">
        <section>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">{greeting}, {user?.name || 'Hello'}! 🌱</h1>
            <p className="text-muted-foreground">
                {translate('welcomeSubtitle', "Your digital farming companion is ready. How can I help today?")}
            </p>
        </section>
        
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             {features.map((feature) => (
                <Card key={feature.title} className={`text-white flex items-center justify-between p-6 ${feature.color} transition-transform hover:scale-105`}>
                    <div className="flex items-center gap-4">
                        <feature.icon className="h-8 w-8" />
                        <div>
                            <CardTitle className="text-lg font-bold">{feature.title}</CardTitle>
                            <CardDescription className="text-white/80">{feature.description}</CardDescription>
                        </div>
                    </div>
                    <Link href={feature.href}><ArrowRight className="h-6 w-6" /></Link>
                </Card>
            ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
                 <CardHeader>
                    <CardTitle>{translate('quickOverview', 'Quick Overview')}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-4 text-center">
                    {quickOverview.map(item => (
                        <div key={item.id} className="bg-muted/50 p-4 rounded-lg flex flex-col items-center gap-2">
                            <div className="p-3 bg-white rounded-full text-primary">
                                <item.icon className="h-6 w-6"/>
                            </div>
                            <p className="text-2xl font-bold">{item.value}</p>
                            <p className="text-sm text-muted-foreground">{item.title}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">{translate('weatherToday', 'Weather Today')} <Cloud className="h-8 w-8"/></CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {weatherLoading ? (
                        <div className="flex items-center justify-center w-full h-24">
                            <Loader2 className="h-8 w-8 animate-spin" />
                        </div>
                    ) : weather ? (
                        <>
                            <div>
                                <p className="text-5xl font-bold">{weather.temperature}°C</p>
                                <p className="text-white/80">{weather.condition}</p>
                            </div>
                            <div className="flex justify-between text-sm text-white/80">
                                <p className="flex items-center gap-1"><Droplets className="h-4 w-4" /> {translate('humidity', 'Humidity')}: {weather.humidity}%</p>
                                <p className="flex items-center gap-1"><Wind className="h-4 w-4" /> {weather.wind} km/h</p>
                            </div>
                            <div className="bg-white/20 rounded-md p-2 text-center text-xs">
                                {translate('lightRainTomorrow', 'Light rain expected tomorrow')}
                            </div>
                        </>
                    ) : (
                        <p>{translate('weatherNotAvailable', 'Weather data not available.')}</p>
                    )}
                </CardContent>
            </Card>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>{translate('recentFarmActivities', 'Recent Farm Activities')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Placeholder for recent activities */}
                    <p className="text-muted-foreground">{translate('noRecentActivities', 'No recent activities logged.')}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>{translate('alertsAndNews', 'Alerts & News')}</CardTitle>
                </CardHeader>
                <CardContent>
                     {/* Placeholder for alerts & news */}
                    <p className="text-muted-foreground">{translate('noNewAlerts', 'No new alerts or news.')}</p>
                </CardContent>
            </Card>
        </section>
    </div>
  );
}
