import React from 'react';
import { CheckCircleIcon } from './Icons';

interface StatusTimelineProps {
  steps: string[];
  currentStatus: string;
}

const StatusTimeline: React.FC<StatusTimelineProps> = ({ steps, currentStatus }) => {
    const currentIndex = steps.indexOf(currentStatus);

    return (
        <div className="flex items-center justify-between w-full text-xs sm:text-sm">
            {steps.map((step, index) => {
                const isCompleted = index < currentIndex;
                const isCurrent = index === currentIndex;
                const isUpcoming = index > currentIndex;

                const nodeColor = isCompleted || isCurrent ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600';
                const textColor = isUpcoming ? 'text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200';
                const lineColor = isCompleted ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600';
                
                return (
                    <React.Fragment key={step}>
                        <div className="flex flex-col items-center text-center w-20">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${nodeColor} text-white transition-colors duration-500`}>
                               {isCompleted ? <CheckCircleIcon className="w-6 h-6" /> : <span className="font-bold">{index + 1}</span>}
                            </div>
                            <p className={`mt-2 font-semibold ${textColor} transition-colors duration-500`}>{step}</p>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`flex-1 h-1 mx-2 ${lineColor} transition-colors duration-500`}></div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default StatusTimeline;
