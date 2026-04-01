import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

// Demo user ID for now - in production this would come from auth
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

export async function GET() {
  try {
    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', DEMO_USER_ID)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return NextResponse.json({ error: 'Error fetching projects' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, brandName, industry, service, country, prompts } = body;

    // Validate required fields
    if (!name || !brandName || !industry || !service || !country) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!prompts || !Array.isArray(prompts) || prompts.length === 0) {
      return NextResponse.json({ error: 'At least one prompt is required' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: DEMO_USER_ID,
        name,
        brand_name: brandName,
        industry,
        service,
        country,
        prompts,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return NextResponse.json({ error: 'Error creating project' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
