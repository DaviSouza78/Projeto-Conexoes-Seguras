# Projeto Conexões Seguras

**Faculdade de Tecnologia SENAI Felix Guisard**  
Curso Superior de Tecnologia em Análise e Desenvolvimento de Sistemas

---

## Visão Geral

Este repositório contém a documentação técnica e as Provas de Conceito (PoCs) desenvolvidas para o projeto **Conexões Seguras**.

O projeto é dividido em três módulos práticos, cada um abordando uma camada distinta da pilha de segurança — da interceptação de tráfego em nível de rede até a proteção de sessões na camada de aplicação.

## Estrutura do Repositório

```
Projeto-Conexoes-Seguras/
│
├── modulo1-sniffing/     # PoC: Sniffing e Interceptação (Camada 2 e 3)
├── modulo2-tls/          # PoC: Criptografia Híbrida e Handshake TLS
├── modulo3-sessao/       # PoC: Segurança na Camada de Aplicação (Sessões)
│
├── evidencias/           # Screenshots e capturas de saída dos experimentos
├── relatorio.pdf         # Relatório Técnico completo (≤ 5 páginas)
└── README.md             # Este arquivo
```

## Módulos

| Módulo | Tema | Ferramentas |
|--------|------|-------------|
| [Módulo 1](Modulo1-Sniffing/Readme.md) | Sniffing e Interceptação | `tcpdump`, `iproute2`, `curl` |
| [Módulo 2](Modulo2-TLS/Readme.md) | Criptografia Híbrida e TLS | `OpenSSL` |
| [Módulo 3](Modulo3-Sessao/Readme.md) | Gestão Segura de Sessões | `Node.js`, `Express.js`, `curl` |

## Ambiente de Laboratório

Todos os experimentos foram executados em uma instância **Ubuntu Server 22.04 LTS** provisionada na infraestrutura da AWS (Cloud9/EC2).

## Entregas

- **Relatório Técnico:** [`relatorio.pdf`](relatorio.pdf)
- **Implementações Práticas:** Pasta de cada módulo contém `README.md` com o passo a passo completo
- **Evidências:** Pasta [`evidencias/`](evidencias) com capturas de saída de cada experimento
- **Documentação Online:** [GitHub Pages](https://davisouza78.github.io/Projeto-Conexoes-Seguras/)
