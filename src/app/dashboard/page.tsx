import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, MessageSquare, ClipboardList, Users, Bell, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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


export default function DashboardPage() {
  return (
    <div className="space-y-8">
        <section className="bg-primary/10 rounded-lg p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 space-y-4">
                <h1 className="text-4xl font-headline text-primary">Welcome, Farmer!</h1>
                <p className="text-lg text-foreground/80">
                    Your digital companion for a smarter, more productive harvest. Here's what you can do today.
                </p>
            </div>
            <div className="flex-shrink-0">
                <Image 
                    src="https://picsum.photos/seed/tractor/400/300"
                    alt="Tractor in a field"
                    width={400}
                    height={300}
                    className="rounded-lg object-cover"
                    data-ai-hint="tractor field"
                />
            </div>
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
