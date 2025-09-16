'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud, Leaf, AlertTriangle, BadgePercent, FileText, Mic, Square } from 'lucide-react';
import { diagnosePlantDisease, DiagnosePlantDiseaseOutput } from '@/ai/flows/plant-disease-diagnosis';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { useLocalization } from '@/context/localization-context';
import { speechToText } from '@/ai/flows/speech-to-text-flow';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";


type InputMode = 'image' | 'text' | 'audio';

export default function DiagnosePage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [result, setResult] = useState<DiagnosePlantDiseaseOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<InputMode>('image');
  const [isRecording, setIsRecording] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  const { translate } = useLocalization();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
        if (!selectedFile.type.startsWith('image/')) {
            toast({
                variant: 'destructive',
                title: translate('invalidFileType', 'Invalid file type'),
                description: translate('uploadAnImage', 'Please upload an image file.'),
            });
            return;
        }
      setFile(selectedFile);
      setTextInput('');
      setResult(null);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const toDataURL = (file: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleDiagnose = async () => {
    if (!file && !textInput) {
      toast({
        variant: 'destructive',
        title: translate('noInputProvided', 'No input provided'),
        description: translate('pleaseProvideInput', 'Please upload an image or describe the symptoms.'),
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      let photoDataUri: string | undefined;
      if (file && inputMode === 'image') {
        photoDataUri = await toDataURL(file);
      }
      
      const diagnosisResult = await diagnosePlantDisease({ 
        photoDataUri,
        symptoms: textInput || undefined,
      });
      setResult(diagnosisResult);
    } catch (e) {
      console.error(e);
      setError('An error occurred while diagnosing the plant. Please try again.');
      toast({
        variant: 'destructive',
        title: translate('diagnosisFailed', 'Diagnosis Failed'),
        description: translate('diagnosisError', 'Could not get a diagnosis. Please check your connection and try again.'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        setIsTranscribing(true);
        setTextInput('');

        try {
            const audioDataUri = await toDataURL(audioBlob);
            const { text } = await speechToText({ audioDataUri });
            setTextInput(text);
        } catch(e) {
            console.error(e);
            toast({
                variant: 'destructive',
                title: 'Transcription Failed',
                description: 'Could not transcribe the audio. Please try again.',
            });
        } finally {
            setIsTranscribing(false);
            stream.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: translate('microphoneAccessDenied', 'Microphone access denied'),
        description: translate('allowMicrophone', 'Please allow microphone access to record audio.'),
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAudioButtonClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Card className="w-full">
        <CardHeader className="text-center">
          <Leaf className="mx-auto h-12 w-12 text-primary"/>
          <CardTitle className="text-3xl font-headline">{translate('plantDiseaseDiagnosis', 'Plant Disease Diagnosis')}</CardTitle>
          <CardDescription className="text-lg">
            {translate('diagnosisSubtitle', 'Use an image, text, or your voice to get an AI-powered diagnosis.')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <Tabs value={inputMode} onValueChange={(value) => setInputMode(value as InputMode)} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="image"><UploadCloud className="mr-2 h-4 w-4"/>{translate('image', 'Image')}</TabsTrigger>
                    <TabsTrigger value="text"><FileText className="mr-2 h-4 w-4"/>{translate('text', 'Text')}</TabsTrigger>
                    <TabsTrigger value="audio"><Mic className="mr-2 h-4 w-4"/>{translate('audio', 'Audio')}</TabsTrigger>
                </TabsList>
                <TabsContent value="image">
                    <div className="relative flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed border-border p-8 mt-4">
                        {previewUrl ? (
                        <div className="relative h-64 w-full max-w-md">
                            <Image src={previewUrl} alt="Plant preview" fill className="rounded-md object-contain" />
                        </div>
                        ) : (
                            <div className="text-center">
                                <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
                                <p className="mt-2 text-muted-foreground">{translate('dragAndDrop', 'Drag & drop an image here, or click to select')}</p>
                            </div>
                        )}
                        <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute h-full w-full cursor-pointer opacity-0"
                        />
                    </div>
                    {file && <p className="text-center text-sm text-muted-foreground mt-2">{translate('selectedFile', 'Selected file: {fileName}').replace('{fileName}', file.name)}</p>}
                </TabsContent>
                <TabsContent value="text">
                    <Textarea
                        placeholder={translate('symptomsPlaceholder', "e.g., 'The leaves are yellow with brown spots and the stems are weak...'")}
                        className="mt-4 min-h-[200px] text-base"
                        value={textInput}
                        onChange={(e) => {
                            setTextInput(e.target.value);
                            setFile(null);
                        }}
                    />
                </TabsContent>
                <TabsContent value="audio">
                   <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border-2 border-dashed border-border p-8 mt-4 min-h-[200px]">
                      <Button onClick={handleAudioButtonClick} size="lg" variant={isRecording ? 'destructive' : 'outline'} className="rounded-full h-24 w-24">
                        {isRecording ? <Square className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
                      </Button>
                      <p className="text-muted-foreground">{isRecording ? translate('recording', 'Recording... Click to stop.') : translate('recordSymptoms', 'Click to record symptoms')}</p>
                      {isTranscribing && (
                        <div className="flex items-center gap-2">
                           <Loader2 className="h-4 w-4 animate-spin"/>
                           <p className="text-sm">Transcribing audio...</p>
                        </div>
                      )}
                      {textInput && inputMode === 'audio' && !isTranscribing && (
                        <p className="text-sm text-center bg-muted p-2 rounded-md">{textInput}</p>
                      )}
                   </div>
                </TabsContent>
            </Tabs>
          
          <Button onClick={handleDiagnose} disabled={(!file && !textInput) || isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {translate('diagnosing', 'Diagnosing...')}
              </>
            ) : (
              translate('diagnosePlant', 'Diagnose Plant')
            )}
          </Button>

          {error && (
             <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{translate('error', 'Error')}</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-6 pt-6 border-t">
                <div className="flex flex-col items-center text-center">
                    <h2 className="text-2xl font-headline">{translate('diagnosisResult', 'Diagnosis Result')}</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="font-medium flex items-center gap-2 text-sm"><BadgePercent/> {translate('confidence', 'Confidence')}</span>
                        <div className="w-24">
                            <Progress value={result.confidenceScore * 100} />
                        </div>
                        <span className="text-sm font-semibold">{(result.confidenceScore * 100).toFixed(0)}%</span>
                    </div>
                </div>

                <Accordion type="single" collapsible defaultValue="en" className="w-full">
                    <AccordionItem value="en">
                        <AccordionTrigger>English</AccordionTrigger>
                        <AccordionContent>
                           <Card>
                             <CardHeader>
                                <CardTitle>{result.en.diagnosis}</CardTitle>
                             </CardHeader>
                             <CardContent>
                                <h3 className="font-semibold mt-4 mb-2">Treatment</h3>
                                <p className="text-sm whitespace-pre-wrap">{result.en.treatment}</p>
                             </CardContent>
                           </Card>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="hi">
                        <AccordionTrigger>हिन्दी (Hindi)</AccordionTrigger>
                        <AccordionContent>
                            <Card>
                                <CardHeader>
                                    <CardTitle>{result.hi.diagnosis}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <h3 className="font-semibold mt-4 mb-2">उपचार</h3>
                                    <p className="text-sm whitespace-pre-wrap">{result.hi.treatment}</p>
                                </CardContent>
                            </Card>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="ml">
                        <AccordionTrigger>മലയാളം (Malayalam)</AccordionTrigger>
                        <AccordionContent>
                            <Card>
                                <CardHeader>
                                    <CardTitle>{result.ml.diagnosis}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <h3 className="font-semibold mt-4 mb-2">ചികിത്സ</h3>
                                    <p className="text-sm whitespace-pre-wrap">{result.ml.treatment}</p>
                                </CardContent>
                            </Card>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
