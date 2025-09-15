
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, MessageSquare, ClipboardList, ArrowRight, Sun, Wind, Droplets, Newspaper } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";

const features = [
  {
    title: "Diagnose Plant Disease",
    description: "Upload a photo to detect diseases and get treatment advice.",
    icon: Stethoscope,
    href: "/dashboard/diagnose",
    cta: "Start Diagnosis",
    image: "https://picsum.photos/seed/plant/600/400",
    imageHint: "plant leaf"
  },
  {
    title: "Ask an Expert",
    description: "Get answers to your farming questions from our AI expert.",
    icon: MessageSquare,
    href: "/dashboard/query",
    cta: "Ask Now",
    image: "https://picsum.photos/seed/query/600/400",
    imageHint: "question mark"
  },
  {
    title: "Manage Your Farm Log",
    description: "Keep track of all your farming activities in one place.",
    icon: ClipboardList,
    href: "/dashboard/farm-log",
    cta: "View Log",
    image: "https://picsum.photos/seed/farmlog/600/400",
    imageHint: "notebook farm"
  },
];

const newsItems = [
    { id: 1, title: "New government subsidy for drip irrigation announced.", source: "Krishi Jagran", time: "2h ago" },
    { id: 2, title: "Weather forecast: Expect light showers this weekend.", source: "Local Times", time: "8h ago" },
    { id: 3, title: "Market Watch: Soybean prices see a 5% increase.", source: "Mandi News", time: "1d ago" },
]

export default function DashboardPage() {
  const { user } = useAuth();
  
  // Mock weather data. In a real app, this would be fetched from an API.
  const weather = {
    temperature: 32,
    condition: "Sunny",
    wind: 15,
    humidity: 45,
    location: user?.location || "your area"
  }

  return (
    <div className="space-y-8">
        <section className="bg-primary/10 rounded-lg p-8 space-y-4">
            <h1 className="text-4xl font-headline text-primary">Welcome, {user?.name || 'Farmer'}!</h1>
            <p className="text-lg text-foreground/80">
                Your digital companion for a smarter, more productive harvest. Here's what you can do today.
            </p>
        </section>
        
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle className="font-headline">Weather in {weather.location}</CardTitle>
                    <CardDescription>Current conditions and forecast.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-center justify-around gap-6 text-center">
                    <div className="flex items-center gap-4">
                        <Sun className="h-16 w-16 text-yellow-500" />
                        <div>
                            <p className="text-5xl font-bold">{weather.temperature}°C</p>
                            <p className="text-muted-foreground">{weather.condition}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                        <Wind className="h-8 w-8 text-primary/70" />
                        <div>
                             <p className="text-lg font-bold">{weather.wind} km/h</p>
                             <p className="text-sm">Wind</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground">
                        <Droplets className="h-8 w-8 text-primary/70" />
                         <div>
                             <p className="text-lg font-bold">{weather.humidity}%</p>
                             <p className="text-sm">Humidity</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

             <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Newspaper className="text-primary"/> Local News</CardTitle>
                    <CardDescription>Updates from your region.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {newsItems.map(item => (
                            <li key={item.id} className="text-sm border-b border-border/70 pb-2 last:border-b-0">
                                <p className="font-semibold hover:text-primary cursor-pointer">{item.title}</p>
                                <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                                    <span>{item.source}</span>
                                    <span>{item.time}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </section>

        <section>
            <h2 className="text-3xl font-headline mb-6">Quick Actions</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {features.map((feature) => (
                    <Card key={feature.title} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                         <div className="relative h-48 w-full">
                            <Image 
                                src={feature.image}
                                alt={feature.title}
                                fill
                                className="object-cover"
                                data-ai-hint={feature.imageHint}
                            />
                         </div>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/20 p-3 rounded-full">
                                    <feature.icon className="h-6 w-6 text-primary" />
                                </div>
                                <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow flex flex-col">
                            <CardDescription className="flex-grow">{feature.description}</CardDescription>
                            <Button asChild className="mt-4 w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                                <Link href={feature.href}>
                                    {feature.cta} <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    </div>
  );
}
