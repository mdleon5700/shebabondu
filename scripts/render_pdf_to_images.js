const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function renderPdfPages(pdfPath, outputDir, maxPages = 2) {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfBase64 = pdfBytes.toString('base64');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 1800 } });

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
    </head>
    <body style="margin: 0; background: #fff;">
      <div id="pages-container"></div>
      <script>
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const pdfData = atob("${pdfBase64}");
        
        async function run() {
          try {
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
            window.TOTAL_PAGES = pdf.numPages;
            const container = document.getElementById('pages-container');
            const limit = Math.min(pdf.numPages, ${maxPages});
            
            for (let i = 1; i <= limit; i++) {
              const p = await pdf.getPage(i);
              const viewport = p.getViewport({ scale: 1.8 });
              const canvas = document.createElement('canvas');
              canvas.id = 'page-' + i;
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              container.appendChild(canvas);
              const ctx = canvas.getContext('2d');
              await p.render({ canvasContext: ctx, viewport: viewport }).promise;
            }
            window.RENDER_DONE = true;
          } catch (e) {
            window.RENDER_ERROR = e.message;
          }
        }
        run();
      </script>
    </body>
    </html>
  `;

  await page.setContent(html);
  await page.waitForFunction(() => window.RENDER_DONE || window.RENDER_ERROR, { timeout: 30000 });

  const renderErr = await page.evaluate(() => window.RENDER_ERROR);
  if (renderErr) {
    throw new Error('PDF render failed: ' + renderErr);
  }

  const totalPages = await page.evaluate(() => window.TOTAL_PAGES);
  const renderedCount = Math.min(totalPages, maxPages);
  const imagePaths = [];

  for (let i = 1; i <= renderedCount; i++) {
    const canvas = page.locator('#page-' + i);
    const outPath = path.join(outputDir, `page_${i}.png`);
    await canvas.screenshot({ path: outPath });
    imagePaths.push(outPath);
  }

  await browser.close();
  return { totalPages, renderedCount, imagePaths };
}

if (require.main === module) {
  (async () => {
    try {
      console.log('Rendering test_jamalpur.pdf to images...');
      const res = await renderPdfPages('test_jamalpur.pdf', 'rendered_pages', 2);
      console.log('Render complete:', res);
    } catch (e) {
      console.error('Error:', e);
    }
  })();
}

module.exports = { renderPdfPages };
