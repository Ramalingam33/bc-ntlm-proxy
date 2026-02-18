const express = require('express');
const httpntlm = require('httpntlm');

const app = express();
const PORT = process.env.PORT || 3000;

const NTLM_USER = process.env.NTLM_USER || 'zoho_svc';
const NTLM_PASS = process.env.NTLM_PASS || 'dny@RGJK$k';
const NTLM_DOMAIN = process.env.NTLM_DOMAIN || '';
const BC_BASE_URL = process.env.BC_BASE_URL || 'https://bc20stage-api.gabrielny.com/GabrielBC_Test/api/v2.0';

app.get('/api/*', (req, res) => {
    const path = req.params[0];
    const queryString = Object.keys(req.query).length
        ? '?' + new URLSearchParams(req.query).toString()
        : '';
    const targetUrl = BC_BASE_URL + '/' + path + queryString;

    console.log('Proxying to:', targetUrl);

    httpntlm.get({
        url: targetUrl,
        username: NTLM_USER,
        password: NTLM_PASS,
        domain: NTLM_DOMAIN,
        workstation: ''
    }, (err, response) => {
        if (err) {
            console.error('NTLM Error:', err);
            return res.status(500).json({ error: err.message });
        }
        console.log('BC Status:', response.statusCode);
        try {
            const data = JSON.parse(response.body);
            res.json(data);
        } catch (e) {
            res.status(response.statusCode).send(response.body);
        }
    });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log('BC NTLM Proxy running on port ' + PORT);
});
