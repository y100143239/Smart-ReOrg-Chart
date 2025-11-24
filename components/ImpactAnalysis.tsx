import React from 'react';
import type { ImpactAnalysis as ImpactAnalysisType } from '../types';
import { AnalyticsIcon, ThumbUpIcon, WarningIcon } from './Icons';

interface ImpactAnalysisProps {
    analysis: ImpactAnalysisType;
}

export const ImpactAnalysis: React.FC<ImpactAnalysisProps> = ({ analysis }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
                <AnalyticsIcon />
                <h3 className="text-xl font-semibold text-gray-800">AI-Powered Impact Analysis</h3>
            </div>
            
            <div className="space-y-4">
                {/* Benefits Section */}
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <ThumbUpIcon />
                        <h4 className="text-lg font-semibold text-green-700">Potential Benefits</h4>
                    </div>
                    <ul className="space-y-2 list-inside pl-2">
                        {analysis.benefits.map((benefit, index) => (
                            <li key={`benefit-${index}`} className="flex items-start text-gray-600">
                                <span className="text-green-500 mr-2 mt-1">&#10003;</span>
                                <span>{benefit}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                
                {/* Risks Section */}
                <div>
                    <div className="flex items-center space-x-2 mb-2">
                        <WarningIcon />
                        <h4 className="text-lg font-semibold text-red-700">Possible Risks</h4>
                    </div>
                    <ul className="space-y-2 list-inside pl-2">
                         {analysis.risks.map((risk, index) => (
                            <li key={`risk-${index}`} className="flex items-start text-gray-600">
                                <span className="text-red-500 mr-2 mt-1 font-bold">!</span>
                                <span>{risk}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};