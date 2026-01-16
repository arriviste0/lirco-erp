import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get('file');
  if (!file) {
    return NextResponse.json({ error: 'Missing file parameter' }, { status: 400 });
  }

  const outputDir = path.join(process.cwd(), 'generated');
  const resolvedPath = path.join(outputDir, file);
  if (!resolvedPath.startsWith(outputDir)) {
    return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
  }

  try {
    const data = await fs.readFile(resolvedPath);
    const headers = new Headers();
    headers.set(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    headers.set('Content-Disposition', `attachment; filename="${file}"`);
    return new NextResponse(data, { headers });
  } catch (error) {
    console.error('Failed to read generated file', error);
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}
