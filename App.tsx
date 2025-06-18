
import React, { useState, useCallback, useMemo } from 'react';
import { MaterialType, EducationalMaterialRequest, GenerationResult, GroundingSource } from './types';
import { APP_TITLE, MATERIAL_TYPE_OPTIONS } from './constants';
import { generateEducationalMaterial } from './services/geminiService';
import TextInput from './components/TextInput';
import TextAreaInput from './components/TextAreaInput';
import SelectInput from './components/SelectInput';
import Button from './components/Button';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import ContentDisplay from './components/ContentDisplay';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const App: React.FC = () => {
  const [materialType, setMaterialType] = useState<MaterialType>(MaterialType.LESSON_PLAN);
  const [topic, setTopic] = useState<string>('');
  const [audience, setAudience] = useState<string>('');
  const [objectivesOrKeywords, setObjectivesOrKeywords] = useState<string>('');
  const [additionalDetails, setAdditionalDetails] = useState<string>('');
  
  const [generatedContent, setGeneratedContent] = useState<GenerationResult | null>(null); // Updated state type
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setGeneratedContent(null); // Reset to null
    setIsLoading(true);

    if (!topic.trim() || !audience.trim()) {
      setError("Topic and Target Audience are required.");
      setIsLoading(false);
      return;
    }

    const requestData: EducationalMaterialRequest = {
      materialType,
      topic,
      audience,
      objectives: objectivesOrKeywords,
      additionalDetails,
    };

    try {
      const result = await generateEducationalMaterial(requestData); // result is GenerationResult
      setGeneratedContent(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [materialType, topic, audience, objectivesOrKeywords, additionalDetails]);

  const handleDownloadPDF = useCallback(async () => {
    const contentElement = document.getElementById('content-to-download-area');
    if (!contentElement) {
      setError("Could not find content to download. Please generate content first.");
      return;
    }
    
    setIsDownloadingPdf(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 50));

      const canvas = await html2canvas(contentElement, {
        scale: 2, 
        useCORS: true,
        logging: false,
        backgroundColor: null, 
      });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [canvas.width, canvas.height] 
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      
      const sanitizedTopic = topic.trim().replace(/[^a-z0-9_]+/gi, '_').toLowerCase() || 'document';
      const sanitizedMaterialType = materialType.replace(/[^a-z0-9_]+/gi, '_').toLowerCase();
      
      pdf.save(`${sanitizedMaterialType}_${sanitizedTopic}.pdf`);

    } catch (e) {
      console.error("Error generating PDF:", e);
      setError("Failed to generate PDF. " + (e instanceof Error ? e.message : "An unknown error occurred."));
    } finally {
      setIsDownloadingPdf(false);
    }
  }, [topic, materialType]);

  const objectivesLabel = useMemo(() => {
    return materialType === MaterialType.FIND_RESOURCES 
      ? "Specific Areas of Interest / Keywords (one per line)" 
      : "Learning Objectives / Key Concepts (one per line)";
  }, [materialType]);

  const objectivesPlaceholder = useMemo(() => {
    return materialType === MaterialType.FIND_RESOURCES
      ? "e.g., Quantum physics basics, Key historical figures of the Renaissance"
      : "e.g., Understand the process of photosynthesis.";
  }, [materialType]);
  
  const objectivesHelpText = useMemo(() => {
    return materialType === MaterialType.FIND_RESOURCES
    ? "Keywords or sub-topics to refine the search for example resources."
    : "Main points or skills for the audience.";
  }, [materialType]);

  const generatedContentTitle = useMemo(() => {
    if (!generatedContent) return "";
    if (materialType === MaterialType.FIND_RESOURCES) {
      return `Example Resources Found for "${topic || 'your topic'}"`;
    }
    return `Generated ${materialType}`;
  }, [materialType, topic, generatedContent]);


  return (
    <div className="min-h-screen bg-slate-100/70 backdrop-blur-sm py-10 px-4 sm:px-6 lg:px-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-sky-700 drop-shadow-lg">{APP_TITLE}</h1>
        <p className="mt-3 text-lg text-slate-700 font-medium">
          Generate custom educational materials or find resource examples with AI.
        </p>
      </header>

      <main className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 bg-white/95 backdrop-blur-md shadow-xl rounded-lg space-y-6 border border-slate-200/80">
          <SelectInput
            id="materialType"
            label="Type of Material"
            options={MATERIAL_TYPE_OPTIONS}
            value={materialType}
            onChange={(e) => {
              setMaterialType(e.target.value as MaterialType);
              setGeneratedContent(null); // Clear content when type changes
              setError(null);
            }}
            required
            aria-describedby="materialTypeHelp"
          />
          <p id="materialTypeHelp" className="text-xs text-slate-500 -mt-4 mb-1">Select the type of educational content or task.</p>

          <TextInput
            id="topic"
            label="Topic / Subject"
            placeholder="e.g., Photosynthesis, The American Revolution"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            aria-required="true"
          />
          <TextInput
            id="audience"
            label="Target Audience / Grade Level"
            placeholder="e.g., 5th Graders, High School Chemistry Students"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            required
            aria-required="true"
          />
          <TextAreaInput
            id="objectivesOrKeywords"
            label={objectivesLabel}
            placeholder={objectivesPlaceholder}
            value={objectivesOrKeywords}
            onChange={(e) => setObjectivesOrKeywords(e.target.value)}
            aria-describedby="objectivesOrKeywordsHelp"
          />
           <p id="objectivesOrKeywordsHelp" className="text-xs text-slate-500 -mt-4 mb-1">{objectivesHelpText}</p>
          <TextAreaInput
            id="additionalDetails"
            label="Additional Details / Specific Focus (Optional)"
            placeholder="e.g., Emphasize practical applications, focus on primary sources."
            value={additionalDetails}
            onChange={(e) => setAdditionalDetails(e.target.value)}
          />
          <div className="pt-2">
            <Button type="submit" variant="primary" className="w-full" isLoading={isLoading} disabled={isLoading || isDownloadingPdf}>
              {isLoading ? 'Processing...' : 
                materialType === MaterialType.FIND_RESOURCES ? 'Find Example Resources' : `Generate ${materialType}`
              }
            </Button>
          </div>
        </form>

        {isLoading && <LoadingSpinner />}
        {error && <ErrorMessage message={error} />}
        
        {generatedContent && generatedContent.text && !isLoading && (
          <div 
            id="content-to-download-area"
            className="mt-10 p-6 sm:p-8 bg-white/95 backdrop-blur-md shadow-xl rounded-lg border border-slate-200/80"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-sky-800">{generatedContentTitle}</h2>
              <Button 
                onClick={handleDownloadPDF} 
                variant="secondary" 
                className="bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-400 text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 shadow-md hover:shadow-lg"
                isLoading={isDownloadingPdf}
                disabled={isDownloadingPdf || isLoading}
                aria-label="Download generated content as PDF"
              >
                {isDownloadingPdf ? (
                  <>
                    <svg className="animate-spin -ml-0.5 mr-1.5 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Downloading...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download PDF
                  </>
                )}
              </Button>
            </div>
            <ContentDisplay content={generatedContent.text} />

            {materialType === MaterialType.FIND_RESOURCES && generatedContent.sources && generatedContent.sources.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-300/70">
                <h3 className="text-lg font-semibold text-sky-700 mb-3">Sources:</h3>
                <ul className="list-disc pl-5 space-y-2">
                  {generatedContent.sources.map((source, index) => (
                    <li key={index} className="text-sm text-slate-600">
                      <a 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sky-600 hover:text-sky-800 hover:underline break-all"
                        aria-label={`Source: ${source.title || source.uri} (opens in new tab)`}
                      >
                        {source.title || source.uri}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>
      <footer className="text-center mt-16 py-8 border-t border-slate-300/50">
        <p className="text-sm text-slate-700 font-medium">Powered by Gemini API</p>
      </footer>
    </div>
  );
};

export default App;
