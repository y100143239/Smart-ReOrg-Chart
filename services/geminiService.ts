import { GoogleGenAI, Type } from "@google/genai";
import type { AIResponse, Candidate, QuestionnaireData, TeamStructure, ImpactAnalysis, CommunicationDrafts, ComplianceReport, ExistingTeams, OrgStructure } from "../types";

// FIX: Initialize GoogleGenAI directly with the environment variable and remove the unnecessary check, per API guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const suggestionSchema = {
    type: Type.OBJECT,
    properties: {
        overallRationale: {
            type: Type.STRING,
            description: "A brief, high-level summary explaining the overall strategy for the new organizational structure."
        },
        suggestions: {
            type: Type.ARRAY,
            description: "A list of suggested teams for the new organizational structure.",
            items: {
                type: Type.OBJECT,
                properties: {
                    teamTitle: { 
                        type: Type.STRING,
                        description: "The title of the new team, e.g., 'Core Product Pod' or 'Growth Marketing'."
                    },
                    roles: {
                        type: Type.ARRAY,
                        description: "A list of suggested candidates for specific roles in this team.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                role: { type: Type.STRING, description: "The role being filled, e.g., 'Team Lead'." },
                                candidateId: { type: Type.STRING, description: "The unique ID of the suggested candidate." },
                                reason: { type: Type.STRING, description: "A detailed, multi-sentence explanation of why this candidate is an excellent fit, referencing their specific skills, experience, and achievements in relation to the team's goals." }
                            },
                            required: ["role", "candidateId", "reason"],
                        }
                    }
                },
                 required: ["teamTitle", "roles"],
            }
        }
    },
    required: ["overallRationale", "suggestions"],
};

const impactAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        benefits: {
            type: Type.ARRAY,
            description: "A list of potential positive outcomes and benefits from this reorganization. Each item should be a concise, insightful point.",
            items: { type: Type.STRING }
        },
        risks: {
            type: Type.ARRAY,
            description: "A list of potential risks, challenges, or negative consequences. Each item should be a concise, insightful point.",
            items: { type: Type.STRING }
        }
    },
    required: ["benefits", "risks"],
};

const communicationDraftsSchema = {
    type: Type.OBJECT,
    properties: {
        newTeam: {
            type: Type.OBJECT,
            properties: { subject: { type: Type.STRING }, body: { type: Type.STRING } },
            required: ["subject", "body"]
        },
        vacatedManager: {
            type: Type.OBJECT,
            properties: { subject: { type: Type.STRING }, body: { type: Type.STRING } },
            required: ["subject", "body"]
        },
        companyAnnouncement: {
            type: Type.OBJECT,
            properties: { subject: { type: Type.STRING }, body: { type: Type.STRING } },
            required: ["subject", "body"]
        }
    },
    required: ["newTeam", "vacatedManager", "companyAnnouncement"],
};

const complianceReportSchema = {
    type: Type.OBJECT,
    properties: {
        overallStatus: {
            type: Type.STRING,
            enum: ['success', 'warnings', 'errors'],
            description: "A summary status of the compliance check."
        },
        summary: {
            type: Type.STRING,
            description: "A high-level executive summary of the compliance check findings, in 1-2 sentences."
        },
        positiveFindings: {
            type: Type.ARRAY,
            description: "A list of positive points where the plan adheres well to guidelines or shows strategic strengths.",
            items: { type: Type.STRING }
        },
        issues: {
            type: Type.ARRAY,
            description: "A list of all identified compliance issues.",
            items: {
                type: Type.OBJECT,
                properties: {
                    teamId: {
                         type: Type.STRING,
                         description: "The ID of the team this issue pertains to. Use 'general' if it applies to the whole org."
                    },
                    roleId: {
                        type: Type.STRING,
                        description: "The ID of the role this issue pertains to. Use 'general' for team-level issues."
                    },
                    severity: {
                        type: Type.STRING,
                        enum: ['info', 'warning', 'error'],
                        description: "The severity of the issue."
                    },
                    message: {
                        type: Type.STRING,
                        description: "A clear, concise description of the compliance issue."
                    },
                    recommendation: {
                        type: Type.STRING,
                        description: "A concrete, actionable recommendation to resolve the identified issue."
                    }
                },
                required: ["teamId", "roleId", "severity", "message"],
            }
        }
    },
    required: ["overallStatus", "summary", "positiveFindings", "issues"],
};


