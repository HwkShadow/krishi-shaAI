
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

type Language = 'en' | 'hi' | 'ml';

type LocalizationContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  translate: (key: string, defaultText: string) => string;
};

const translations: Record<Language, Record<string, string>> = {
  en: {
    // General
    welcome: "Welcome",
    user: "User",
    logout: "Log out",
    settings: "Settings",
    profile: "Profile",
    cancel: "Cancel",
    submit: "Submit",
    error: "Error",
    comingSoon: "feature coming soon!",
    profilePageComingSoon: "Profile page coming soon!",
    settingsPageComingSoon: "Settings page coming soon!",

    // Sidebar
    dashboard: "Dashboard",
    diagnose: "Diagnose",
    query: "Query",
    farmLog: "Farm Log",
    community: "Community",
    alerts: "Alerts",

    // Login/Signup
    welcomeBack: "Welcome Back",
    createAccount: "Create an Account",
    loginToDashboard: "Sign in to access your dashboard",
    aiCompanionAwaits: "Your AI companion for farming awaits",
    email: "Email",
    password: "Password",
    location: "Location",
    login: "Log In",
    signup: "Sign Up",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",

    // Dashboard Page
    welcomeMessage: "Welcome, {name}!",
    welcomeSubtitle: "Your digital companion for a smarter, more productive harvest. Here's what you can do today.",
    weatherIn: "Weather in {location}",
    weatherConditions: "Current conditions and forecast.",
    wind: "Wind",
    humidity: "Humidity",
    localNews: "Local News",
    regionalUpdates: "Updates from your region.",
    quickActions: "Quick Actions",
    diagnosePlantDisease: "Diagnose Plant Disease",
    diagnoseDescription: "Upload a photo to detect diseases and get treatment advice.",
    startDiagnosis: "Start Diagnosis",
    askAnExpert: "Ask an Expert",
    askAnExpertDescription: "Get answers to your farming questions from our AI expert.",
    askNow: "Ask Now",
    manageFarmLog: "Manage Your Farm Log",
    manageFarmLogDescription: "Keep track of all your farming activities in one place.",
    viewLog: "View Log",
    weatherNotAvailable: "Weather data not available.",
    
    // Diagnose Page
    plantDiseaseDiagnosis: "Plant Disease Diagnosis",
    diagnosisSubtitle: "Use an image, text, or your voice to get an AI-powered diagnosis.",
    image: "Image",
    text: "Text",
    audio: "Audio",
    dragAndDrop: "Drag & drop an image here, or click to select",
    selectedFile: "Selected file: {fileName}",
    diagnosePlant: "Diagnose Plant",
    diagnosing: "Diagnosing...",
    diagnosisResult: "Diagnosis Result",
    diagnosis: "Diagnosis",
    confidence: "Confidence",
    suggestedTreatment: "Suggested Treatment",
    noInputProvided: "No input provided",
    pleaseProvideInput: "Please upload an image or describe the symptoms.",
    diagnosisFailed: "Diagnosis Failed",
    diagnosisError: "Could not get a diagnosis. Please check your connection and try again.",
    recordSymptoms: "Click to record symptoms",
    recording: "Recording... Click to stop.",
    invalidFileType: "Invalid file type",
    uploadAnImage: "Please upload an image file.",
    microphoneAccessDenied: "Microphone access denied",
    allowMicrophone: "Please allow microphone access to record audio.",
    symptomsPlaceholder: "e.g., 'The leaves are yellow with brown spots and the stems are weak...'",

    // Query Page
    askKrishiSahai: "Ask Krishi SahAI",
    askAnything: "Your AI farming assistant. Ask anything in any language.",
    typeYourQuestion: "Type your question here...",
    send: "Send",
    failedToGetResponse: "Failed to get a response. Please try again.",
    voiceInputComingSoon: "Voice input coming soon!",
    imageUploadComingSoon: "Image upload coming soon!",

    // Farm Log Page
    farmActivityLog: "Farm Activity Log",
    farmLogSubtitle: "A record of your hard work and planning.",

    // Community Page
    communityForum: "Community Forum",
    communitySubtitle: "Connect with fellow farmers, share knowledge, and grow together.",
    startDiscussion: "Start Discussion",
    addComment: "Add a comment...",
    comment: "Comment",

    // Alerts Page
    proactiveAlerts: "Proactive Alerts",
    alertsSubtitle: "Timely warnings to help you stay one step ahead.",
  },
  hi: {
    // General
    welcome: "आपका स्वागत है",
    user: "उपयोगकर्ता",
    logout: "लॉग आउट",
    settings: "सेटिंग्स",
    profile: "प्रोफ़ाइल",
    cancel: "रद्द करें",
    submit: "प्रस्तुत करें",
    error: "त्रुटि",
    comingSoon: "सुविधा जल्द ही आ रही है!",
    profilePageComingSoon: "प्रोफ़ाइल पृष्ठ जल्द ही आ रहा है!",
    settingsPageComingSoon: "सेटिंग्स पृष्ठ जल्द ही आ रहा है!",

    // Sidebar
    dashboard: "डैशबोर्ड",
    diagnose: "निदान",
    query: "प्रश्न",
    farmLog: "फार्म लॉग",
    community: "समुदाय",
    alerts: "अलर्ट",

    // Login/Signup
    welcomeBack: "वापसी पर स्वागत है",
    createAccount: "खाता बनाएं",
    loginToDashboard: "अपने डैशबोर्ड तक पहुंचने के लिए साइन इन करें",
    aiCompanionAwaits: "खेती के लिए आपका AI साथी इंतजार कर रहा है",
    email: "ईमेल",
    password: "पासवर्ड",
    location: "स्थान",
    login: "लॉग इन करें",
    signup: "साइन अप करें",
    dontHaveAccount: "खाता नहीं है?",
    alreadyHaveAccount: "पहले से ही खाता है?",

    // Dashboard Page
    welcomeMessage: "नमस्ते, {name}!",
    welcomeSubtitle: "एक स्मार्ट, अधिक उत्पादक फसल के लिए आपका डिजिटल साथी। आज आप यह कर सकते हैं।",
    weatherIn: "{location} में मौसम",
    weatherConditions: "वर्तमान स्थितियां और पूर्वानुमान।",
    wind: "हवा",
    humidity: "नमी",
    localNews: "स्थानीय समाचार",
    regionalUpdates: "आपके क्षेत्र से अपडेट।",
    quickActions: "त्वरित कार्रवाइयां",
    diagnosePlantDisease: "पौधे की बीमारी का निदान करें",
    diagnoseDescription: "बीमारियों का पता लगाने और उपचार सलाह पाने के लिए एक फोटो अपलोड करें।",
    startDiagnosis: "निदान शुरू करें",
    askAnExpert: "किसी विशेषज्ञ से पूछें",
    askAnExpertDescription: "हमारे AI विशेषज्ञ से अपने खेती के सवालों के जवाब पाएं।",
    askNow: "अभी पूछें",
    manageFarmLog: "अपना फार्म लॉग प्रबंधित करें",
    manageFarmLogDescription: "अपनी सभी खेती की गतिविधियों का एक ही स्थान पर हिसाब रखें।",
    viewLog: "लॉग देखें",
    weatherNotAvailable: "मौसम डेटा उपलब्ध नहीं है।",

    // Diagnose Page
    plantDiseaseDiagnosis: "पौध रोग निदान",
    diagnosisSubtitle: "AI-संचालित निदान पाने के लिए एक छवि, पाठ, या अपनी आवाज़ का उपयोग करें।",
    image: "छवि",
    text: "पाठ",
    audio: "ऑडियो",
    dragAndDrop: "एक छवि को यहाँ खींचें और छोड़ें, या चयन करने के लिए क्लिक करें",
    selectedFile: "चयनित फ़ाइल: {fileName}",
    diagnosePlant: "पौधे का निदान करें",
    diagnosing: "निदान हो रहा है...",
    diagnosisResult: "निदान परिणाम",
    diagnosis: "निदान",
    confidence: "आत्मविश्वास",
    suggestedTreatment: "सुझाई गई चिकित्सा",
    noInputProvided: "कोई इनपुट प्रदान नहीं किया गया",
    pleaseProvideInput: "कृपया एक छवि अपलोड करें या लक्षणों का वर्णन करें।",
    diagnosisFailed: "निदान विफल",
    diagnosisError: "निदान प्राप्त नहीं हो सका। कृपया अपना कनेक्शन जांचें और पुनः प्रयास करें।",
    recordSymptoms: "लक्षण रिकॉर्ड करने के लिए क्लिक करें",
    recording: "रिकॉर्डिंग हो रही है... रोकने के लिए क्लिक करें।",
    invalidFileType: "अमान्य फ़ाइल प्रकार",
    uploadAnImage: "कृपया एक छवि फ़ाइल अपलोड करें।",
    microphoneAccessDenied: "माइक्रोफ़ोन एक्सेस अस्वीकृत",
    allowMicrophone: "ऑडियो रिकॉर्ड करने के लिए कृपया माइक्रोफ़ोन एक्सेस की अनुमति दें।",
    symptomsPlaceholder: "उदा., 'पत्तियां पीली हैं और भूरे धब्बे हैं और तने कमजोर हैं...'",
    
    // Query Page
    askKrishiSahai: "कृषि सहाई से पूछें",
    askAnything: "आपका AI खेती सहायक। किसी भी भाषा में कुछ भी पूछें।",
    typeYourQuestion: "अपना प्रश्न यहाँ लिखें...",
    send: "भेजें",
    failedToGetResponse: "प्रतिक्रिया प्राप्त करने में विफल। कृपया पुनः प्रयास करें।",
    voiceInputComingSoon: "आवाज़ इनपुट जल्द ही आ रहा है!",
    imageUploadComingSoon: "छवि अपलोड जल्द ही आ रहा है!",
    
    // Farm Log Page
    farmActivityLog: "फार्म गतिविधि लॉग",
    farmLogSubtitle: "आपकी कड़ी मेहनत और योजना का रिकॉर्ड।",

    // Community Page
    communityForum: "सामुदायिक मंच",
    communitySubtitle: " साथी किसानों से जुड़ें, ज्ञान साझा करें, और एक साथ बढ़ें।",
    startDiscussion: "चर्चा शुरू करें",
    addComment: "एक टिप्पणी जोड़ें...",
    comment: "टिप्पणी",

    // Alerts Page
    proactiveAlerts: "सक्रिय अलर्ट",
    alertsSubtitle: "आपको एक कदम आगे रहने में मदद करने के लिए समय पर चेतावनी।",
  },
  ml: {
    // General
    welcome: "സ്വാഗതം",
    user: "ഉപയോക്താവ്",
    logout: "ലോഗ്ഔട്ട്",
    settings: "ക്രമീകരണങ്ങൾ",
    profile: "പ്രൊഫൈൽ",
    cancel: "റദ്ദാക്കുക",
    submit: "സമർപ്പിക്കുക",
    error: "പിശക്",
    comingSoon: "ഫീച്ചർ ഉടൻ വരുന്നു!",
    profilePageComingSoon: "പ്രൊഫൈൽ പേജ് ഉടൻ വരുന്നു!",
    settingsPageComingSoon: "ക്രമീകരണ പേജ് ഉടൻ വരുന്നു!",

    // Sidebar
    dashboard: "ഡാഷ്ബോർഡ്",
    diagnose: "രോഗനിർണയം",
    query: "ചോദ്യം",
    farmLog: "ഫാം ലോഗ്",
    community: "കമ്മ്യൂണിറ്റി",
    alerts: "അലേർട്ടുകൾ",

    // Login/Signup
    welcomeBack: "വീണ്ടും സ്വാഗതം",
    createAccount: "അക്കൗണ്ട് ഉണ്ടാക്കുക",
    loginToDashboard: "നിങ്ങളുടെ ഡാഷ്‌ബോർഡിലേക്ക് പ്രവേശിക്കാൻ സൈൻ ഇൻ ചെയ്യുക",
    aiCompanionAwaits: "കൃഷിക്കായുള്ള നിങ്ങളുടെ AI കൂട്ടാളി കാത്തിരിക്കുന്നു",
    email: "ഇമെയിൽ",
    password: "പാസ്‌വേഡ്",
    location: "സ്ഥലം",
    login: "ലോഗിൻ ചെയ്യുക",
    signup: "സൈൻ അപ്പ് ചെയ്യുക",
    dontHaveAccount: "അക്കൗണ്ട് ഇല്ലേ?",
    alreadyHaveAccount: "ഇതിനകം അക്കൗണ്ട് ഉണ്ടോ?",

    // Dashboard Page
    welcomeMessage: "സ്വാഗതം, {name}!",
    welcomeSubtitle: "മികച്ചതും കൂടുതൽ ഉൽപ്പാദനക്ഷമവുമായ വിളവെടുപ്പിനായി നിങ്ങളുടെ ഡിജിറ്റൽ കൂട്ടാളി. ഇന്ന് നിങ്ങൾക്ക് ചെയ്യാൻ കഴിയുന്ന കാര്യങ്ങൾ ഇതാ.",
    weatherIn: "{location}ലെ കാലാവസ്ഥ",
    weatherConditions: "നിലവിലെ അവസ്ഥകളും പ്രവചനവും.",
    wind: "കാറ്റ്",
    humidity: "ഈർപ്പം",
    localNews: "പ്രാദേശിക വാർത്തകൾ",
    regionalUpdates: "നിങ്ങളുടെ പ്രദേശത്ത് നിന്നുള്ള അപ്‌ഡേറ്റുകൾ.",
    quickActions: "ദ്രുത പ്രവർത്തനങ്ങൾ",
    diagnosePlantDisease: "സസ്യരോഗം നിർണ്ണയിക്കുക",
    diagnoseDescription: "രോഗങ്ങൾ കണ്ടെത്താനും ചികിത്സാ ഉപദേശം നേടാനും ഒരു ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക.",
    startDiagnosis: "രോഗനിർണയം ആരംഭിക്കുക",
    askAnExpert: "വിദഗ്ദ്ധനോട് ചോദിക്കുക",
    askAnExpertDescription: "ഞങ്ങളുടെ AI വിദഗ്ദ്ധനിൽ നിന്ന് നിങ്ങളുടെ കാർഷിക ചോദ്യങ്ങൾക്ക് ഉത്തരം നേടുക.",
    askNow: "ഇപ്പോൾ ചോദിക്കുക",
    manageFarmLog: "നിങ്ങളുടെ ഫാം ലോഗ് നിയന്ത്രിക്കുക",
    manageFarmLogDescription: "നിങ്ങളുടെ എല്ലാ കാർഷിക പ്രവർത്തനങ്ങളും ഒരിടത്ത് സൂക്ഷിക്കുക.",
    viewLog: "ലോഗ് കാണുക",
    weatherNotAvailable: "കാലാവസ്ഥാ ഡാറ്റ ലഭ്യമല്ല.",
    
    // Diagnose Page
    plantDiseaseDiagnosis: "സസ്യരോഗ നിർണ്ണയം",
    diagnosisSubtitle: "ഒരു AI- പവർഡ് രോഗനിർണയം ലഭിക്കാൻ ഒരു ചിത്രം, ടെക്സ്റ്റ്, അല്ലെങ്കിൽ നിങ്ങളുടെ ശബ്ദം ഉപയോഗിക്കുക.",
    image: "ചിത്രം",
    text: "ടെക്സ്റ്റ്",
    audio: "ഓഡിയോ",
    dragAndDrop: "ഒരു ചിത്രം ഇവിടെ വലിച്ചിടുക, അല്ലെങ്കിൽ തിരഞ്ഞെടുക്കാൻ ക്ലിക്കുചെയ്യുക",
    selectedFile: "തിരഞ്ഞെടുത്ത ഫയൽ: {fileName}",
    diagnosePlant: "സസ്യം നിർണ്ണയിക്കുക",
    diagnosing: "രോഗനിർണയം നടത്തുന്നു...",
    diagnosisResult: "രോഗനിർണയ ഫലം",
    diagnosis: "രോഗനിർണയം",
    confidence: "ആത്മവിശ്വാസം",
    suggestedTreatment: "നിർദ്ദേശിച്ച ചികിത്സ",
    noInputProvided: "ഇൻപുട്ട് നൽകിയിട്ടില്ല",
    pleaseProvideInput: "ദയവായി ഒരു ചിത്രം അപ്‌ലോഡ് ചെയ്യുക അല്ലെങ്കിൽ ലക്ഷണങ്ങൾ വിവരിക്കുക.",
    diagnosisFailed: "രോഗനിർണയം പരാജയപ്പെട്ടു",
    diagnosisError: "ഒരു രോഗനിർണയം ലഭിച്ചില്ല. ദയവായി നിങ്ങളുടെ കണക്ഷൻ പരിശോധിച്ച് വീണ്ടും ശ്രമിക്കുക.",
    recordSymptoms: "ലക്ഷണങ്ങൾ റെക്കോർഡ് ചെയ്യാൻ ക്ലിക്കുചെയ്യുക",
    recording: "റെക്കോർഡുചെയ്യുന്നു... നിർത്താൻ ക്ലിക്കുചെയ്യുക.",
    invalidFileType: "അസാധുവായ ഫയൽ തരം",
    uploadAnImage: "ദയവായി ഒരു ചിത്ര ഫയൽ അപ്‌ലോഡ് ചെയ്യുക.",
    microphoneAccessDenied: "മൈക്രോഫോൺ അനുമതി നിഷേധിച്ചു",
    allowMicrophone: "ഓഡിയോ റെക്കോർഡ് ചെയ്യാൻ ദയവായി മൈക്രോഫോൺ അനുമതി നൽകുക.",
    symptomsPlaceholder: "ഉദാഹരണത്തിന്, 'ഇലകൾ മഞ്ഞ നിറത്തിലും തവിട്ടുനിറത്തിലുള്ള പുള്ളികളോടും കൂടിയതും തണ്ടുകൾ ദുർബലവുമാണ്...'",

    // Query Page
    askKrishiSahai: "കൃഷി സഹאיയോട് ചോദിക്കുക",
    askAnything: "നിങ്ങളുടെ AI കൃഷി സഹായി. ഏത് ഭാഷയിലും എന്തും ചോദിക്കാം.",
    typeYourQuestion: "നിങ്ങളുടെ ചോദ്യം ഇവിടെ ടൈപ്പ് ചെയ്യുക...",
    send: "അയയ്ക്കുക",
    failedToGetResponse: "പ്രതികരണം ലഭിക്കുന്നതിൽ പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക.",
    voiceInputComingSoon: "വോയിസ് ഇൻപുട്ട് ഉടൻ വരുന്നു!",
    imageUploadComingSoon: "ചിത്രം അപ്‌ലോഡ് ഉടൻ വരുന്നു!",
    
    // Farm Log Page
    farmActivityLog: "ഫാം ആക്റ്റിവിറ്റി ലോഗ്",
    farmLogSubtitle: "നിങ്ങളുടെ കഠിനാധ്വാനത്തിന്റെയും ആസൂത്രണത്തിന്റെയും ഒരു രേഖ.",

    // Community Page
    communityForum: "കമ്മ്യൂണിറ്റി ഫോറം",
    communitySubtitle: "സഹ കർഷകരുമായി ബന്ധപ്പെടുക, അറിവ് പങ്കിടുക, ഒരുമിച്ച് വളരുക.",
    startDiscussion: "ചർച്ച ആരംഭിക്കുക",
    addComment: "ഒരു അഭിപ്രായം ചേർക്കുക...",
    comment: "അഭിപ്രായം",

    // Alerts Page
    proactiveAlerts: "മുൻകരുതൽ അലേർട്ടുകൾ",
    alertsSubtitle: "നിങ്ങളെ ഒരു പടി മുന്നിൽ നിർത്താൻ സഹായിക്കുന്ന സമയബന്ധിതമായ മുന്നറിയിപ്പുകൾ.",
  }
};


const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const storedLang = localStorage.getItem("language") as Language | null;
    if (storedLang && ['en', 'hi', 'ml'].includes(storedLang)) {
      setLanguageState(storedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const translate = (key: string, defaultText: string): string => {
    return translations[language]?.[key] || defaultText;
  }

  return (
    <LocalizationContext.Provider value={{ language, setLanguage, translate }}>
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization() {
  const context = useContext(LocalizationContext);
  if (context === undefined) {
    throw new Error("useLocalization must be used within a LocalizationProvider");
  }
  return context;
}
