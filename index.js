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
      margin: {
        top: '40px',
        bottom: '60px',
        left: '20px',
        right: '20px'
      }
    });

    await browser.close();
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdf.length
    });
    res.send(pdf);
  } catch (e) {
    res.status(500).send('Erreur lors de la génération du PDF');
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 Puppeteer server running on port ${PORT}`);
});
