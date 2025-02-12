import { Anthropic } from '@anthropic-ai/sdk';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import dotenv from 'dotenv';
import { Octokit } from '@octokit/rest';

const writeFile = promisify(fs.writeFile);

dotenv.config();

const octokit = new Octokit({
  auth: process.env.REACT_APP_GITHUB_TOKEN
});

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ProjectInfo {
  name: string;
  repoOwner: string;
  repoName: string;
  description: string;
  technologies: string[];
}

async function getRepoFiles(owner: string, repo: string): Promise<string> {
  try {
    // Get the default branch
    const { data: repository } = await octokit.repos.get({
      owner,
      repo,
    });

    const defaultBranch = repository.default_branch;

    // Get the tree of the default branch
    const { data: tree } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: defaultBranch,
      recursive: 'true'
    });

    let codeContent = '';
    let totalSize = 0;
    const MAX_SIZE = 500000; // 500KB limit for code content

    // Filter and process files
    const codeFiles = tree.tree.filter(file => 
      file.type === 'blob' && 
      file.path && (
        file.path.endsWith('.py') || 
        file.path.endsWith('.js') || 
        file.path.endsWith('.ts')
      ) &&
      !file.path.includes('test') &&
      !file.path.includes('__tests__') &&
      !file.path.startsWith('node_modules/')
    );

    // Sort files by path to maintain consistent order
    codeFiles.sort((a, b) => (a.path || '').localeCompare(b.path || ''));

    // Get content of each file
    for (const file of codeFiles) {
      try {
        const { data } = await octokit.git.getBlob({
          owner,
          repo,
          file_sha: file.sha!
        });

        const content = Buffer.from(data.content, 'base64').toString('utf-8');

        if (content.length + totalSize > MAX_SIZE) {
          console.log(`Skipping ${file.path} due to size limit`);
          continue;
        }

        totalSize += content.length;
        const filePath = file.path || '';
        const extension = path.extname(filePath).slice(1);
        codeContent += `\nFile: ${filePath}\n\`\`\`${extension}\n${content}\n\`\`\`\n`;
      } catch (error) {
        console.error(`Error getting content for ${file.path}:`, error);
      }
    }

    return codeContent;
  } catch (error) {
    console.error('Error getting repo files:', error);
    return '';
  }
}

async function generateBlogPost(project: ProjectInfo): Promise<string> {
  const codeContent = await getRepoFiles(project.repoOwner, project.repoName);

  const slug = project.name.toLowerCase().replace(/\s+/g, '-');
  const date = new Date().toISOString().split('T')[0];
  const coverImage = `/assets/projects/${slug}-cover.jpg`; // You'll need to add these images

  const frontmatter = `---
title: "${project.name}: Building an AI-Powered ${project.description.split(':')[0]}"
date: "${date}"
tags: ${JSON.stringify(project.technologies)}
description: "${project.description}"
coverImage: "${coverImage}"
slug: "${slug}"
---

`;

  const prompt = `You are a technical writer creating a detailed blog post about the following AI project:

Project Name: ${project.name}
Description: ${project.description}
Technologies: ${project.technologies.join(', ')}

Here are the relevant code files from the project:
${codeContent}

Please write a comprehensive technical blog post that includes:
1. Introduction to the project and its purpose
2. Technical architecture and design decisions
3. Key implementation details with code examples
4. Challenges faced and solutions implemented
5. Future improvements and potential extensions

Format the blog post in markdown with proper headings, code blocks, and sections.
DO NOT include any frontmatter as it will be added separately.
Make the content engaging and educational for developers.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-opus-20240229',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    });

    if ('text' in response.content[0]) {
      const blogContent = response.content[0].text;
    return frontmatter + blogContent;
    }
    throw new Error('Unexpected response format from Anthropic API');
  } catch (error) {
    console.error('Error generating blog post:', error);
    throw error;
  }
}

async function saveBlogPosts(blogPosts: { name: string; content: string }[]): Promise<void> {
  const blogPath = path.join(process.cwd(), 'src', 'content', 'blog');
  const indexPath = path.join(blogPath, 'index.ts');
  
  try {
    let indexContent = '';
    
    // Create exports for each blog post
    for (const post of blogPosts) {
      const varName = post.name.toLowerCase().replace(/\s+/g, '-');
      indexContent += `export const ${varName} = \`${post.content}\`;

`;
    }
    
    await writeFile(indexPath, indexContent);
    console.log('Blog posts saved to index.ts');
  } catch (error) {
    console.error('Error saving blog posts:', error);
    throw error;
  }
}

// Example usage
async function main() {
  const projects: ProjectInfo[] = [
    {
      name: 'Q Bot',
      repoOwner: 'Hustada',
      repoName: 'Q-AI-X-Bot',
      description: 'AI-powered social media bot that generates and posts Star Trek Q character-themed content',
      technologies: ['Python', 'OpenAI GPT', 'Twitter API', 'Automation', 'NLP'],
    },
    {
      name: 'Fallacy Bot',
      repoOwner: 'Hustada',
      repoName: 'fallacy-bot',
      description: 'Advanced AI system for detecting and explaining logical fallacies in text',
      technologies: ['Python', 'Streamlit', 'OpenAI GPT-3.5', 'SQLite', 'Machine Learning'],
    },
    {
      name: 'Vectus AI',
      repoOwner: 'Hustada',
      repoName: 'vectus-ai',
      description: 'Intelligent medical scheduling assistant with NLP capabilities',
      technologies: ['Node.js', 'Express', 'OpenAI GPT-4', 'JavaScript', 'Real-time Processing'],
    },
  ];

  const generatedPosts = [];

  for (const project of projects) {
    try {
      console.log(`Generating blog post for ${project.name}...`);
      const blogContent = await generateBlogPost(project);
      generatedPosts.push({ name: project.name, content: blogContent });
    } catch (error) {
      console.error(`Error processing ${project.name}:`, error);
    }
  }

  await saveBlogPosts(generatedPosts);
}

if (require.main === module) {
  main().catch(console.error);
}
