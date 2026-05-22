📡 Módulo 1 — Auditoria de Segurança e Interceptação na Camada de Link e Rede

Este repositório contém a documentação e os scripts de automação para a Prova de Conceito (PoC) do Módulo 1, focada na análise de tráfego passivo e no comportamento lógico de interfaces de rede em Modo Promíscuo.

🎯 Objetivo de Estudo

Demonstrar como a ausência de criptografia de transporte na camada de aplicação (HTTP puro) permite que um agente local intercepte e decodifique credenciais administrativas e dados confidenciais diretamente do meio físico de transmissão. A atividade valida a importância do hardening de placas de rede e da adoção mandatória do HTTPS.

🛠️ Stack Tecnológica do Laboratório

Para garantir que o experimento reflita técnicas de auditoria profissional de sistemas operacionais baseados em Unix, foram utilizadas as seguintes ferramentas no Ubuntu Server (AWS EC2):

tcpdump: Farejador de pacotes (sniffer) nativo do kernel Linux, utilizado para capturar e converter tráfego bruto em caracteres ASCII.

netcat (nc): Canivete suíço de redes corporativas, configurado para manter uma escuta ativa na porta 8080.

curl: Utilitário de linha de comando usado de forma externa (no computador pessoal do cliente) para simular o tráfego de login.

📋 Roteiro de Execução Prática

Etapa 1: Hardening de Hardware e Modo Promíscuo

Aceda ao terminal do seu Ubuntu na AWS.

Descubra qual é a placa de rede ativa do seu servidor executando:

ip link show


Ative o Modo Promíscuo na interface identificada (substitua ens5 se o nome da sua placa for diferente):

sudo ip link set dev ens5 promisc on


Verifique a alteração estrutural no comportamento do hardware com o comando:

ip link show ens5


📸 PONTO DE EVIDÊNCIA 1: Tire uma captura de tela (print) da saída do terminal. Certifique-se de que a flag PROMISC está visível nas propriedades da placa. Salve como print1_nic_promisc.png.

Etapa 2: Escuta e Interceptação Real de Carga Útil

Na primeira aba de conexão do terminal Ubuntu, inicie o ouvinte para que o cliente consiga fechar a conexão de teste:

sudo nc -lk 8080


Na segunda aba de conexão do terminal Ubuntu, ative a espionagem de pacotes na interface convertendo a saída em formato amigável:

sudo tcpdump -i ens5 -A -s 0 'tcp port 8080'


No terminal do seu computador pessoal (máquina física local), dispare a requisição simulando a entrada do usuário:

curl -X POST -d "user=admin&pass=senai123" http://IP_PUBLICO_DA_SUA_EC2:8080/login


Analise a saída que surgiu na tela do tcpdump no Ubuntu.

📸 PONTO DE EVIDÊNCIA 2: Capture a tela mostrando os parâmetros de login (user=admin&pass=senai123) expostos em texto claro. Salve como print2_payload_http.png.

🔬 Análise Técnica de Vulnerabilidade

O que é o Modo Promíscuo?

Sob parâmetros operacionais regulares, o controlador de hardware de uma placa de rede (NIC) atua como um filtro rigoroso na Camada 2 (Link de Dados) do Modelo OSI. A placa lê o cabeçalho Ethernet dos frames elétricos ou ópticos e descarta imediatamente tudo aquilo cujo endereço MAC de destino não coincida com o seu próprio endereço físico gravado de fábrica (salvo pacotes de broadcast ou multicast).

Ao ativar a diretiva PROMISC no kernel do sistema operacional, o driver de rede anula este filtro de hardware. A controladora passa a capturar e empurrar todos os frames físicos que passam pelo barramento para o processador, transformando a máquina em uma escuta passiva de tráfego.

Por que o tráfego HTTP falha em redes corporativas?

O HTTP convencional trafega na Camada de Aplicação sem qualquer tipo de proteção criptográfica. Por se tratar de um protocolo textual, todos os cabeçalhos, rotas e payloads viajam pela rede em formato texto claro (plain text). Uma vez que um atacante consiga se posicionar no mesmo domínio de colisão física e ativar uma escuta promíscua, a confidencialidade do sistema é completamente desfeita, pois não há mecanismos de proteção para mascarar os dados confidenciais do usuário.
