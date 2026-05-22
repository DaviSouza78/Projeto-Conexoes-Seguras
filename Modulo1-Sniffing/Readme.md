Módulo 1 — PoC: Sniffing e Interceptação de Tráfego

Projeto Conexões Seguras | SENAI Felix Guisard

Objetivo

Demonstrar, em ambiente de nuvem controlado, como o modo promíscuo de uma placa de rede (NIC) permite a captura de pacotes que trafegam pelo segmento físico de rede local, evidenciando a vulnerabilidade crítica de protocolos textuais sem criptografia (como o HTTP puro) frente a ataques de interceptação passiva nas Camadas 2 (Link de Dados) e 3 (Rede).

Ferramenta Usada

Ferramenta

Função

iproute2 (ip)

Gerenciamento de estado e configuração de propriedades da interface de rede

tcpdump

Captura de tráfego bruto e análise de pacotes na camada de rede/transporte

netcat (nc)

Criação de um listener TCP ativo na porta de destino para completar o handshake

curl

Geração externa de tráfego HTTP POST contendo credenciais sensíveis

Ambiente

Plataforma: Amazon Web Services (AWS EC2)

Sistema Operacional: Ubuntu Server 22.04 LTS

Tipo de Instância: t2.micro / t3.micro

Provisionamento da Instância (AWS Console)

Acesse o console da AWS e inicie uma instância EC2 com o sistema Ubuntu Server 22.04 LTS.

Durante a configuração do Security Group, adicione as seguintes regras de entrada (Inbound Rules):

Porta 22 (SSH): Liberada para permitir o acesso ao terminal da instância.

Porta 8080 (Custom TCP): Liberada de qualquer origem (0.0.0.0/0) para permitir que a requisição de teste externa chegue até a porta monitorada da aplicação.

Inicie o terminal da máquina via SSH ou utilizando o EC2 Instance Connect diretamente no navegador.

Passo a Passo

Etapa 1 — Identificação da Interface de Rede Ativa

Identifique o nome lógico da sua placa de rede física ativa no sistema Ubuntu (normalmente mapeada como ens5 ou eth0 na AWS):

ip link show


Etapa 2 — Habilitação do Modo Promíscuo

Altere o comportamento do driver da placa de rede ativa (substitua ens5 pelo nome identificado na etapa anterior) para aceitar todos os quadros circulantes no segmento local:

# Forçar ativação do modo promíscuo
sudo ip link set dev ens5 promisc on

# Validar se a flag PROMISC está ativa nas propriedades da interface
ip link show ens5


📸 PONTO DE EVIDÊNCIA 1: Tire uma captura de tela (print) da saída do terminal de validação. Certifique-se de que a flag PROMISC está visível no cabeçalho das propriedades da placa. Salve o arquivo de imagem na pasta de evidências como print1_nic_promisc.png.

Etapa 3 — Inicialização do Ouvinte Ativo e do Sniffer

Para que o ataque de interceptação funcione e os pacotes completem o fluxo de transporte sem dar conexão recusada ao cliente, abra dois terminais (abas) do seu Ubuntu na AWS:

Na Aba 1 do terminal da AWS: Inicialize uma escuta ativa na porta 8080:

sudo nc -lk 8080


Na Aba 2 do terminal da AWS: Execute o sniffer tcpdump para filtrar e exibir em caracteres legíveis ASCII todo o tráfego que transita por esta porta:

sudo tcpdump -i ens5 -A -s 0 'tcp port 8080'


Etapa 4 — Injeção de Tráfego de Credenciais (Terminal do Cliente)

Abra o terminal de comando da sua máquina física local (seu computador pessoal) e simule a submissão de um formulário de login vulnerável contendo usuário e senha em formato texto limpo:

curl -X POST -d "user=admin&pass=senai123" http://IP_PUBLICO_DA_SUA_EC2:8080/login


Substitua IP_PUBLICO_DA_SUA_EC2 pelo endereço IPv4 público listado nos detalhes da sua instância no console AWS.

Etapa 5 — Encerramento e Restauração de Hardware

Após registrar as evidências na tela do tcpdump, pare o sniffer pressionando Ctrl + C e desative o modo promíscuo para restaurar o comportamento normal de filtragem de hardware da NIC:

sudo ip link set dev ens5 promisc off


Resultado

No terminal da AWS onde o tcpdump estava rodando em escuta ativa, o pacote transmitido é exibido em formato texto plano imediatamente após o disparo do comando do cliente. A captura expõe de forma integral o payload textual:

POST /login HTTP/1.1
Host: 54.224.90.150:8080
User-Agent: curl/7.81.0
Accept: */*
Content-Length: 25
Content-Type: application/x-www-form-urlencoded

user=admin&pass=senai123


📸 PONTO DE EVIDÊNCIA 2: Capture a tela do terminal do Ubuntu exibindo a captura realizada pelo tcpdump onde o payload contendo as credenciais de login (user=admin&pass=senai123) aparece em texto claro legível. Salve a imagem como print2_payload_http.png.

Explicação Técnica do Resultado

O que é o Modo Promíscuo?

Em operação convencional, a placa de rede (NIC) implementa um filtro de endereços MAC baseado em hardware/driver na Camada 2 (Link de Dados) do Modelo OSI. Somente quadros cujo endereço MAC de destino seja idêntico ao endereço gravado de fábrica na placa (ou tráfego global de broadcast) são processados e enviados para a CPU. Todos os demais frames físicos que circulam pelo meio elétrico são descartados silenciosamente pelo controlador para evitar overhead de processamento no sistema hospedeiro.

O modo promíscuo desativa este filtro estrutural no nível do driver. Ao ativar a diretiva PROMISC, a controladora passa a receber indiscriminadamente todos os quadros que chegam ao barramento de rede física, repassando-os diretamente para a pilha de rede do Kernel do sistema operacional. Isso permite o funcionamento de analisadores de pacotes de auditoria de rede.

Por que o HTTP é Vulnerável?

O protocolo HTTP (Hypertext Transfer Protocol) opera estritamente na Camada de Aplicação sem possuir nenhuma camada intermediária de cifra ou encapsulamento no nível de transporte. Por ser um protocolo de texto plano, seus dados viajam pela infraestrutura de rede expostos de forma literal. Quando as credenciais são enviadas sob HTTP puro:

Toda a mensagem trafega em formato legível de caracteres ASCII.

Qualquer agente posicionado no mesmo barramento ou segmento de rede física local que ative um sniffer em modo promíscuo coletará dados sensíveis sem esforço.

O ataque de sniffing passivo não gera anomalias nas conexões, sendo impossível de ser detectado pela máquina de origem.

A solução definitiva contra esta exposição é o encapsulamento sob o protocolo TLS/HTTPS, detalhado no Módulo 2.
