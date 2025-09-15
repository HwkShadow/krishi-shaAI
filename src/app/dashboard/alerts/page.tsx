import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell, CloudRain, Bug } from "lucide-react";

const alerts = [
  { 
    id: 1, 
    type: 'weather',
    title: 'Heavy Rain Expected',
    description: 'Expect heavy rainfall in your area in the next 48 hours. Ensure proper drainage for your fields.',
    time: '2 hours ago',
    Icon: CloudRain
  },
  { 
    id: 2, 
    type: 'pest',
    title: 'Pest Outbreak: Locusts',
    description: 'A locust swarm has been reported in a neighboring district. Be vigilant and ready to take protective measures.',
    time: '1 day ago',
    Icon: Bug
  },
  { 
    id: 3, 
    type: 'weather',
    title: 'Heatwave Warning',
    description: 'Temperatures are expected to rise significantly. Ensure adequate irrigation for your crops.',
    time: '3 days ago',
    Icon: CloudRain
  },
];

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-headline flex items-center gap-3"><Bell className="text-primary"/> Proactive Alerts</h1>
        <p className="text-muted-foreground">Timely warnings to help you stay one step ahead.</p>
      </div>
      <div className="space-y-4">
        {alerts.map((alert) => (
          <Alert key={alert.id} variant={alert.type === 'pest' ? 'destructive' : 'default'}>
            <alert.Icon className="h-4 w-4" />
            <div className="flex justify-between items-start w-full">
                <div>
                    <AlertTitle>{alert.title}</AlertTitle>
                    <AlertDescription>{alert.description}</AlertDescription>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0 ml-4">{alert.time}</span>
            </div>
          </Alert>
        ))}
      </div>
    </div>
  );
}
