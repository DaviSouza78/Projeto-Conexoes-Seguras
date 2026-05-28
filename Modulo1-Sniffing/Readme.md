#  Módulo 1 — Sniffing e Interceptação de Tráfego

##  Objetivo

Demonstrar, em ambiente de nuvem controlado, como o **modo promíscuo** de uma placa de rede (NIC) permite a captura de pacotes que trafegam pelo segmento físico de rede local, evidenciando a vulnerabilidade crítica de protocolos textuais sem criptografia (como o **HTTP puro**) frente a ataques de interceptação passiva nas **Camadas 2 (Link de Dados)** e **3 (Rede)**.

##  Ferramentas Utilizadas

| Ferramenta | Função |
| :--- | :--- |
| `iproute2` (`ip`) | Gerenciamento de estado e configuração de propriedades da interface de rede |
| `tcpdump` | Captura de tráfego bruto e análise de pacotes na camada de rede/transporte |
| `netcat` (`nc`) | Criação de um listener TCP ativo na porta de destino para completar o handshake |
| `curl` | Geração externa de tráfego HTTP POST contendo credenciais sensíveis |

##  Provisionamento da Instância (AWS Console)

1. Acesse o console da AWS e inicie uma instância EC2 com **Ubuntu Server 22.04 LTS**.
2. No **Security Group**, adicione as seguintes regras de entrada (*Inbound Rules*):

   | Porta | Tipo | Origem | Finalidade |
   | :---: | :--- | :--- | :--- |
   | **22** | SSH | — | Acesso ao terminal da instância |
   | **8080** | Custom TCP | `0.0.0.0/0` | Requisição de teste externa até a porta monitorada |

3. Inicie o terminal via **SSH** ou pelo **EC2 Instance Connect** diretamente no navegador.

##  Passo a Passo

### Etapa 1 — Identificação da Interface de Rede Ativa

Identifique o nome lógico da placa de rede física ativa (normalmente `ens5` ou `eth0` na AWS):

```bash
ip link show
```

### Etapa 2 — Habilitação do Modo Promíscuo

Altere o comportamento do driver da NIC para aceitar **todos** os quadros do segmento local (substitua `ens5` pelo nome identificado):

```bash
# Forçar ativação do modo promíscuo
sudo ip link set dev ens5 promisc on

# Validar se a flag PROMISC está ativa nas propriedades da interface
ip link show ens5
```


### Etapa 3 — Inicialização do Ouvinte Ativo e do Sniffer

Para que os pacotes completem o fluxo de transporte sem "conexão recusada", abra **dois terminais (abas)** no Ubuntu da AWS:

**Aba 1 — escuta ativa na porta 8080:**

```bash
sudo nc -lk 8080
```

**Aba 2 — sniffer `tcpdump` filtrando o tráfego da porta em ASCII legível:**

```bash
sudo tcpdump -i ens5 -A -s 0 'tcp port 8080'
```

### Etapa 4 — Injeção de Tráfego de Credenciais (Cliente)

No terminal da sua **máquina física local**, simule o envio de um login vulnerável em texto limpo:

```bash
curl -X POST -d "user=admin&pass=senai123" http://IP_PUBLICO_DA_SUA_EC2:8080/login
```

>  Substitua `IP_PUBLICO_DA_SUA_EC2` pelo endereço IPv4 público da instância (visível nos detalhes da EC2 no console AWS).

### Etapa 5 — Encerramento e Restauração de Hardware

Pare o sniffer com `Ctrl + C` e desative o modo promíscuo:

```bash
sudo ip link set dev ens5 promisc off
```

##  Resultado

No terminal da AWS rodando o `tcpdump`, o pacote é exibido em **texto plano** logo após o disparo do cliente, expondo o payload integralmente:

```http
POST /login HTTP/1.1
Host: 54.224.90.150:8080
User-Agent: curl/7.81.0
Accept: */*
Content-Length: 25
Content-Type: application/x-www-form-urlencoded

user=admin&pass=senai123
```


##  Explicação Técnica

<details>
<summary><strong>O que é o Modo Promíscuo?</strong></summary>

<br>

Em operação convencional, a NIC implementa um filtro de endereços **MAC** baseado em hardware/driver na **Camada 2** do Modelo OSI. Apenas quadros cujo MAC de destino seja idêntico ao da placa (ou tráfego de *broadcast*) são processados e enviados à CPU. Os demais frames físicos são descartados silenciosamente para evitar overhead.

O **modo promíscuo desativa este filtro** no nível do driver: a controladora passa a receber indiscriminadamente todos os quadros que chegam ao barramento, repassando-os direto à pilha de rede do Kernel — viabilizando analisadores de pacotes de auditoria.

</details>

<details>
<summary><strong>Por que o HTTP é Vulnerável?</strong></summary>

<br>

O **HTTP** opera estritamente na Camada de Aplicação, sem qualquer cifra ou encapsulamento no transporte. Por ser texto plano, os dados viajam expostos de forma literal. Sob HTTP puro:

- Toda a mensagem trafega em caracteres ASCII legíveis.
- Qualquer agente no mesmo segmento físico com sniffer em modo promíscuo coleta dados sensíveis sem esforço.
- O *sniffing* passivo **não gera anomalias** na conexão — é indetectável pela origem.

>  A solução definitiva é o encapsulamento sob **TLS/HTTPS**, detalhado no **Módulo 2**.

</details>

---
