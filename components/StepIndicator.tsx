import React from 'react';
import { WorkflowStep } from '../types';
import { Camera, Shirt, User, CheckCircle } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: WorkflowStep;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { id: WorkflowStep.POSE_SELECTION, label: 'Поза', icon: User },
    { id: WorkflowStep.CLOTHING_EDIT, label: 'Одежда', icon: Shirt },
    { id: WorkflowStep.FINAL_GENERATION, label: 'Студия', icon: Camera },
    { id: WorkflowStep.RESULT, label: 'Финал', icon: CheckCircle },
  ];

  return (
    <div className="w-full py-6 px-4 bg-slate-900 border-b border-slate-800">
      <div className="max-w-4xl mx-auto flex justify-between items-center relative">
        {/* Progress Line Background */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 -z-0"></div>
        {/* Progress Line Active */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-500 -z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep >= step.id;
          const isCurrent = currentStep === step.id;

          return (
            <div key={step.id} className="flex flex-col items-center z-10">
              <div 
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${isActive 
                    ? 'bg-indigo-600 border-indigo-600 text-white' 
                    : 'bg-slate-900 border-slate-600 text-slate-500'}
                  ${isCurrent ? 'ring-4 ring-indigo-500/20 scale-110' : ''}
                `}
              >
                <Icon size={18} />
              </div>
              <span className={`mt-2 text-xs font-medium transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-600'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
