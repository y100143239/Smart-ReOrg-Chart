import type { Candidate, TeamStructure, ExistingTeams, User, ProgressStep, Skill } from './types';

const LOCATIONS = [
    { city: 'New York, USA', timeZone: 'America/New_York' },
    { city: 'San Francisco, USA', timeZone: 'America/Los_Angeles' },
    { city: 'London, UK', timeZone: 'Europe/London' },
    { city: 'Berlin, Germany', timeZone: 'Europe/Berlin' },
    { city: 'Tokyo, Japan', timeZone: 'Asia/Tokyo' },
    { city: 'Sydney, Australia', timeZone: 'Australia/Sydney' },
    { city: 'Singapore', timeZone: 'Asia/Singapore' },
    { city: 'Bengaluru, India', timeZone: 'Asia/Kolkata' },
    { city: 'São Paulo, Brazil', timeZone: 'America/Sao_Paulo' },
    { city: 'Toronto, Canada', timeZone: 'America/Toronto' },
];

export const USERS: User[] = [
    { id: 'u1', name: 'Alex Ray (Project Manager)', role: 'projectManager', location: 'New York, USA', timeZone: 'America/New_York' },
    { id: 'u2', name: 'Brenda Smith (HR Partner)', role: 'hrPartner', location: 'London, UK', timeZone: 'Europe/London' },
    { id: 'u3', name: 'Charles King (Dept. Head)', role: 'deptHead', location: 'San Francisco, USA', timeZone: 'America/Los_Angeles' },
];

export const DEFAULT_USER = USERS[0];

const generateCandidates = (): Candidate[] => {
    const firstNames = ["Liam", "Olivia", "Noah", "Emma", "Oliver", "Ava", "Elijah", "Charlotte", "William", "Sophia", "James", "Amelia", "Benjamin", "Isabella", "Lucas", "Mia", "Henry", "Evelyn", "Alexander", "Harper", "Michael", "Camila", "Daniel", "Gianna", "Leo", "Abigail", "Jack", "Luna", "Ryan", "Ella", "Jacob", "Elizabeth", "Asher", "Sofia", "Mateo", "Emily", "Levi", "Avery", "John", "Mila", "David", "Scarlett", "Joseph", "Eleanor", "Samuel", "Madison", "Matthew", "Layla", "Luke", "Penelope", "Andrew", "Aria", "Joshua", "Chloe", "Christopher", "Grace", "Gabriel", "Ellie", "Isaac", "Nora", "Owen", "Hazel", "Caleb", "Zoey", "Nathan", "Riley", "Theodore", "Victoria", "Wyatt", "Lily", "Carter", "Aurora", "Jayden", "Violet", "Julian", "Nova", "Christian", "Hannah", "Isaiah", "Emilia", "Eli", "Zoe", "Aaron", "Stella", "Landon", "Everly", "Jonathan", "Isla", "Jose", "Leah", "Adam", "Lillian", "Adrian", "Addison", "Thomas", "Lucy", "Robert", "Eliana", "Connor", "Ivy", "Nicholas", "Paisley", "Lincoln", "Elena", "Kevin", "Naomi"];
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores"];
    const roles = [
        { title: 'Software Engineer', skills: ['TypeScript', 'Node.js', 'Go', 'Python'], minExp: 2, maxExp: 6 },
        { title: 'Senior Software Engineer', skills: ['System Design', 'Microservices', 'AWS', 'Kubernetes'], minExp: 5, maxExp: 12 },
        { title: 'Principal Engineer', skills: ['Architecture', 'Scalability', 'Mentorship', 'Cloud Native'], minExp: 10, maxExp: 20 },
        { title: 'Product Manager', skills: ['Roadmapping', 'Agile', 'JIRA', 'User Research'], minExp: 3, maxExp: 10 },
        { title: 'Senior Product Manager', skills: ['Product Strategy', 'Market Analysis', 'A/B Testing'], minExp: 6, maxExp: 15 },
        { title: 'UI/UX Designer', skills: ['Figma', 'Sketch', 'Prototyping', 'Design Systems'], minExp: 2, maxExp: 7 },
        { title: 'Lead Designer', skills: ['User Research', 'Design Leadership', 'Interaction Design'], minExp: 7, maxExp: 15 },
        { title: 'Data Scientist', skills: ['Python', 'TensorFlow', 'SQL', 'Machine Learning'], minExp: 3, maxExp: 8 },
        { title: 'Senior Data Scientist', skills: ['NLP', 'Computer Vision', 'MLOps', 'Statistics'], minExp: 6, maxExp: 14 },
        { title: 'QA Engineer', skills: ['Cypress', 'Selenium', 'CI/CD', 'Test Planning'], minExp: 2, maxExp: 8 },
        { title: 'QA Lead', skills: ['Test Automation Strategy', 'Performance Testing', 'Jenkins'], minExp: 7, maxExp: 15 },
        { title: 'DevOps Engineer', skills: ['Docker', 'Terraform', 'Jenkins', 'Google Cloud'], minExp: 3, maxExp: 9 },
        { title: 'Frontend Developer', skills: ['React', 'Vue.js', 'CSS', 'JavaScript'], minExp: 1, maxExp: 6 },
        { title: 'Backend Developer', skills: ['Java', 'Spring Boot', 'PostgreSQL', 'REST APIs'], minExp: 1, maxExp: 6 },
        { title: 'Marketing Specialist', skills: ['SEO', 'Content Marketing', 'Google Analytics'], minExp: 2, maxExp: 7 },
        { title: 'Sales Representative', skills: ['Salesforce', 'Negotiation', 'CRM'], minExp: 1, maxExp: 8 },
    ];
    const educations = ['M.S. in Computer Science', 'MBA, Business School', 'Ph.D. in Machine Learning', 'B.F.A. in Graphic Design', 'B.S. in Software Engineering', 'Coding Bootcamp Certificate'];
    const candidates: Candidate[] = [];
    const usedNames = new Set<string>();

    for (let i = 1; i <= 100; i++) {
        let name;
        do {
            name = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
        } while (usedNames.has(name));
        usedNames.add(name);
        
        const email = `${name.toLowerCase().replace(/\s/g, '.')}@example.com`;

        const roleInfo = roles[Math.floor(Math.random() * roles.length)];
        const experience = roleInfo.minExp + Math.floor(Math.random() * (roleInfo.maxExp - roleInfo.minExp));

        const assignProficiency = (exp: number, isCoreSkill: boolean): Skill['proficiency'] => {
            const randomFactor = Math.random();
            if (exp > 10) return isCoreSkill ? (randomFactor > 0.2 ? 'Expert' : 'Advanced') : 'Advanced';
            if (exp > 5) return isCoreSkill ? (randomFactor > 0.3 ? 'Advanced' : 'Intermediate') : 'Intermediate';
            if (exp > 2) return isCoreSkill ? (randomFactor > 0.3 ? 'Intermediate' : 'Beginner') : 'Beginner';
            return 'Beginner';
        };
        
        const generatedSkills: Skill[] = roleInfo.skills.map(skillName => ({
            name: skillName,
            proficiency: assignProficiency(experience, true),
        }));

        if (Math.random() > 0.5) {
            generatedSkills.push({ name: 'Project Management', proficiency: assignProficiency(experience, false) });
        } else {
            generatedSkills.push({ name: 'Communication', proficiency: assignProficiency(experience, false) });
        }
        
        const locationInfo = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)];

        candidates.push({
            id: `c${i}`,
            name: name,
            email: email,
            role: roleInfo.title,
            skills: generatedSkills.slice(0, 4 + Math.floor(Math.random() * 2)),
            experience: experience,
            avatarUrl: `https://i.pravatar.cc/100?u=${i}`,
            education: educations[Math.floor(Math.random() * educations.length)],
            achievements: [
                `Led development of a key feature, increasing user engagement by ${10 + Math.floor(Math.random() * 20)}%.`,
                `Mentored ${1 + Math.floor(Math.random() * 3)} junior team members.`
            ],
            currentTeam: 'Unassigned', // Will be assigned later
            location: locationInfo.city,
            timeZone: locationInfo.timeZone,
        });
    }
    return candidates;
};

