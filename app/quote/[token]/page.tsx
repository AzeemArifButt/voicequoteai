import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createServiceClient } from '@/lib/supabase';
import SharePageClient from './SharePageClient';

interface Props {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ download?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('quotes')
    .select('title, client_name, company_name')
    .eq('share_token', token)
    .single();

  if (!data) return { title: 'Quote Not Found — VoiceQuote AI' };

  const title = data.title || `Quote for ${data.client_name}`;
  return {
    title: `${title} — VoiceQuote AI`,
    description: `Professional proposal${data.company_name ? ` from ${data.company_name}` : ''}, generated with VoiceQuote AI.`,
  };
}

export default async function SharePage({ params, searchParams }: Props) {
  const { token } = await params;
  const { download } = await searchParams;

  const supabase = createServiceClient();
  const { data: quote } = await supabase
    .from('quotes')
    .select('id, title, client_name, client_email, company_name, total_price, currency, proposal_text, share_token, created_at')
    .eq('share_token', token)
    .single();

  if (!quote) notFound();

  return (
    <SharePageClient
      quote={quote}
      autoDownload={download === '1'}
    />
  );
}
