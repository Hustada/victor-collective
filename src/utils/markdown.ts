import fs from 'fs';
import path from 'path';

export function readMarkdownFile(filePath: string): string {
    const fullPath = path.join(process.cwd(), filePath);
    try {
        return fs.readFileSync(fullPath, 'utf-8');
    } catch (error) {
        console.error(`Error reading markdown file ${filePath}:`, error);
        return '';
    }
}
