
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { Modal } from './components/Modal';
import { SettingsModal } from './components/SettingsModal';
import { DesignType, Platform, Template, AiSettings, DesignState, PaletteItem } from './types';
import { generateImage, editImage, generateSvg, generateColorPalette } from './services/geminiService';

const DEFAULT_SETTINGS: AiSettings = {
  imageModel: 'gemini-2.5-flash-image',
  editModel: 'gemini-2.5-flash-image',
  textModel: 'gemini-3-flash-preview',
  temperature: 0.4,
  aspectRatio: '16:9',
};

const getInitialSettings = (): AiSettings => {
  try {
    const savedSettings = localStorage.getItem('aiDesignStudioSettings');
    if (savedSettings) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
    }
  } catch (error) {
    console.error("Could not parse settings from localStorage", error);
  }
  return DEFAULT_SETTINGS;
};

const MAX_HISTORY = 20;

const App: React.FC = () => {
  const [designType, setDesignType] = useState<DesignType>('ui');
  const [platform, setPlatform] = useState<Platform>('web');
  const [prompt, setPrompt] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [sourceImage, setSourceImage] = useState<{data: string, mimeType: string} | null>(null);
  const [colorPalette, setColorPalette] = useState<PaletteItem[] | null>(null);

  const [history, setHistory] = useState<DesignState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [aiSettings, setAiSettings] = useState<AiSettings>(getInitialSettings);

  const currentHistoryItem = useMemo(() => history[historyIndex] || null, [history, historyIndex]);

  const addToHistory = useCallback((state: Partial<DesignState>) => {
    const newState: DesignState = {
      image: state.image || activeImage,
      sourceImage: state.sourceImage !== undefined ? state.sourceImage : sourceImage,
      prompt: state.prompt ?? prompt,
      editPrompt: state.editPrompt ?? editPrompt,
      designType: state.designType || designType,
      platform: state.platform || platform,
      timestamp: Date.now(),
      colorPalette: state.colorPalette !== undefined ? state.colorPalette : colorPalette,
    };

    setHistory(prev => {
      const newHistory = [...prev.slice(0, historyIndex + 1), newState];
      if (newHistory.length > MAX_HISTORY) return newHistory.slice(1);
      return newHistory;
    });
    setHistoryIndex(prev => {
      const newIndex = prev + 1;
      return newIndex >= MAX_HISTORY ? MAX_HISTORY - 1 : newIndex;
    });
  }, [activeImage, sourceImage, prompt, editPrompt, designType, platform, colorPalette, historyIndex]);

  useEffect(() => {
    if (currentHistoryItem) {
      setActiveImage(currentHistoryItem.image);
      setSourceImage(currentHistoryItem.sourceImage);
      setPrompt(currentHistoryItem.prompt);
      setEditPrompt(currentHistoryItem.editPrompt);
      setDesignType(currentHistoryItem.designType);
      setPlatform(currentHistoryItem.platform);
      setColorPalette(currentHistoryItem.colorPalette);
    }
  }, [currentHistoryItem]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) setHistoryIndex(prev => prev - 1);
  }, [historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) setHistoryIndex(prev => prev + 1);
  }, [historyIndex, history.length]);

  const handleNewDesign = useCallback(() => {
    // Resetting main state
    setActiveImage(null);
    setSourceImage(null);
    setPrompt('');
    setEditPrompt('');
    setColorPalette(null);
    setDesignType('ui');
    setPlatform('web');
    setError(null);
    
    // Push a "clean slate" to history so users can undo/redo back to this starting point
    addToHistory({
      image: null,
      sourceImage: null,
      prompt: '',
      editPrompt: '',
      designType: 'ui',
      platform: 'web',
      colorPalette: null
    });
  }, [addToHistory]);

  const handleSaveSettings = (newSettings: AiSettings) => {
    setAiSettings(newSettings);
    try {
      localStorage.setItem('aiDesignStudioSettings', JSON.stringify(newSettings));
    } catch (error) {
      console.error("Could not save settings to localStorage", error);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    const mimeType = template.image?.startsWith('data:image/svg+xml') ? 'image/svg+xml' : 'image/png';
    const sImage = template.image ? { data: template.image.split(',')[1], mimeType } : null;
    
    addToHistory({
      prompt: template.prompt,
      image: template.image || null,
      sourceImage: sImage,
      designType: template.type
    });
  };

  const handleImageUpload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const [header, data] = result.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
        addToHistory({
          image: result,
          sourceImage: { data, mimeType }
        });
      };
    } catch (e) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiError = useCallback((e: unknown, genericMessage: string) => {
    let errorMessage = genericMessage;
    if (e instanceof Error && (e.message.includes('429') || e.message.includes('quota'))) {
      errorMessage = 'You have exceeded your API quota. Please try again later.';
    }
    setError(errorMessage);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!prompt) {
      setError('Please enter a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      let resultImage: string;
      const palettePromise = generateColorPalette(prompt, aiSettings);
      
      let imagePromise: Promise<string>;
      if (designType === 'svg' || designType === 'logo') {
        imagePromise = generateSvg(prompt, designType, aiSettings).then(svg => `data:image/svg+xml;base64,${btoa(svg)}`);
      } else {
        let fullPrompt = prompt;
        if (designType === 'wireframe') {
          fullPrompt = `High-fidelity wireframe for a ${platform} interface. ${prompt}`;
        } else if (designType === 'ui') {
           fullPrompt = `Modern UI/UX design for a digital product. ${prompt}`;
        }
        imagePromise = generateImage(fullPrompt, aiSettings).then(base64 => `data:image/png;base64,${base64}`);
      }
      
      const [finalImage, finalPalette] = await Promise.all([imagePromise, palettePromise]);
      
      addToHistory({
        image: finalImage,
        sourceImage: { data: finalImage.split(',')[1], mimeType: finalImage.startsWith('data:image/svg+xml') ? 'image/svg+xml' : 'image/png' },
        editPrompt: '',
        colorPalette: finalPalette
      });

    } catch (e) {
      handleApiError(e, 'An error occurred while generating the design. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, designType, platform, handleApiError, aiSettings, addToHistory]);

  const handleEdit = useCallback(async () => {
    if (!sourceImage || !editPrompt) {
      setError('Please provide an image and an edit instruction.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const base64Image = await editImage(sourceImage.data, sourceImage.mimeType, editPrompt, aiSettings);
      const resultImage = `data:image/png;base64,${base64Image}`;
      const finalPalette = await generateColorPalette(editPrompt, aiSettings);
      
      addToHistory({
        image: resultImage,
        sourceImage: { data: base64Image, mimeType: 'image/png' },
        editPrompt: editPrompt,
        colorPalette: finalPalette
      });
    } catch (e) {
      handleApiError(e, 'An error occurred while editing the image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [sourceImage, editPrompt, handleApiError, aiSettings, addToHistory]);

  const handleDownload = () => {
    if (!activeImage) return;
    const link = document.createElement('a');
    const fileExtension = designType === 'svg' || designType === 'logo' ? 'svg' : 'png';
    link.download = `ai-design-${Date.now()}.${fileExtension}`;
    link.href = activeImage;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  

  return (
    <div className="flex flex-col h-screen font-sans bg-slate-900 text-slate-100">
      <Header 
        onShare={() => setIsShareModalOpen(true)} 
        isShareable={!!activeImage}
        onSettingsClick={() => setIsSettingsModalOpen(true)}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          designType={designType}
          setDesignType={setDesignType}
          platform={platform}
          setPlatform={setPlatform}
          prompt={prompt}
          setPrompt={setPrompt}
          editPrompt={editPrompt}
          setEditPrompt={setEditPrompt}
          onGenerate={handleGenerate}
          onEdit={handleEdit}
          onTemplateSelect={handleTemplateSelect}
          onImageUpload={handleImageUpload}
          onNewDesign={handleNewDesign}
          isEditing={!!sourceImage}
          isLoading={isLoading}
          history={history}
          historyIndex={historyIndex}
          onHistorySelect={setHistoryIndex}
          colorPalette={colorPalette}
        />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-slate-800/50">
          <Canvas 
            image={activeImage} 
            isLoading={isLoading} 
            error={error} 
            onDownload={handleDownload}
          />
        </main>
      </div>
      {isShareModalOpen && (
        <Modal 
          image={activeImage}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
      {isSettingsModalOpen && (
        <SettingsModal
          settings={aiSettings}
          onSave={handleSaveSettings}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
