const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Servidor de Aplicação do SENAI Félix Guisard está ativo!');
});

// 1. ROTA VULNERÁVEL: Simulação de Cookie de Sessão exposto sem nenhuma trava de proteção
app.get('/login-inseguro', (req, res) => {
    res.cookie('SessionID', 'abc123vulneravel', { httpOnly: false });
    res.send('Autenticado. Cookie inseguro gerado!');
});

// 2. ROTA SEGURA (HARDENING): Cookie protegido contra XSS (HttpOnly) e interceptações (Secure)
app.get('/login-seguro', (req, res) => {
    res.cookie('SessionID', 'xyz987protegido', { secure: true, httpOnly: true });
    res.send('Autenticado. Diretrizes seguras aplicadas!');
});

app.listen(3000, () => {
    console.log('\n======================================================================');
    console.log('   SERVIDOR DE TESTE NODE.JS ATIVO E ESCUTANDO NA PORTA 3000...');
    console.log('======================================================================');
    console.log('[*] Teste Inseguro: curl -i http://<IP_DA_AWS>:3000/login-inseguro');
    console.log('[*] Teste Seguro:   curl -i http://<IP_DA_AWS>:3000/login-seguro');
    console.log('======================================================================\n');
});