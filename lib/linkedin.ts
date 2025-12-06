import type { TaskPriority } from './types';

const LINKEDIN_API_KEY = process.env.NEXT_PUBLIC_LINKEDIN_API_KEY || '';

export interface LinkedInMessage {
    id: string;
    sender: string;
    content: string;
    timestamp: string;
    isRead: boolean;
}

/**
 * Fetch messages from LinkedIn (Mock/Simulation for now)
 * In a real scenario, this would call a proxy service or the LinkedIn API.
 */
export async function fetchLinkedInMessages(): Promise<LinkedInMessage[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (!LINKEDIN_API_KEY) {
        console.warn('LinkedIn API Key is missing. Using mock data.');
    }

    // Mock data to demonstrate the integration
    return [
        {
            id: 'li_1',
            sender: 'Sarah Connor',
            content: 'Hey! I saw your profile and wanted to connect regarding the AI project.',
            timestamp: new Date().toISOString(),
            isRead: false,
        },
        {
            id: 'li_2',
            sender: 'Tech Recruiter',
            content: 'We have an opening for a Senior React Developer. Are you interested?',
            timestamp: new Date(Date.now() - 86400000).toISOString(), // Yesterday
            isRead: false,
        },
        {
            id: 'li_3',
            sender: 'John Doe',
            content: 'Thanks for the endorsement!',
            timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            isRead: true,
        },
    ];
}

/**
 * Convert LinkedIn messages to Tasks for the Smart Inbox
 */
export function convertLinkedInToTasks(messages: LinkedInMessage[]): Array<{
    title: string;
    description: string;
    dueDate: string | null;
    priority: TaskPriority;
}> {
    return messages.filter(msg => !msg.isRead).map((msg) => ({
        title: `Message from ${msg.sender}`,
        description: `${msg.content}\n\nSource: LinkedIn`,
        dueDate: null, // Messages usually don't have due dates unless parsed
        priority: 'p3', // Default to medium priority for messages
    }));
}
