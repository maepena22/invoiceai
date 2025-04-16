import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';
// 替换这一行
// import { Configuration, OpenAIApi } from 'openai';
import OpenAI from 'openai';
import db from '../../lib/db';
import pdfPoppler from 'pdf-poppler';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // 1. Handle file upload
  const form = formidable();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Upload failed' });

    // Support multiple files
    let uploadedFiles = files.file;
    if (!uploadedFiles) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    if (!Array.isArray(uploadedFiles)) {
      uploadedFiles = [uploadedFiles];
    }

    const results = [];
    for (const uploadedFile of uploadedFiles) {
      if (!uploadedFile || !uploadedFile.filepath) continue;
      const dataBuffer = fs.readFileSync(uploadedFile.filepath);

    // 2. PDF 转图片（取第一页）
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    const pdfPath = uploadedFile.filepath;
    const outputBase = path.join(tempDir, path.parse(pdfPath).name);
    const opts = {
      format: 'png',
      out_dir: tempDir,
      out_prefix: path.parse(pdfPath).name,
      page: 1,
    };
    await pdfPoppler.convert(pdfPath, opts);
    const imagePath = `${outputBase}-1.png`;

    // 3. OCR 识别（用 Tesseract 识别日文）
    const ocrResult = await Tesseract.recognize(
      imagePath,
      'jpn', // 日文
      { logger: m => console.log(m) }
    );
    const ocrText = ocrResult.data.text;

    // 4. 调用 GPT 生成 JSON
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const prompt = `
      以下是日本发票的 OCR 文本，请提取公司名、总金额和日期，输出如下 JSON 格式：
      {
        "company_name": "",
        "total_amount": "",
        "date": ""
      }
      OCR文本:
      ${ocrText}
    `;
    const gptRes = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    });
    const jsonText = gptRes.choices[0].message.content;
    let invoiceJson;
    try {
      invoiceJson = JSON.parse(jsonText);
    } catch {
      return res.status(500).json({ error: 'GPT parsing failed', raw: jsonText });
    }

    // Save to SQLite database
    db.prepare(
      'INSERT INTO invoices (company_name, total_amount, date, raw_ocr) VALUES (?, ?, ?, ?)'
    ).run(
      invoiceJson.company_name,
      invoiceJson.total_amount,
      invoiceJson.date,
      ocrText
    );

    results.push({ ...invoiceJson, raw_ocr: ocrText });
    }

    res.json(results);
  });
}