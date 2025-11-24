import React from 'react';
import type { ComplianceReport as ComplianceReportType, ComplianceSeverity } from '../types';
// FIX: Imported missing InfoIcon component.
import { ShieldCheckIcon, WarningIcon, CheckCircleIcon, InfoIcon, LightbulbIcon, ThumbUpIcon } from './Icons';

interface ComplianceReportProps {
    report: ComplianceReportType;
}

const statusConfig: Record<ComplianceReportType['overallStatus'], { text: string; icon: React.ReactNode; color: string }> = {
    success: {
        text: 'Plan is Compliant',
        icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
        color: 'text-green-700',
    },
    warnings: {
        text: 'Compliant with Warnings',
        icon: <WarningIcon severity="warning"/>,
        color: 'text-amber-700',
    },
    errors: {
        text: 'Compliance Errors Found',
        icon: <WarningIcon severity="error"/>,
        color: 'text-red-700',
    },
};

// FIX: Wrapped icon components in an object `{ icon: ... }` to match the type definition.
const issueSeverityConfig: Record<ComplianceSeverity, { icon: React.ReactNode }> = {
    info: { icon: <InfoIcon className="w-5 h-5 text-blue-500" /> },
    warning: { icon: <WarningIcon severity="warning"/> },
    error: { icon: <WarningIcon severity="error" /> },
};

export const ComplianceReport: React.FC<ComplianceReportProps> = ({ report }) => {
    const config = statusConfig[report.overallStatus];

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
                <ShieldCheckIcon className="w-6 h-6 text-indigo-500" />
                <h3 className="text-xl font-semibold text-gray-800">AI Compliance Report</h3>
            </div>

            <div className={`flex items-center gap-2 p-3 rounded-md mb-4 ${
                report.overallStatus === 'success' ? 'bg-green-50' :
                report.overallStatus === 'warnings' ? 'bg-amber-50' : 'bg-red-50'
            }`}>
                {config.icon}
                <p className={`font-bold ${config.color}`}>{config.text}</p>
            </div>
            
            <div className="space-y-6">
                <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Executive Summary</h4>
                    <p className="text-sm text-gray-600">{report.summary}</p>
                </div>
                
                {report.positiveFindings.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                             <ThumbUpIcon />
                             <h4 className="font-semibold text-gray-700">Strengths</h4>
                        </div>
                        <ul className="space-y-1 pl-4">
                            {report.positiveFindings.map((finding, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                                    <CheckCircleIcon className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{finding}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {report.issues.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <WarningIcon severity={report.overallStatus === 'errors' ? 'error' : 'warning'}/>
                            <h4 className="font-semibold text-gray-700">Issues & Recommendations</h4>
                        </div>
                        <ul className="space-y-3">
                            {report.issues.map((issue, index) => (
                                <li key={index} className="p-3 bg-gray-50 rounded-md border border-gray-200">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {issueSeverityConfig[issue.severity].icon}
                                        </div>
                                        <p className="text-sm text-gray-800 font-medium">{issue.message}</p>
                                    </div>
                                    {issue.recommendation && (
                                        <div className="mt-2 pl-8 flex items-start gap-3 border-t border-gray-200 pt-2">
                                            <LightbulbIcon />
                                            <p className="text-sm text-gray-600"><span className="font-semibold">Recommendation:</span> {issue.recommendation}</p>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};