import { ContentBlock, ContentBlockType } from './types';

/**
 * Converts an array of ContentBlocks into a clean Bengali Markdown string
 */
export function blocksToMarkdown(blocks: ContentBlock[]): string {
  let md = '';

  for (const block of blocks) {
    switch (block.type) {
      case 'heading': {
        const level = block.settings?.headingLevel || 'h2';
        const prefix = level === 'h1' ? '# ' : level === 'h2' ? '## ' : '### ';
        md += `${prefix}${String(block.content || '').trim()}\n\n`;
        break;
      }
      case 'paragraph': {
        md += `${String(block.content || '').trim()}\n\n`;
        break;
      }
      case 'job_info_table': {
        if (Array.isArray(block.content)) {
          md += '| বিবরণ | তথ্য |\n| :--- | :--- |\n';
          block.content.forEach((row: any) => {
            md += `| **${row.label || ''}** | ${row.value || ''} |\n`;
          });
          md += '\n';
        }
        break;
      }
      case 'bullet_list': {
        if (Array.isArray(block.content)) {
          block.content.forEach((item: string) => {
            md += `- ${item}\n`;
          });
          md += '\n';
        }
        break;
      }
      case 'numbered_list': {
        if (Array.isArray(block.content)) {
          block.content.forEach((item: string, idx: number) => {
            md += `${idx + 1}. ${item}\n`;
          });
          md += '\n';
        }
        break;
      }
      case 'notice_box': {
        md += `> [!NOTE]\n> ${String(block.content || '').replace(/\n/g, '\n> ')}\n\n`;
        break;
      }
      case 'apply_button': {
        const btn = block.content || {};
        md += `[${btn.label || 'অনলাইনে আবেদন করুন'}](${btn.url || '#'})\n\n`;
        break;
      }
      case 'faq_accordion': {
        if (Array.isArray(block.content)) {
          block.content.forEach((faq: any) => {
            md += `### ${faq.question || ''}\n${faq.answer || ''}\n\n`;
          });
        }
        break;
      }
      case 'divider': {
        md += '---\n\n';
        break;
      }
      default: {
        if (typeof block.content === 'string') {
          md += `${block.content}\n\n`;
        }
        break;
      }
    }
  }

  return md.trim();
}

/**
 * Creates a new blank block with safe default settings
 */
export function createNewBlock(type: ContentBlockType, content: any = ''): ContentBlock {
  const id = `blk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  return {
    id,
    type,
    content,
    settings: {
      alignment: 'left',
      headingLevel: type === 'heading' ? 'h2' : undefined,
      isFullWidth: type === 'job_info_table' || type === 'faq_accordion',
      styleVariant: 'default'
    }
  };
}
