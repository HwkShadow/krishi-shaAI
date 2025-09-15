import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, PlusCircle, Users } from "lucide-react";
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";

const discussions = [
  { id: 1, title: 'Best pesticide for wheat rust?', author: 'Ramesh K.', avatar: 'https://picsum.photos/seed/ramesh/40', replies: 5, tag: 'Wheat', time: '2 hours ago' },
  { id: 2, title: 'Question about monsoon soil preparation', author: 'Sita D.', avatar: 'https://picsum.photos/seed/sita/40', replies: 12, tag: 'Soil', time: '1 day ago' },
  { id: 3, title: 'Sharing my success with organic farming in Punjab', author: 'Balwinder S.', avatar: 'https://picsum.photos/seed/balwinder/40', replies: 28, tag: 'Organic', time: '3 days ago' },
  { id: 4, title: 'Low yield on my cotton crop, any advice?', author: 'Priya M.', avatar: 'https://picsum.photos/seed/priya/40', replies: 8, tag: 'Cotton', time: '5 days ago' },
];

export default function CommunityPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-headline flex items-center gap-3"><Users className="text-primary" />Community Forum</h1>
          <p className="text-muted-foreground">Connect with fellow farmers, share knowledge, and grow together.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Start Discussion
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <ul className="divide-y">
            {discussions.map((d) => (
              <li key={d.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={d.avatar} data-ai-hint="person face" />
                    <AvatarFallback>{d.author.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Link href="#" className="font-semibold text-lg hover:underline">{d.title}</Link>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span>{d.author}</span>
                      <span>&middot;</span>
                      <span>{d.time}</span>
                    </div>
                     <Badge variant="secondary" className="mt-2">{d.tag}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MessageSquare className="h-4 w-4" />
                    <span>{d.replies}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