export const INITIAL_CANDIDATES: Candidate[] = generateCandidates();

export const EXISTING_TEAMS: ExistingTeams = {
    corePlatform: { title: 'Core Platform', members: [] },
    mobile: { title: 'Mobile Solutions', members: [] },
    design: { title: 'Design & Research', members: [] },
    data: { title: 'Data Science & QA', members: [] },
    growth: { title: 'Growth Marketing', members: [] },
    infrastructure: { title: 'Infrastructure & DevOps', members: [] },
    enterprise: { title: 'Enterprise Sales', members: [] },
    support: { title: 'Customer Support', members: [] },
};

// Distribute candidates into teams
const teamKeys = Object.keys(EXISTING_TEAMS);
INITIAL_CANDIDATES.forEach((candidate, index) => {
    const teamId = teamKeys[index % teamKeys.length];
    EXISTING_TEAMS[teamId].members.push(candidate.id);
    candidate.currentTeam = EXISTING_TEAMS[teamId].title;
});


export const INITIAL_TEAM_STRUCTURE: TeamStructure = {
    teamLead: { title: 'Team Lead', candidate: null, comments: [] },
    productManager: { title: 'Product Manager', candidate: null, comments: [] },
    designer: { title: 'UI/UX Designer', candidate: null, comments: [] },
    frontendDev: { title: 'Frontend Developer', candidate: null, comments: [] },
    backendDev: { title: 'Backend Developer', candidate: null, comments: [] },
    qaEngineer: { title: 'QA Engineer', candidate: null, comments: [] },
};

export const AI_PROGRESS_STEPS: ProgressStep[] = [
    { id: 'parse', label: 'Parsing Reorganization Goals', status: 'pending' },
    { id: 'query', label: 'Querying Candidate Database', status: 'pending' },
    { id: 'hr', label: 'Reading HR Regulations', status: 'pending' },
    { id: 'analyze', label: 'Analyzing Personnel Info', status: 'pending' },
    { id: 'shortlist', label: 'Shortlisting Top Candidates', status: 'pending', isSubStep: false },
    { id: 'sub-skill', label: 'Skill Match Analysis', status: 'pending', isSubStep: true },
    { id: 'sub-exp', label: 'Experience Alignment', status: 'pending', isSubStep: true },
    { id: 'sub-syn', label: 'Team Synergy Potential', status: 'pending', isSubStep: true },
    { id: 'finalize', label: 'Finalizing Team Structure', status: 'pending' },
];

export const AI_COMPLIANCE_STEPS: ProgressStep[] = [
    { id: 'init', label: 'Initializing Compliance Check', status: 'pending' },
    { id: 'check-roles', label: 'Checking Critical Role Coverage', status: 'pending' },
    { id: 'check-seniority', label: 'Analyzing Seniority Mix', status: 'pending' },
    { id: 'check-depletion', label: 'Assessing Team Depletion Impact', status: 'pending' },
    { id: 'check-complete', label: 'Verifying Team Completeness', status: 'pending' },
    { id: 'gen-report', label: 'Generating Final Report', status: 'pending' },
];