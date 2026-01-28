import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { encrypt } from '@/lib/encryption';

// Demo user ID for now - in production this would come from auth
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

export async function GET() {
  try {
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from('api_settings')
      .select('openai_key_encrypted, gemini_key_encrypted')
      .eq('user_id', DEMO_USER_ID)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching settings:', error);
      return NextResponse.json({ error: 'Error fetching settings' }, { status: 500 });
    }

    return NextResponse.json({
      hasOpenai: !!data?.openai_key_encrypted,
      hasGemini: !!data?.gemini_key_encrypted,
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { openaiKey, geminiKey } = body;

    if (!openaiKey && !geminiKey) {
      return NextResponse.json({ error: 'At least one API key is required' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // Check if settings exist
    const { data: existing } = await supabase
      .from('api_settings')
      .select('id')
      .eq('user_id', DEMO_USER_ID)
      .single();

    const updateData: Record<string, string> = {};

    if (openaiKey) {
      updateData.openai_key_encrypted = encrypt(openaiKey);
    }

    if (geminiKey) {
      updateData.gemini_key_encrypted = encrypt(geminiKey);
    }

    let result;

    if (existing) {
      // Update existing record
      result = await supabase
        .from('api_settings')
        .update(updateData)
        .eq('user_id', DEMO_USER_ID);
    } else {
      // Insert new record
      result = await supabase.from('api_settings').insert({
        user_id: DEMO_USER_ID,
        ...updateData,
      });
    }

    if (result.error) {
      console.error('Error saving settings:', result.error);
      return NextResponse.json({ error: 'Error saving settings' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
