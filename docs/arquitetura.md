# 🏗️ Arquitetura do Sistema e Stack Tecnológica

[⬅ Voltar ao README Principal](../README.md)

---

## 📌 Sumário
- [1. Visão Geral e Estilo Arquitetural](#1-visão-geral-e-estilo-arquitetural)
- [2. Módulos do Sistema](#2-módulos-do-sistema)
- [3. Tecnologias Utilizadas (Stack Justificada)](#3-tecnologias-utilizadas-stack-justificada)
- [4. Estrutura de Repositórios e Submódulos](#4-estrutura-de-repositórios-e-submódulos)

---

## 1. Visão Geral e Estilo Arquitetural

O sistema **VezCerta** adota o padrão **Cliente-Servidor em Três Camadas**, separando com clareza as interfaces de apresentação, a lógica de negócio/tempo real e a camada de persistência de dados:

```text
┌─────────────────────────────────────────────────────────────┐
│                      CAMADA DE FRONT-END                    │
│   [ Módulo Paciente - Mobile ]     [ Módulo Recepção - Web ]│
│       (Jetpack Compose)               (React + Tailwind)    │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / WSS (WebSocket)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      CAMADA DE BACK-END                     │
│               [ Node.js + TypeScript + Express ]            │
│        • JWT Auth       • Engine de Fila e Prioridades      │
│        • Socket.io      • Cálculo de Estimativa de Espera   │
└──────────────────────────────┬──────────────────────────────┘
                               │ Prisma ORM
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE PERSISTÊNCIA                   │
│                     [ PostgreSQL Database ]                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Módulos do Sistema

O sistema foi modularizado para simplificar o desenvolvimento independente, testes e manutenibilidade:

### 2.1 Módulo de Autenticação e Usuários
- Gerencia o login dos atendentes e profissionais da UBS via JSON Web Tokens (JWT).
- Garante controle de acesso baseado em papéis (RBAC), assegurando que apenas operadores autorizados possam chamar, reorganizar ou remover pacientes da fila.

### 2.2 Módulo de Gestão da Fila
- Controla a sequência de entrada e aplica regras de intercalação entre fila convencional e prioridades legais (idosos, gestantes, pessoas com deficiência).
- Permite ao atendente inserir novos atendimentos, realizar encaixes emergenciais, acionar a chamada do próximo e registrar ausências (*no-shows*).
- Gerencia os estados operacionais dos consultórios (*Ativo* ou *Em Pausa*).

### 2.3 Módulo de Estimativa de Tempo de Espera
- Calcula o tempo aproximado de espera de cada paciente com base em sua posição na fila multiplicada pelo tempo médio histórico daquele médico/consultório.
- Pausa e congela automaticamente a contagem regressiva caso a recepção marque o consultório como *"Em Pausa"*.

### 2.4 Módulo de Notificações em Tempo Real
- Conecta o servidor diretamente ao smartphone do paciente através de WebSockets bidirecionais (`Socket.io`).
- Atualiza o painel do paciente em **menos de 2 segundos** a qualquer movimentação na fila (chamadas, cancelamentos ou encaixes prioritários).

---

## 3. Tecnologias Utilizadas (Stack Justificada)

| Camada | Tecnologia | Justificativa Técnica |
| :--- | :--- | :--- |
| **Interface Paciente (Celular)** | **Kotlin + Jetpack Compose (Android Nativo)** | Toolkit moderno de UI declarativa para Android. Proporciona alto desempenho nativo, animações fluidas, melhor integração com recursos do sistema (como notificações) e excelente legibilidade e contraste para o paciente. |
| **Interface Recepção (Desktop)** | **React + Tailwind CSS** | Interface desktop moderna, ágil e com controle simultâneo de múltiplos consultórios em um único painel. |
| **Back-end (API)** | **Node.js (Express / NestJS) + TypeScript** | Alto desempenho em requisições assíncronas e I/O intensivo. A tipagem estrita do TypeScript reduz bugs no manuseio de dados dos pacientes e ordens de fila. |
| **Comunicação em Tempo Real** | **Socket.io (WebSockets)** | Atualiza o aplicativo do paciente e o painel web instantaneamente assim que a fila anda, sem necessidade de atualização manual. |
| **Banco de Dados** | **PostgreSQL** | SGBD relacional robusto, confiável e compatível com transações ACID essenciais para consistência de filas e histórico médico. |
| **ORM** | **Prisma ORM** | Mapeamento objeto-relacional tipado de ponta a ponta, agilizando queries seguras e migrações do banco. |

---

## 4. Estrutura de Repositórios e Submódulos

O código-fonte da solução está distribuído em submódulos Git integrados a este repositório principal:

| Repositório / Submódulo | Descrição | Tecnologia | Link |
| :--- | :--- | :--- | :--- |
| **`trabalho_ES_backend`** | API REST e servidor WebSocket | Node.js / Express / Socket.io / Prisma | [GitHub Repo](https://github.com/talle5/trabalho_ES_backend) |
| **`trabalho_ES_web`** | Painel administrativo da Recepção/Triagem | React / Vite / Tailwind CSS | [GitHub Repo](https://github.com/talle5/trabalho_ES_web) |
| **`trabalho_ES_mobile`** | Aplicativo Android nativo para os Pacientes | Kotlin / Jetpack Compose | [GitHub Repo](https://github.com/talle5/trabalho_ES_mobile) |

Para clonar o projeto completo com todos os submódulos:

```bash
git clone --recurse-submodules https://github.com/talle5/trabalho_ES.git
```

---

[⬅ Voltar ao README Principal](../README.md)
