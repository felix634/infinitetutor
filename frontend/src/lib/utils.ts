import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** Rough word count from markdown (strips code blocks, links). ~200 wpm default. */
export function estimateReadingMinutes(markdown: string, wpm = 200): number {
    if (!markdown?.trim()) return 1;
    const stripped = markdown
        .replace(/```[\s\S]*?```/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/#{1,6}\s/g, '');
    const words = stripped.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / wpm));
}
