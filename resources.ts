export interface ResourceLink {
  title: string;
  href: string;
  format: 'PDF' | 'Word' | 'Link';
}

export const RESOURCE_LINKS: ResourceLink[] = [
  {
    title: 'Att använda AI i Göteborgs Stad',
    href: '/resources/att-anvanda-ai-i-goteborgs-stad.pdf',
    format: 'PDF',
  },
];