const generateSuggestionPrompt = (data: QuestionnaireData, candidates: Candidate[], currentOrg: OrgStructure, existingTeams: ExistingTeams): string => {
    const candidateList = candidates.map(c => 
        `- ID: ${c.id}, Name: ${c.name}, Current Role: ${c.role}, Experience: ${c.experience} years, Skills: [${c.skills.map(s => `${s.name} (${s.proficiency})`).join(', ')}], Achievements: [${c.achievements.join(', ')}], Location: ${c.location} (TimeZone: ${c.timeZone})`
    ).join('\n');

    const commonContext = `
        **Reorganization Context:**
        - My Position: ${data.userPosition}
        - Overall Goal: ${data.teamPurpose}
        - Required Skills: ${data.neededSkills}
        - Desired Experience Level: ${data.neededExperience}

        **Available Candidates:**
        ${candidateList}

        Your response must be a JSON object that strictly follows the provided schema. For each suggestion, provide a detailed, multi-sentence reason for your choice. This reason must specifically connect the candidate's skills (and their proficiency), experience level, and key achievements to the team's stated purpose and required skills. Be insightful and go beyond a simple skill match.
    `;

    const getOrgText = (org: OrgStructure, title: string) => {
        const teams = Object.values(org);
        if (teams.length === 0) return `The ${title} is currently empty.`;
        return `
            **${title}:**
            ${teams.map(team => `
                - Team: "${team.title}"
                - Members: ${Object.values(team.roles).map(r => r.candidate?.name || '(Empty)').join(', ')}
            `).join('')}
        `;
    };

    switch (data.reorgPurpose) {
        case 'restructure_multiple':
            return `
                As an expert Chief of Staff, your task is to design a new, high-level organizational structure.
                
                **Reorganization Goal:** Restructure multiple teams or entire departments to better align with the company's strategic goals.

                ${commonContext}

                **Your Task:**
                Based on the context, propose a new organizational structure composed of MULTIPLE teams. Define the purpose (title) of each team and assign the best candidates from the available pool to fill the necessary roles within each team. The final output should be a complete organizational design. You have the flexibility to define the number of teams and the roles within them.
            `;
        case 'expand_existing': {
            const teamId = data.targetTeamId || Object.keys(currentOrg)[0];
            const teamName = currentOrg[teamId]?.title || 'the selected team';
            return `
                As an expert HR strategist, your task is to suggest an expansion for an existing team.
                
                **Reorganization Goal:** Expand the "${teamName}".
                
                ${getOrgText(currentOrg, 'Current Team Composition')}
                ${commonContext}

                **Your Task:**
                Suggest 2-3 NEW roles and assign the best candidates to fill them to complement the existing team. Format your response as a single team suggestion with just the new roles.
            `;
        }
        case 'restructure_existing': {
             const teamId = data.targetTeamId || Object.keys(currentOrg)[0];
             const teamName = currentOrg[teamId]?.title || 'the selected team';
             return `
                As an expert HR strategist, your task is to restructure an existing team.

                **Reorganization Goal:** Restructure the "${teamName}".

                ${getOrgText(currentOrg, 'Current Team Composition')}
                ${commonContext}

                **Your Task:**
                Propose a new, ideal team structure for this single team. You can reassign current members or replace them with better candidates from the pool.
            `;
        }
        case 'organize_new':
        default:
             return `
                As an expert HR strategist, your task is to design a new, high-performing team.
                
                **Reorganization Goal:** Create a new team from scratch.

                ${commonContext}

                **Your Task:**
                Propose an optimal team structure with a clear title and assign the best candidates for the necessary roles (e.g., Team Lead, Product Manager, Engineers, etc.).
            `;
    }
};

const generateImpactPrompt = (org: OrgStructure, candidates: Candidate[]): string => {
    // This prompt can be simplified to handle the whole org structure as a block of text
    const newOrgComposition = Object.values(org).map(team => {
        const members = Object.values(team.roles).map(slot => slot.candidate?.name || '(Empty)').join(', ');
        return `- Team "${team.title}": ${members}`;
    }).join('\n');

    return `
        As a senior organizational strategist, analyze the proposed reorganization and identify its potential benefits and risks.

        **Proposed New Organization:**
        ${newOrgComposition}

        **Your Task:**
        Your response must be a JSON object.
        1.  **Benefits:** Identify 3-4 key strategic advantages.
        2.  **Risks:** Identify 3-4 significant risks (e.g., impact on vacated teams, knowledge gaps, new team friction).
    `;
}

