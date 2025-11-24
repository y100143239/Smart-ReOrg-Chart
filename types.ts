export interface Candidate {
    id: string;
    name: string;
    email: string;
    role: string;
    skills: Skill[];
    experience: number; // in years
    avatarUrl: string;
    education: string;
    achievements: string[];
    currentTeam: string;
    location: string;
    timeZone: string;
}

export interface Skill {
    name: string;
    proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface Comment {
    id: string;
    authorId: string;
    authorName: string;
    text: string;
    timestamp: string;
}

export type ComplianceSeverity = 'info' | 'warning' | 'error';

export interface ComplianceIssue {
    teamId: string;
    roleId: string;
    severity: ComplianceSeverity;
    message: string;
    recommendation?: string;
}

export interface ComplianceReport {
    overallStatus: 'success' | 'warnings' | 'errors';
    summary: string;
    positiveFindings: string[];
    issues: ComplianceIssue[];
}

export interface TeamSlotData {
    title: string;
    candidate: Candidate | null;
    comments: Comment[];
    complianceIssue?: ComplianceIssue;
    aiSuggestionReason?: string;
}

export interface TeamStructure {
    [roleId: string]: TeamSlotData;
}

export interface TeamData {
    title: string;
    roles: TeamStructure;
}

export interface OrgStructure {
    [teamId: string]: TeamData;
}

export type ReorgPurpose = 'organize_new' | 'expand_existing' | 'restructure_existing' | 'restructure_multiple';

export interface QuestionnaireData {
    userPosition: string;
    reorgPurpose: ReorgPurpose;
    targetTeamId?: string;
    teamPurpose: string;
    neededSkills: string;
    neededExperience: string;
}

export interface AISuggestion {
    role: string;
    candidateId: string;
    reason: string;
}

export interface AITeamSuggestion {
    teamTitle: string;
    roles: AISuggestion[];
}

export interface AIResponse {
    overallRationale: string;
    suggestions: AITeamSuggestion[];
}

export type AppPhase = 'planning' | 'approval' | 'execution';

export type ApprovalStepState = 'pending' | 'approved' | 'rejected';

export interface ApprovalDecision {
    state: ApprovalStepState;
    remarks?: string;
    attachmentName?: string;
}

export interface ApprovalChain {
    hr: ApprovalDecision;
    deptHead: ApprovalDecision;
}

export type ApprovalStatus = {
    [roleId: string]: ApprovalChain;
};

export interface ExistingTeam {
    title: string;
    members: string[]; // array of candidate IDs
}

export interface ExistingTeams {
    [teamId: string]: ExistingTeam;
}

export type UserRole = 'projectManager' | 'hrPartner' | 'deptHead';

export interface User {
    id: string;
    name: string;
    role: UserRole;
    location: string;
    timeZone: string;
}

export interface ImpactAnalysis {
    benefits: string[];
    risks: string[];
}

export type ProgressStepStatus = 'pending' | 'in-progress' | 'complete';

export interface ProgressStep {
    id: string;
    label: string;
    status: ProgressStepStatus;
    isSubStep?: boolean;
}

export interface CommunicationDraft {
    subject: string;
    body: string;
}

export interface CommunicationDrafts {
    newTeam: CommunicationDraft;
    vacatedManager: CommunicationDraft;
    companyAnnouncement: CommunicationDraft;
}