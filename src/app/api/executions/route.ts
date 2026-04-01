import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

// Demo user ID for now - in production this would come from auth
const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const supabase = createServiceRoleClient();

    let query = supabase
      .from('executions')
      .select(`
        *,
        projects!inner (
          name,
          brand_name,
          user_id
        )
      `)
      .eq('projects.user_id', DEMO_USER_ID)
      .order('executed_at', { ascending: false })
      .limit(50);

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching executions:', error);
      return NextResponse.json({ error: 'Error fetching executions' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
