const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.text({ type: '*/*', limit: '10mb' }));

app.post('/generate', async (req, res) => {
  const html = req.body;

  console.log('HTML reçu:', html.slice(0, 100))

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--single-process'
      ],
      // Configuration pour l'environnement de production (Render)
      executablePath: process.env.NODE_ENV === 'production' 
        ? process.env.PUPPETEER_EXECUTABLE_PATH 
        : undefined
    });

    const page = await browser.newPage();
    
    // Optimiser l'utilisation mémoire
    await page.setDefaultNavigationTimeout(60000);
    await page.setDefaultTimeout(60000);
    
    await page.setContent(html, { 
      waitUntil: 'networkidle0',
      timeout: 60000
    });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' },
      footerTemplate: `
        <div style="width: 100%; font-size: 10px; color: #444; padding: 0 40px; margin-bottom: 10px; display: flex; justify-content: space-between;">
          <div style="flex:1; text-align: center;">
            FLEX ENERGIE SARL au capital de 2000€ immatriculée au RCS de Chalon-sur-Saône au numéro SIRET 91289481300019
          </div>
          <div style="width: 80px; text-align: right;">
            Page <span class="pageNumber"></span> / <span class="totalPages"></span>
          </div>
        </div>`,
      headerTemplate: `<div></div>`,
      timeout: 60000
    });

    await browser.close();
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdf.length
    });
    res.send(pdf);
  } catch (e) {
    console.error('Erreur lors de la génération du PDF :', e);
    res.status(500).send('Erreur lors de la génération du PDF: ' + e.message);
  }
});

// Route de santé pour vérifier que le service fonctionne
app.get('/health', (req, res) => {
  res.status(200).send('Service is running');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Puppeteer server running on port ${PORT}`);
});