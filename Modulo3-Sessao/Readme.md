# 🍪 Módulo 3 — Cookies e Gestão Segura de Sessão

## 🎯 Objetivo

Demonstrar, na ótica da **Engenharia de Software**, as vulnerabilidades de **sequestro de sessão (*Session Hijacking*)** geradas pela má configuração do `Cookie SessionID`. Através de um servidor real em **Node.js + Express**, a PoC compara cabeçalhos expostos com a aplicação prática das diretivas **`HttpOnly`** e **`Secure`** contra ataques **XSS**.

## 🧰 Ferramentas Utilizadas

| Ferramenta | Função |
| :--- | :--- |
| `Node.js` | Ambiente de execução JavaScript no lado do servidor (back-end) |
| `Express` | Framework web para as APIs de login e controle de cookies |
| `curl` | Leitura de cabeçalhos HTTP brutos no cliente via flag `-i` |

## 🌐 Configuração de Rede Adicional (Security Group)

A aplicação roda na **porta 3000**. Garanta a regra de entrada no Security Group:

| Porta | Tipo | Origem | Finalidade |
| :---: | :--- | :--- | :--- |
| **3000** | Custom TCP | `0.0.0.0/0` | Chamadas externas do cliente |

## 🪜 Passo a Passo

### Etapa 1 — Instalação do Ambiente no Ubuntu Server (AWS)

Atualize os repositórios e instale o interpretador e o gerenciador de pacotes:

```bash
sudo apt-get update -y && sudo apt-get install -y nodejs npm
```

Inicialize o manifesto do projeto e instale o **Express**:

```bash
npm init -y
npm install express
```

### Etapa 2 — Construção e Execução do Servidor Back-end

Crie o arquivo de aplicação com as rotas vulnerável e protegida:

```bash
cat << 'EOF' > app_sessao.js
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Servidor de Aplicação do SENAI Félix Guisard está ativo!');
});

// 1. ROTA VULNERÁVEL: Cookie gerado sem nenhuma trava de segurança técnica (XSS exposto)
app.get('/login-inseguro', (req, res) => {
    res.cookie('SessionID', 'abc123vulneravel', { httpOnly: false });
    res.send('Autenticado. Cookie inseguro gerado!');
});

// 2. ROTA SEGURA (HARDENING): Cookie blindado com diretivas HttpOnly e Secure ativas
app.get('/login-seguro', (req, res) => {
    res.cookie('SessionID', 'xyz987protegido', { secure: true, httpOnly: true });
    res.send('Autenticado. Diretrizes seguras aplicadas!');
});

app.listen(3000, () => {
    console.log('\n======================================================================');
    console.log('   SERVIDOR DE TESTE NODE.JS ATIVO E ESCUTANDO NA PORTA 3000...');
    console.log('======================================================================');
});
EOF
```

Inicie o servidor (deixe este terminal aberto executando o serviço):

```bash
node app_sessao.js
```

### Etapa 3 — Auditoria Externa e Captura de Evidências

No terminal do seu computador pessoal, audite os cabeçalhos HTTP retornados.

**Rota Insegura:**

```bash
curl -i http://IP_PUBLICO_DA_SUA_EC2:3000/login-inseguro
```

> 📸 **PONTO DE EVIDÊNCIA 5** — Capture o cabeçalho `Set-Cookie` **sem** diretivas protetivas.
> Salve como `print5_cookie_inseguro.png`.

**Rota Segura (Hardening):**

```bash
curl -i http://IP_PUBLICO_DA_SUA_EC2:3000/login-seguro
```

> 📸 **PONTO DE EVIDÊNCIA 6** — Capture a resposta HTTP com `; Secure; HttpOnly` acoplados ao `Set-Cookie`.
> Salve como `print6_cookie_seguro.png`.

## ✅ Resultado

Na rota vulnerável o cabeçalho entrega o identificador "seco". Na rota de *hardening*, as tags de controle instruem o navegador sobre como proteger a credencial:

```http
HTTP/1.1 200 OK
X-Powered-By: Express
Set-Cookie: SessionID=xyz987protegido; Path=/; Secure; HttpOnly
Content-Type: text/html; charset=utf-8
Content-Length: 44
Date: Fri, 22 May 2026 23:15:40 GMT
Connection: keep-alive
Keep-Alive: timeout=5

Autenticado. Diretrizes seguras aplicadas!
```

## 🧠 Explicação Técnica

<details>
<summary><strong>O Risco do Sequestro de Sessão (Session Hijacking)</strong></summary>

<br>

Por ser um protocolo **stateless**, o HTTP usa chaves temporárias em cookies (`SessionID`) para validar a identidade e o estado do login a cada requisição. Se o back-end falhar na higienização de entrada e for suscetível a **XSS**, scripts invasores podem executar `document.cookie` no navegador da vítima. Sem travas, o script lê a sessão e a envia a servidores externos. De posse da chave, o atacante injeta o cookie clonado no próprio navegador e **personifica a vítima** sem conhecer e-mail ou senha.

</details>

<details>
<summary><strong>Funcionamento Lógico dos Atributos de Hardening</strong></summary>

<br>

- **`HttpOnly`** — Instrui o navegador a **impedir** que scripts client-side acessem o cookie via APIs como `document.cookie`. Mesmo sob XSS severo, o script falha ao tentar ler o identificador, eliminando o vetor de roubo por injeção.
- **`Secure`** — Restringe a transmissão do cookie **exclusivamente** sob conexão TLS (HTTPS). Em HTTP simples exposto (como no Módulo 1), o navegador oculta o cookie e se recusa a enviá-lo, impedindo a coleta de IDs de sessão por sniffers físicos.

</details>

---

<div align="center">

**Projeto Conexões Seguras** · SENAI Félix Guisard
*Laboratórios de Segurança de Redes e Aplicações em ambiente AWS controlado*

</div>