const generateCommunicationPrompt = (org: OrgStructure, reorgPurpose: string): string => {
    // Simplified for the multi-team context
    const newOrgSummary = Object.values(org).map(team => 
        `- Team "${team.title}" led by ${Object.values(team.roles).find(r => r.title.toLowerCase().includes('lead'))?.candidate?.name || 'N/A'}`
    ).join('\n');
    
    return `
        As a senior corporate communications specialist, draft clear, professional emails for a company reorganization. The goal was: "${reorgPurpose}".

        A new organization has been formed:
        ${newOrgSummary}

        **Your Task:**
        Draft three distinct communication emails in JSON format.
        1.  **New Team Welcome:** A general email to all members of the new organization.
        2.  **Vacated Manager Notification:** A template for managers of employees who have moved.
        3.  **Company-Wide Announcement:** An announcement introducing the new structure and its purpose.
    `;
};

const generateCompliancePrompt = (org: OrgStructure): string => {
    const orgComposition = Object.entries(org).map(([teamId, teamData]) => {
        const roles = Object.entries(teamData.roles).map(([roleId, slot]) => {
            // FIX: Add more candidate details to the prompt for more accurate compliance checks.
            const candidateInfo = slot.candidate
                ? `Filled by: ${slot.candidate.name} (Experience: ${slot.candidate.experience} years, Original Team: ${slot.candidate.currentTeam}, Location: ${slot.candidate.location})`
                : 'EMPTY';
             return `  - Role ID: ${roleId}, Title: ${slot.title}, Status: ${candidateInfo}`;
        }).join('\n');
        return `- Team ID: ${teamId}, Title: "${teamData.title}"\n${roles}`;
    }).join('\n\n');

    return `
        As an AI HR Compliance Officer, analyze the proposed multi-team organizational structure against a set of rules.

        **Proposed Organization:**
        ${orgComposition}

        **Compliance Rules:**
        1.  **Critical Role Coverage (Error):** EACH team MUST have a role with 'Lead' in its title, and it MUST be filled.
        2.  **Seniority Mix (Warning):** For each team, the designated Lead should have 7+ years of experience.
        3.  **Team Depletion (Warning):** No more than TWO members in the entire new organization should be sourced from the same original team (e.g., 'Core Platform Team').
        4.  **Team Completeness (Info):** All roles in the new structure should be filled.
        5.  **Time Zone Spread (Info):** Note as an informational issue if a single team has members spread across more than 3 distinct time zones.

        **Your Task:**
        Generate a detailed compliance report as a JSON object that strictly follows the provided schema. For EACH issue, you MUST specify the \`teamId\` and \`roleId\` it pertains to. For org-wide issues like Team Depletion, use 'general' for both \`teamId\` and \`roleId\`. Provide a summary, list strengths, and detail every issue with an actionable recommendation.
    `;
};


const callGemini = async <T>(prompt: string, schema: any): Promise<T> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.6,
            },
        });

        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText);
        
        return parsedResponse as T;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get a valid response from the AI. Please check the console for more details.");
    }
}


export const getSmartSuggestions = async (data: QuestionnaireData, candidates: Candidate[], currentOrg: OrgStructure, existingTeams: ExistingTeams): Promise<AIResponse> => {
    const prompt = generateSuggestionPrompt(data, candidates, currentOrg, existingTeams);
    const result = await callGemini<AIResponse>(prompt, suggestionSchema);
    if (!result.overallRationale || !Array.isArray(result.suggestions)) {
        throw new Error("Invalid AI suggestion response format.");
    }
    return result;
};

export const getImpactAnalysis = async (org: OrgStructure, candidates: Candidate[]): Promise<ImpactAnalysis> => {
    const prompt = generateImpactPrompt(org, candidates);
    return await callGemini<ImpactAnalysis>(prompt, impactAnalysisSchema);
}

export const getCommunicationDrafts = async (org: OrgStructure, reorgPurpose: string): Promise<CommunicationDrafts> => {
    const prompt = generateCommunicationPrompt(org, reorgPurpose);
    return await callGemini<CommunicationDrafts>(prompt, communicationDraftsSchema);
};

export const getComplianceReport = async (org: OrgStructure): Promise<ComplianceReport> => {
    const prompt = generateCompliancePrompt(org);
    const result = await callGemini<ComplianceReport>(prompt, complianceReportSchema);
    if (!result.overallStatus || !Array.isArray(result.issues)) {
        throw new Error("Invalid AI compliance report response format.");
    }
    return result;
};