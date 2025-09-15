'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardList, PlusCircle } from 'lucide-react';
import { useLocalization } from '@/context/localization-context';

const logSchema = z.object({
  activity: z.string().min(1, 'Activity is required'),
  crop: z.string().min(1, 'Crop name is required'),
  date: z.date({ required_error: 'A date is required.' }),
  notes: z.string().optional(),
});

type LogEntry = z.infer<typeof logSchema> & { id: string };

const activityOptions = ['Sowing', 'Pesticide', 'Fertilizing', 'Watering', 'Harvesting', 'Scouting'];

const initialLogs: LogEntry[] = [
    { id: '1', activity: 'Sowing', crop: 'Wheat', date: new Date(2023, 10, 15), notes: 'Sowed 10 acres of wheat.' },
    { id: '2', activity: 'Fertilizing', crop: 'Wheat', date: new Date(2023, 11, 20), notes: 'Applied urea fertilizer.' },
    { id: '3', activity: 'Harvesting', crop: 'Rice', date: new Date(2023, 9, 30), notes: 'Harvested 5 tons of paddy.' },
];

export default function FarmLogPage() {
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const { translate } = useLocalization();

  const form = useForm<z.infer<typeof logSchema>>({
    resolver: zodResolver(logSchema),
    defaultValues: { crop: '', notes: '', date: new Date() },
  });

  function onSubmit(values: z.infer<typeof logSchema>) {
    const newLog: LogEntry = { ...values, id: Date.now().toString() };
    setLogs([newLog, ...logs]);
    form.reset({ crop: '', notes: '', date: new Date() });
    setIsFormVisible(false);
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <h1 className="text-3xl font-headline flex items-center gap-3"><ClipboardList className="text-primary"/>{translate('farmActivityLog', 'Farm Activity Log')}</h1>
                <p className="text-muted-foreground">{translate('farmLogSubtitle', 'A record of your hard work and planning.')}</p>
            </div>
            <Button onClick={() => setIsFormVisible(!isFormVisible)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {isFormVisible ? translate('cancel', 'Cancel') : 'Add New Log'}
            </Button>
        </div>
      
      {isFormVisible && (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline">New Log Entry</CardTitle>
                <CardDescription>Record a new activity on your farm.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <FormField control={form.control} name="activity" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Activity</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select an activity" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {activityOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="crop" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Crop</FormLabel>
                                    <FormControl><Input placeholder="e.g., Wheat, Rice" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="notes" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (optional)</FormLabel>
                                    <FormControl><Textarea placeholder="Any additional details..." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                         <FormField control={form.control} name="date" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date of Activity</FormLabel>
                                <FormControl>
                                   <Card>
                                      <Calendar 
                                          mode="single" 
                                          selected={field.value} 
                                          onSelect={field.onChange} 
                                          className="p-0"
                                           disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                      />
                                   </Card>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4">
                         <Button type="button" variant="outline" onClick={() => { setIsFormVisible(false); form.reset(); }}>{translate('cancel', 'Cancel')}</Button>
                         <Button type="submit">Save Log</Button>
                    </div>
                </form>
                </Form>
            </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Activity History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>Crop</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length > 0 ? logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.activity}</TableCell>
                  <TableCell>{log.crop}</TableCell>
                  <TableCell>{format(log.date, 'PPP')}</TableCell>
                  <TableCell>{log.notes}</TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={4} className="text-center">No logs found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
