const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.text({ type: '*/*', limit: '10mb' }));

app.post('/generate', async (req, res) => {
  const html = req.body;

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: true,
      margin: { top: '0mm', bottom: '0mm', left: '0mm', right: '0mm' },
      footerTemplate: `
        <div style="width: 100%; font-size: 10px; color: #444; padding: 0 40px; margin-bottom: 10px; display: flex; justify-content: space-between;">
          <div style="flex:1; text-align: center;">FLEX ENERGIE SARL au capital de 2000€ immatriculée au RCS de Chalon-sur-Saône au numéro SIRET 91289481300019</div>
          <div style="width: 80px; text-align: right;">Page <span class="pageNumber"></span> / <span class="totalPages"></span></div>
        </div>`
      ,
      headerTemplate: `<div></div>`
    });

    await browser.close();
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdf.length
    });
    
    res.send(pdf);

  } catch (e) {
    console.error('Erreur lors de la génération du PDF :', e);
    res.status(500).send('Erreur lors de la génération du PDF');
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Puppeteer server running on port ${PORT}`);
});
