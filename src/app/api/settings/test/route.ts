import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { decrypt } from '@/lib/encryption';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Demo user ID for now - in production this would come from auth
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider } = body;

    if (!provider || !['openai', 'gemini'].includes(provider)) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from('api_settings')
      .select('openai_key_encrypted, gemini_key_encrypted')
      .eq('user_id', DEMO_USER_ID)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 400 });
    }

    if (provider === 'openai') {
      if (!data.openai_key_encrypted) {
        return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 400 });
      }

      const apiKey = decrypt(data.openai_key_encrypted);
      const openai = new OpenAI({ apiKey });

      try {
        // Test with a simple request
        await openai.models.list();
        return NextResponse.json({ success: true });
      } catch (err) {
        const error = err as Error;
        return NextResponse.json({
          success: false,
          error: error.message || 'Invalid OpenAI API key',
        });
      }
    }

    if (provider === 'gemini') {
      if (!data.gemini_key_encrypted) {
        return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 400 });
      }

      const apiKey = decrypt(data.gemini_key_encrypted);
      const genAI = new GoogleGenerativeAI(apiKey);

      try {
        // Test with a simple request
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        await model.generateContent('Hello');
        return NextResponse.json({ success: true });
      } catch (err) {
        const error = err as Error;
        return NextResponse.json({
          success: false,
          error: error.message || 'Invalid Gemini API key',
        });
      }
    }

    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
