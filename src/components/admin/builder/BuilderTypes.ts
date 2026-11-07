import React from 'react';
import { PageRecord, PageSection, SectionType, SectionStyle, PageRevision } from '@/lib/types';

export interface BlockItem {
  id: string;
  name: string;
  category: 'basic' | 'layout' | 'dynamic';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  type: SectionType;
  defaultData: () => Partial<PageSection>;
}

export interface SectionCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  sections: {
    id: string;
    title: string;
    type: SectionType;
    previewSubtitle: string;
    createSection: () => PageSection;
  }[];
}

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  category: 'general' | 'landing' | 'dynamic' | 'career';
  targetSlug?: string;
  sections: PageSection[];
}

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  field?: string;
}

export interface BuilderPublishValidation {
  canPublish: boolean;
  issues: ValidationIssue[];
}

