// Nomdan URL uchun qulay 'slug' yasaydi: "Do'kon 5" -> "dokon-5"
export function slugify(input: string): string {
  const map: Record<string, string> = { "'": '', '‘': '', '’': '', 'ʻ': '' };
  return input
    .trim()
    .toLowerCase()
    .replace(/[‘’'ʻ]/g, (c) => map[c] ?? '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
