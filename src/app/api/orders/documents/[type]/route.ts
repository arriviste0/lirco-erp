import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { spawn } from 'child_process';
import dbConnect from '@/lib/mongodb';
import Quotation from '@/lib/models/Quotation';
import CostSheet from '@/lib/models/CostSheet';
import Inquiry from '@/lib/models/Inquiry';

export const runtime = 'nodejs';

const documentScripts: Record<string, string> = {
  'work-order': 'work_order.py',
  'packing-list': 'packing_list.py',
  'proforma-invoice': 'proforma_invoice.py',
};

const pythonBin = process.env.PYTHON_BIN ?? 'python';

const runPython = async (scriptPath: string, payload: unknown) => {
  const serialized = JSON.stringify(payload);
  return new Promise<{ ok: boolean; error?: string }>((resolve, reject) => {
    const child = spawn(pythonBin, [scriptPath], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    child.on('error', (error) => reject(error));
    child.on('close', (code) => {
      if (code !== 0) {
        resolve({ ok: false, error: stderr || stdout || 'Python exited with error' });
        return;
      }
      try {
        const response = JSON.parse(stdout.trim() || '{}') as { ok?: boolean; error?: string };
        resolve({ ok: response.ok !== false, error: response.error });
      } catch (error) {
        resolve({ ok: false, error: (error as Error).message || 'Invalid script output' });
      }
    });
    child.stdin.write(serialized);
    child.stdin.end();
  });
};

const safeBaseName = (value: string) =>
  value.replace(/[^a-z0-9-_]+/gi, '_').replace(/^_+|_+$/g, '');

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ type: string }> }
) {
  const { type } = await context.params;
  const scriptName = documentScripts[type];
  if (!scriptName) {
    return NextResponse.json({ error: 'Unknown document type' }, { status: 400 });
  }

  let body: { order?: Record<string, unknown>; input?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const order = body.order ?? {};
  const input = body.input ?? {};
  const offerNo = String(order.offerNo ?? '').trim();
  const costSheetNos = Array.isArray(order.costSheetNos) ? order.costSheetNos : [];

  try {
    await dbConnect();
    const quotation = offerNo
      ? await Quotation.findOne({ offerNo }).lean()
      : null;
    const costSheets = costSheetNos.length
      ? await CostSheet.find({ costSheetNo: { $in: costSheetNos } }).lean()
      : [];
    const inquiries = offerNo
      ? await Inquiry.find({ offerNo }).lean()
      : [];

    const outputDir = path.join(process.cwd(), 'generated');
    await fs.mkdir(outputDir, { recursive: true });
    const baseName = safeBaseName(
      `${type}-${offerNo || order.id || 'order'}-${Date.now()}`
    );
    const fileName = `${baseName}.xlsx`;
    const outputPath = path.join(outputDir, fileName);
    const scriptPath = path.join(process.cwd(), 'scripts', scriptName);

    const payload = {
      order,
      quotation,
      costSheets,
      inquiries,
      outputPath,
      input,
    };

    const result = await runPython(scriptPath, payload);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error || 'Document generation failed' },
        { status: 500 }
      );
    }

    await fs.access(outputPath);
    const downloadUrl = `/api/orders/documents/download?file=${encodeURIComponent(fileName)}`;
    return NextResponse.json({ downloadUrl });
  } catch (error) {
    console.error('Document generation failed', error);
    return NextResponse.json({ error: 'Document generation failed' }, { status: 500 });
  }
}
