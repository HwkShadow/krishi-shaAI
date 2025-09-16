
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, Bot, Mic, ArrowRight, Sun, Wind, Droplets, Cloud, Bell, ClipboardList, MessageSquare, Loader2, Users, CalendarIcon, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { useLocalization } from "@/context/localization-context";
import { useEffect, useState } from "react";
import { getWeather, GetWeatherOutput } from "@/ai/flows/get-weather-flow";
import { getWeatherAlerts, WeatherAlert } from "@/ai/flows/weather-alert-flow";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLogs } from "@/context/log-context";
import { isSameDay } from "date-fns";
import { DayPicker } from "react-day-picker";
import { useCommunity } from "@/context/community-context";

export default function DashboardPage() {
  const { user } = useAuth();
  const { translate, language } = useLocalization();
  const [weather, setWeather] = useState<GetWeatherOutput | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [greeting, setGreeting] = useState('');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { logs } = useLogs();
  const { discussions } = useCommunity();

  const loggedDays = logs.map(log => log.date);

  const dayPickerModifiers = {
    logged: loggedDays,
  };

  const dayPickerModifierStyles = {
    logged: {
      position: 'relative',
      backgroundColor: 'hsl(var(--primary) / 0.1)',
    }
  };
  
  const DayPickerFooter = () => {
    const selectedLogs = logs.filter(log => date && isSameDay(log.date, date));

    if (date && selectedLogs.length > 0) {
        return (
            <div className="mt-2 p-2 bg-muted/50 rounded-md text-sm">
                <p className="font-bold">Activities on this day:</p>
                <ul className="list-disc list-inside">
                    {selectedLogs.map(log => <li key={log.id}>{log.activity} on {log.crop}</li>)}
                </ul>
            </div>
        )
    }
    return <p className="text-sm mt-2 text-muted-foreground">Select a day to see activities.</p>;
  }

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

   const quickOverview = [
      { id: 1, title: "AI Queries", value: "0", icon: MessageSquare, href: "/dashboard/query"},
      { id: 2, title: "Farm Activities", value: logs.length, icon: ClipboardList, href: "/dashboard/farm-log" },
      { id: 3, title: "New Alerts", value: alerts.length, icon: Bell, href: "/dashboard/alerts" },
  ]
  
  useEffect(() => {
    async function fetchData() {
      if (user?.location) {
        setWeatherLoading(true);
        try {
          const [weatherData, alertsData] = await Promise.all([
            getWeather({ location: user.location }),
            getWeatherAlerts({ location: user.location }),
          ]);
          setWeather(weatherData);
          setAlerts(alertsData.alerts);
        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
          setWeather(null);
          setAlerts([]);
        } finally {
          setWeatherLoading(false);
        }
      } else {
        setWeather(null);
        setAlerts([]);
        setWeatherLoading(false);
      }
    }
    fetchData();
  }, [user?.location]);


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
  
  const getTranslatedContent = (content: any) => {
      return content[language] || content.en;
  }


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
                       <Link href={item.href} key={item.id}>
                        <div className="bg-muted/50 p-4 rounded-lg flex flex-col items-center gap-2 h-full transition-colors hover:bg-muted">
                            <div className="p-3 bg-white rounded-full text-primary">
                                <item.icon className="h-6 w-6"/>
                            </div>
                            <p className="text-2xl font-bold">{item.value}</p>
                            <p className="text-sm text-muted-foreground">{item.title}</p>
                        </div>
                       </Link>
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

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             <Link href="/dashboard/farm-log" className="lg:col-span-1 block transition-transform hover:scale-[1.02]">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="h-6 w-6 text-primary"/>
                            Activity Calendar
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border"
                            modifiers={dayPickerModifiers}
                            modifiersStyles={dayPickerModifierStyles}
                            components={{
                                DayContent: (props) => {
                                    const isLogged = loggedDays.some(loggedDay => isSameDay(loggedDay, props.date));
                                    return (
                                        <div className="relative w-full h-full flex items-center justify-center">
                                            <span>{props.date.getDate()}</span>
                                            {isLogged && <div className="absolute bottom-1 w-1 h-1 bg-primary rounded-full"></div>}
                                        </div>
                                    );
                                }
                            }}
                            footer={<DayPickerFooter />}
                        />
                    </CardContent>
                </Card>
            </Link>
            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-6 w-6 text-primary"/>
                        Latest Community Discussions
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {discussions.slice(0, 2).map((d) => (
                         <Card key={d.id} className="p-4 hover:bg-muted/50 transition-colors">
                            <Link href="/dashboard/community">
                                <div className="flex items-start gap-4">
                                <Avatar>
                                    <AvatarImage src={d.authorAvatar ?? undefined} />
                                    <AvatarFallback>{d.authorName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-semibold text-md">{getTranslatedContent(d.title)}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                    <span>{d.authorName}</span>
                                    <span>&middot;</span>
                                     <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {d.tag && <Badge variant="secondary" className="mt-2">{d.tag}</Badge>}
                                </div>
                                <div className="flex items-center gap-4 text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <ThumbsUp className="h-4 w-4" />
                                        <span>{d.likes.length}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                    <MessageSquare className="h-4 w-4" />
                                    <span>{d.comments.length}</span>
                                    </div>
                                </div>
                                </div>
                            </Link>
                        </Card>
                    ))}
                     <Button variant="outline" className="w-full" asChild>
                        <Link href="/dashboard/community">View All Discussions <ArrowRight className="ml-2 h-4 w-4"/></Link>
                    </Button>
                </CardContent>
            </Card>
        </section>
    </div>
  );
}

    