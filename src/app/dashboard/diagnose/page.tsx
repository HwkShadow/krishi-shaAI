'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud, Leaf, AlertTriangle, BadgePercent } from 'lucide-react';
import { diagnosePlantDisease, DiagnosePlantDiseaseOutput } from '@/ai/flows/plant-disease-diagnosis';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

export default function DiagnosePage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DiagnosePlantDiseaseOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
        if (!selectedFile.type.startsWith('image/')) {
            toast({
                variant: 'destructive',
                title: 'Invalid file type',
                description: 'Please upload an image file.',
            });
            return;
        }
      setFile(selectedFile);
      setResult(null);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const toDataURL = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleDiagnose = async () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'No file selected',
        description: 'Please upload an image of the plant.',
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const photoDataUri = await toDataURL(file);
      const diagnosisResult = await diagnosePlantDisease({ photoDataUri });
      setResult(diagnosisResult);
    } catch (e) {
      console.error(e);
      setError('An error occurred while diagnosing the plant. Please try again.');
      toast({
        variant: 'destructive',
        title: 'Diagnosis Failed',
        description: 'Could not get a diagnosis. Please check your connection and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const PillIcon = ({ children }: { children: React.ReactNode }) => (
    <div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
        {children}
    </div>
  );

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card className="w-full">
        <CardHeader className="text-center">
          <Leaf className="mx-auto h-12 w-12 text-primary"/>
          <CardTitle className="text-3xl font-headline">Plant Disease Diagnosis</CardTitle>
          <CardDescription className="text-lg">
            Upload an image of an affected plant to get an AI-powered diagnosis and treatment plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed border-border p-8">
            {previewUrl ? (
              <div className="relative h-64 w-full max-w-md">
                 <Image src={previewUrl} alt="Plant preview" fill className="rounded-md object-contain" />
              </div>
            ) : (
                <div className="text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">Drag & drop an image here, or click to select</p>
                </div>
            )}
             <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute h-full w-full cursor-pointer opacity-0"
            />
          </div>
          
          {file && <p className="text-center text-sm text-muted-foreground">Selected file: {file.name}</p>}

          <Button onClick={handleDiagnose} disabled={!file || isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Diagnosing...
              </>
            ) : (
              'Diagnose Plant'
            )}
          </Button>

          {error && (
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-6 pt-6 border-t">
                <h2 className="text-2xl font-headline text-center">Diagnosis Result</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between font-headline">
                                <span>Diagnosis</span>
                                <PillIcon>{result.diagnosis}</PillIcon>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium flex items-center gap-2"><BadgePercent/> Confidence</span>
                                    <span>{(result.confidenceScore * 100).toFixed(0)}%</span>
                                </div>
                                <Progress value={result.confidenceScore * 100} />
                           </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">
                                Suggested Treatment
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm">{result.treatment}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
