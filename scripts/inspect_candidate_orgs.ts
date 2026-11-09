import { extractTextFromPdf } from '../src/lib/spider/gemini_browser_controller';

async function checkCagPdf() {
  const url = 'https://alljobs.teletalk.com.bd/media/public/uploads/governments/jobs/advertisement-1793675931548.pdf';
  console.log('Downloading CAG PDF:', url);
  const text = await extractTextFromPdf(url);
  console.log('Extracted Text Length:', text.length);
  if (text.length > 0) {
    console.log('--- SAMPLE PDF TEXT ---');
    console.log(text.slice(0, 1500));
  } else {
    console.log('PDF is scanned image or empty text.');
  }
}

checkCagPdf().catch(console.error);
