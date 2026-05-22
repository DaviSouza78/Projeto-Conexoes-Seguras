#  Módulo 2 — Criptografia Híbrida e o Handshake TLS

##  Objetivo

Demonstrar de forma prática o funcionamento matemático e lógico do **Handshake TLS** de conexões HTTPS, evidenciando como a **criptografia híbrida** resolve o dilema de segurança da internet: une a segurança da troca de chaves da criptografia **assimétrica (RSA)** com a alta velocidade da criptografia **simétrica (AES-256)**.

##  Ferramentas Utilizadas

| Ferramenta | Função |
| :--- | :--- |
| `openssl` | Geração de chaves RSA/AES e cifragem de payloads |
| `xxd` / `hexdump` | Conversão de chaves binárias para formato hexadecimal |
| `cat` | Visualização direta de arquivos de texto e dados cifrados brutos |

##  Requisitos e Instalação

O utilitário `openssl` é **nativo** nas imagens padrão do Ubuntu Server na AWS — não requer instalação adicional. Basta acessar o terminal e executar as etapas sequenciais.

##  Passo a Passo

### Etapa 1 — Geração de Chaves Assimétricas (Servidor)

Gere a chave **privada** RSA de 2048 bits (mantida em sigilo absoluto):

```bash
openssl genrsa -out server_private.pem 2048
```

Extraia a chave **pública** correspondente (simula o dado distribuído em um certificado digital):

```bash
openssl rsa -in server_private.pem -pubout -out server_public.pem
```

### Etapa 2 — Criação da Chave Simétrica de Sessão (Cliente)

Simule o navegador gerando uma chave simétrica efêmera de alta entropia (256 bits / AES):

```bash
openssl rand -hex 32 > session_key.txt
```

### Etapa 3 — O Envelope Criptográfico do Handshake

Cifre a chave simétrica usando a chave **pública RSA** do servidor (o "envelope" que protege o segredo compartilhado):

```bash
openssl pkeyutl -encrypt -pubin -inkey server_public.pem -in session_key.txt -out encrypted_key.bin
```

Visualize os bytes protegidos em representação hexadecimal:

```bash
xxd encrypted_key.bin
```


### Etapa 4 — Desencriptação e Recuperação de Segredo

O servidor usa sua **chave privada RSA** (que só ele possui) para recuperar a chave simétrica enviada pelo cliente:

```bash
openssl pkeyutl -decrypt -inkey server_private.pem -in encrypted_key.bin -out decrypted_key.txt
```

### Etapa 5 — Cifragem Simétrica Rápida do Canal de Dados

Escreva uma mensagem simulando dados sensíveis da camada de aplicação:

```bash
echo "DADOS_CONFIDENCIAIS_DO_USUARIO_SENAI_FELIX_GUISARD" > dados.txt
```

Criptografe em alta velocidade com **AES-256-CBC** + derivação **PBKDF2**, usando a chave decifrada pelo servidor:

```bash
openssl enc -aes-256-cbc -salt -in dados.txt -out seguro.enc -pass file:decrypted_key.txt -pbkdf2
```

Tente ler o arquivo final para simular o tráfego bruto na rede:

```bash
cat seguro.enc
```

##  Resultado

Os arquivos `session_key.txt` (cliente) e `decrypted_key.txt` (servidor) resultam em **sequências idênticas** (ex.: `8f3a9e...`), provando o sincronismo bem-sucedido de chaves no handshake. Ao ler o arquivo cifrado, a saída exibe apenas entropia incompreensível:

```text
Salted__f...B.F....kY.vX@...Z...q9.8h!2
```

##  Explicação Técnica

<details>
<summary><strong>O Gargalo da Criptografia Assimétrica</strong></summary>

<br>

A criptografia assimétrica baseia-se em problemas matemáticos de via única (fatoração de grandes primos no RSA; logaritmos discretos em curvas elípticas), exigindo esforço computacional **massivo** da CPU. Se um servidor precisasse cifrar **cada** recurso de milhares de usuários concorrentes com cálculos assimétricos, o processador sofreria gargalo imediato, inviabilizando a escalabilidade.

</details>

<details>
<summary><strong>A Eficiência da Arquitetura Híbrida</strong></summary>

<br>

O **TLS (Transport Layer Security)** estrutura a segurança em duas etapas:

- **Etapa Assimétrica (Handshake):** o par de chaves RSA é usado apenas no início da conexão para validar a autenticidade e encapsular com segurança uma chave simétrica temporária gerada pelo cliente.
- **Etapa Simétrica (Tráfego de Dados):** acordada a chave de sessão, todo o restante do payload usa criptografia simétrica (**AES-256**) — permutações de bits e matrizes lógicas em blocos rápidos, com baixíssimo overhead e instruções dedicadas no hardware moderno (**AES-NI**).

</details>

---
