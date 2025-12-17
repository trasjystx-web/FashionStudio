import React, { useState, useRef } from 'react';
import { 
  WorkflowStep, 
  Pose, 
  CameraAngle, 
  ImageResolution, 
  AspectRatio 
} from './types';
import { POSES, DEFAULT_SETTINGS } from './constants';
import StepIndicator from './components/StepIndicator';
import ChatAssistant from './components/ChatAssistant';
import { generatePose, generateFashionLook } from './services/geminiService';
import { 
  Upload, 
  Camera, 
  Download, 
  RefreshCcw, 
  Edit3, 
  Trash2, 
  Plus,
  Loader2,
  ChevronRight,
  ChevronLeft,
  X
} from 'lucide-react';

const App: React.FC = () => {
  // State
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(WorkflowStep.POSE_SELECTION);
  
  // Phase 1: Pose
  const [selectedPose, setSelectedPose] = useState<Pose | null>(null);
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [generatedPoseImage, setGeneratedPoseImage] = useState<string | null>(null);
  const [isGeneratingPose, setIsGeneratingPose] = useState(false);

  // Phase 2: Clothing
  const [clothingImages, setClothingImages] = useState<string[]>([]);
  const [isUploadingClothing, setIsUploadingClothing] = useState(false);

  // Phase 3: Settings & Final
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isGeneratingFinal, setIsGeneratingFinal] = useState(false);
  const [finalResult, setFinalResult] = useState<string | null>(null);

  // Error handling
  const [error, setError] = useState<string | null>(null);

  // Refs for file inputs
  const modelInputRef = useRef<HTMLInputElement>(null);
  const clothingInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>, 
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClothingUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setIsUploadingClothing(true);
      const newImages: string[] = [];
      let loadedCount = 0;
      
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          loadedCount++;
          if (loadedCount === files.length) {
            setClothingImages(prev => [...prev, ...newImages].slice(0, 8)); // Limit to 8
            setIsUploadingClothing(false);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const executePoseGeneration = async () => {
    if (!selectedPose || !modelImage) return;
    setIsGeneratingPose(true);
    setError(null);
    try {
      const result = await generatePose(modelImage, selectedPose.description);
      setGeneratedPoseImage(result);
      setCurrentStep(WorkflowStep.CLOTHING_EDIT);
    } catch (err) {
      setError("Не удалось сгенерировать позу. Пожалуйста, проверьте API ключ или попробуйте другое фото.");
    } finally {
      setIsGeneratingPose(false);
    }
  };

  const executeFinalGeneration = async () => {
    if (!generatedPoseImage) return;
    setIsGeneratingFinal(true);
    setError(null);
    try {
      const result = await generateFashionLook(generatedPoseImage, clothingImages, settings);
      setFinalResult(result);
      setCurrentStep(WorkflowStep.RESULT);
    } catch (err) {
      setError("Не удалось создать финальное изображение. Попробуйте уменьшить разрешение или изменить настройки.");
    } finally {
      setIsGeneratingFinal(false);
    }
  };

  const startNewSession = () => {
    if (window.confirm("Начать новую сессию? Текущий прогресс будет потерян.")) {
      setCurrentStep(WorkflowStep.POSE_SELECTION);
      setSelectedPose(null);
      setModelImage(null);
      setGeneratedPoseImage(null);
      setClothingImages([]);
      setFinalResult(null);
      setError(null);
    }
  };

  const downloadImage = () => {
    if (finalResult) {
      const link = document.createElement('a');
      link.href = finalResult;
      link.download = `fashion-ai-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // --- Render Sections ---

  const renderPoseSelection = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Upload Section */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
        <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
          <Upload size={20} className="text-indigo-400" />
          1. Загрузите фото модели
        </h2>
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div 
            onClick={() => modelInputRef.current?.click()}
            className="w-full md:w-64 h-64 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-slate-700/50 transition-all group overflow-hidden relative"
          >
            {modelImage ? (
              <img src={modelImage} alt="Model" className="w-full h-full object-cover" />
            ) : (
              <>
                <UserPlaceholder />
                <span className="mt-4 text-slate-400 group-hover:text-white text-sm">Нажмите для загрузки</span>
              </>
            )}
            <input type="file" ref={modelInputRef} onChange={(e) => handleFileUpload(e, setModelImage)} className="hidden" accept="image/*" />
          </div>
          <div className="flex-1 text-slate-400 text-sm">
            <p>Для лучшего результата используйте фото в полный рост на нейтральном фоне.</p>
            <p className="mt-2 text-indigo-400">Gemini NanoBanana Pro сохранит черты лица модели.</p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-white">2. Выберите позу из каталога</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {POSES.map((pose) => (
            <div 
              key={pose.id}
              onClick={() => setSelectedPose(pose)}
              className={`
                relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all
                ${selectedPose?.id === pose.id ? 'border-indigo-500 ring-2 ring-indigo-500/50' : 'border-transparent hover:border-slate-600'}
              `}
            >
              <img src={pose.thumbnailUrl} alt={pose.name} className="w-full h-64 object-cover filter brightness-75 group-hover:brightness-100 transition-all" />
              <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white text-sm font-medium">{pose.name}</p>
              </div>
              {selectedPose?.id === pose.id && (
                <div className="absolute top-2 right-2 bg-indigo-600 rounded-full p-1">
                  <RefreshCcw size={14} className="text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={executePoseGeneration}
          disabled={!selectedPose || !modelImage || isGeneratingPose}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
        >
          {isGeneratingPose ? <Loader2 className="animate-spin" /> : <Camera size={20} />}
          {isGeneratingPose ? 'Генерация...' : 'Создать позу'}
        </button>
      </div>
    </div>
  );

  const renderClothingEdit = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left: Pose Preview */}
        <div className="lg:w-1/3 space-y-4">
          <h2 className="text-xl font-semibold text-white">Сгенерированная поза</h2>
          <div className="rounded-xl overflow-hidden border border-slate-700 bg-black/50 aspect-[3/4]">
             {generatedPoseImage && (
               <img src={generatedPoseImage} alt="Pose" className="w-full h-full object-contain" />
             )}
          </div>
          <button onClick={() => setCurrentStep(WorkflowStep.POSE_SELECTION)} className="text-slate-400 hover:text-white flex items-center gap-2 text-sm">
             <ChevronLeft size={16} /> Назад к выбору позы
          </button>
        </div>

        {/* Right: Clothing Upload */}
        <div className="flex-1 space-y-6">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <Edit3 size={20} className="text-indigo-400" />
                Загрузка одежды (4-8 фото)
              </h2>
              <span className="text-slate-400 text-sm">{clothingImages.length} / 8</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {clothingImages.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group border border-slate-600">
                  <img src={img} alt={`Clothing ${idx}`} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setClothingImages(prev => prev.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 bg-red-500/80 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              
              {clothingImages.length < 8 && (
                <button 
                  onClick={() => clothingInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-slate-600 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:text-white hover:border-indigo-500 hover:bg-slate-700/50 transition-all"
                >
                  <Plus size={24} />
                  <span className="text-xs mt-2">Добавить</span>
                </button>
              )}
            </div>
            <input 
              type="file" 
              multiple 
              ref={clothingInputRef} 
              onChange={handleClothingUpload} 
              className="hidden" 
              accept="image/*" 
            />
          </div>

          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-sm text-slate-400">
             <h3 className="text-white font-medium mb-2">Советы редактора Gemini 3 Pro:</h3>
             <ul className="list-disc pl-5 space-y-1">
               <li>Загружайте одежду на однотонном фоне (желательно белом).</li>
               <li>Добавьте фото текстуры ткани крупным планом для реалистичности.</li>
               <li>Вы можете использовать чат-ассистента справа для уточнения стиля.</li>
             </ul>
          </div>

          <div className="flex justify-end pt-4">
             <button
              onClick={() => setCurrentStep(WorkflowStep.FINAL_GENERATION)}
              disabled={clothingImages.length === 0}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all"
            >
              Далее к настройкам <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Settings Panel */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white mb-6">Настройки съемки</h2>

          {/* Camera Angle */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Положение камеры</label>
            <div className="grid grid-cols-1 gap-2">
              {Object.values(CameraAngle).map((angle) => (
                <button
                  key={angle}
                  onClick={() => setSettings({ ...settings, cameraAngle: angle })}
                  className={`px-4 py-3 rounded-lg text-left text-sm font-medium transition-all border ${
                    settings.cameraAngle === angle 
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {angle}
                </button>
              ))}
            </div>
          </div>

          {/* Resolution & Ratio */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
               <label className="text-sm font-medium text-slate-400">Разрешение (Pro)</label>
               <select 
                  value={settings.resolution}
                  onChange={(e) => setSettings({...settings, resolution: e.target.value as ImageResolution})}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 text-sm focus:border-indigo-500 focus:outline-none"
               >
                 {Object.values(ImageResolution).map(res => (
                   <option key={res} value={res}>{res}</option>
                 ))}
               </select>
            </div>
            <div className="space-y-2">
               <label className="text-sm font-medium text-slate-400">Формат</label>
               <select 
                  value={settings.aspectRatio}
                  onChange={(e) => setSettings({...settings, aspectRatio: e.target.value as AspectRatio})}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 text-sm focus:border-indigo-500 focus:outline-none"
               >
                 {Object.values(AspectRatio).map(ratio => (
                   <option key={ratio} value={ratio}>{ratio}</option>
                 ))}
               </select>
            </div>
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-400">Дополнительный стиль</label>
            <textarea
              value={settings.prompt}
              onChange={(e) => setSettings({...settings, prompt: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg p-3 text-sm focus:border-indigo-500 focus:outline-none h-24 resize-none"
              placeholder="Опишите освещение, атмосферу..."
            />
          </div>
        </div>

        {/* Preview Info */}
        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 h-fit">
          <h3 className="text-lg font-semibold text-white mb-4">Сводка фотосессии</h3>
          <ul className="space-y-4 text-sm">
            <li className="flex justify-between border-b border-slate-700 pb-2">
              <span className="text-slate-400">Модель:</span>
              <span className="text-white">Gemini 3 Pro Image</span>
            </li>
            <li className="flex justify-between border-b border-slate-700 pb-2">
              <span className="text-slate-400">Поза:</span>
              <span className="text-white text-right max-w-[50%] truncate">{selectedPose?.name}</span>
            </li>
            <li className="flex justify-between border-b border-slate-700 pb-2">
              <span className="text-slate-400">Одежда:</span>
              <span className="text-white">{clothingImages.length} предметов</span>
            </li>
             <li className="flex justify-between border-b border-slate-700 pb-2">
              <span className="text-slate-400">Камера:</span>
              <span className="text-white">{settings.cameraAngle}</span>
            </li>
             <li className="flex justify-between pb-2">
              <span className="text-slate-400">Вывод:</span>
              <span className="text-white">{settings.resolution}, {settings.aspectRatio}</span>
            </li>
          </ul>

          <div className="mt-8 flex flex-col gap-3">
             <button
              onClick={executeFinalGeneration}
              disabled={isGeneratingFinal}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-4 rounded-xl font-bold text-lg shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
            >
              {isGeneratingFinal ? <Loader2 className="animate-spin" /> : <Camera size={24} />}
              {isGeneratingFinal ? 'Создание шедевра...' : 'Сгенерировать'}
            </button>
            <button 
              onClick={() => setCurrentStep(WorkflowStep.CLOTHING_EDIT)}
              className="w-full text-slate-400 hover:text-white py-2"
            >
              Назад
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResult = () => (
    <div className="flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-500">
      <div className="relative group rounded-lg overflow-hidden shadow-2xl shadow-indigo-500/10 max-w-2xl w-full bg-slate-800">
         {finalResult ? (
           <img src={finalResult} alt="Final Result" className="w-full h-auto object-contain" />
         ) : (
           <div className="h-96 flex items-center justify-center text-red-400">Ошибка отображения</div>
         )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={downloadImage}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg"
        >
          <Download size={20} /> Сохранить
        </button>
        <button
          onClick={startNewSession}
          className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2"
        >
          <RefreshCcw size={20} /> Новая сессия
        </button>
      </div>
    </div>
  );

  const UserPlaceholder = () => (
     <svg className="w-12 h-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
     </svg>
  );

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Camera size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              FashionAI Studio
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-full border border-slate-700 text-xs font-medium text-slate-300">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Gemini 3 Pro Active
             </div>
          </div>
        </div>
      </header>

      {/* Progress */}
      <StepIndicator currentStep={currentStep} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl flex items-center gap-3">
             <span className="bg-red-500/20 p-1 rounded-full"><X size={16}/></span>
             {error}
          </div>
        )}

        {currentStep === WorkflowStep.POSE_SELECTION && renderPoseSelection()}
        {currentStep === WorkflowStep.CLOTHING_EDIT && renderClothingEdit()}
        {currentStep === WorkflowStep.FINAL_GENERATION && renderSettings()}
        {currentStep === WorkflowStep.RESULT && renderResult()}
      </main>

      <ChatAssistant />
    </div>
  );
};

export default App;