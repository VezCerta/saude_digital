# 🏥 VezCerta — Sistema de Gestão e Acompanhamento de Filas (UBS)

> **Solução Web e Mobile para gerenciamento, organização e acompanhamento em tempo real das filas de atendimento da UBS Rosália Mota Almeida — Quixeramobim.**

[![GitHub Repo](https://img.shields.io/badge/GitHub-trabalho__ES-181717?style=flat&logo=github)](https://github.com/talle5/trabalho_ES)
[![Figma](https://img.shields.io/badge/Figma-Protótipo_Alta_Fidelidade-F24E1E?style=flat&logo=figma)](https://www.figma.com/proto/rKSutBgNt2mCGvUYm8cOHF/Prot%C3%B3tipo-de-Alta-Fidelidade---UBS)
[![Documento](https://img.shields.io/badge/Doc-Especificação_de_Requisitos_v1.0-blue?style=flat&logo=adobeacrobatreader)](./Documento%20de%20Especificação%20de%20Requisitos.pdf)

---

## 👥 Equipe do Projeto

- **Maria Eduarda Spinosa Braga Leandro**
- **Rian Cristhian Brito da Silva**
- **Talles André Lopes Lima**
- **Francisca Issllany de Sousa Braga**
- **João Luiz Bezerra das Chagas**

---

## 💡 Sobre o Projeto

O **VezCerta** é um sistema projetado para sanar os principais gargalos enfrentados nas salas de espera da atenção básica do SUS, tendo como unidade de validação e implantação a **UBS Rosália Mota Almeida em Quixeramobim**.

### ⚠️ O Problema
- Aglomeração constante e desconforto nas salas de espera da unidade básica.
- Ansiedade dos pacientes pela falta de visibilidade da sua colocação e da previsão de chamada.
- Sobrecarga contínua na equipe de recepção e triagem com interrupções frequentes para responder sobre o andamento das filas.

### ✨ A Solução Proposta
Uma plataforma unificada e em tempo real composta por:
1. **Painel Web (Desktop) para Atendentes e Triagem**: registro de chegada, ordenação automática de prioridades legais/clínicas, disparo de chamadas e controle de faltas (*no-shows*).
2. **Aplicação Web/PWA (Mobile) para Pacientes**: acesso instantâneo via QR Code ou link (sem exigência de download em lojas), exibição da posição na fila em tempo real, tempo estimado de espera e notificações instantâneas no momento da chamada.

---

## 📚 Documentação do Projeto

A documentação da **Parte 2 — Figma, Modelos e Arquitetura de Software** foi modularizada para melhor leitura e navegação:

| Documento | Descrição | Principais Tópicos |
| :--- | :--- | :--- |
| 🎨 **[Protótipo, Telas e Validação](docs/prototipo-e-interfaces.md)** | Especificação visual completa e evidências com o cliente | • Links interativos no Figma<br>• Paleta de cores e identidade visual<br>• Telas do Módulo Paciente (Mobile/PWA)<br>• Telas do Módulo Atendente (Web Desktop)<br>• Validação com técnica de enfermagem |
| 🧩 **[Diagrama de Classes](docs/diagrama-de-classes.md)** | Modelagem estrutural orientada a objetos | • Diagrama visual e bloco Mermaid<br>• Entidades: Usuário, Profissional, Paciente, Atendimento, Triagem e Fila<br>• Atributos, operações e relacionamentos |
| 🔄 **[Diagramas de Atividades](docs/diagramas-de-atividades.md)** | Modelagem dinâmica dos fluxos de processo em raias | • Macrofluxo integrado do atendimento<br>• Cadastro e adição à fila<br>• Visualização remota pelo paciente<br>• Solicitação e gestão de cancelamento<br>• Chamada, comparecimento e baixa |
| 🏗️ **[Arquitetura e Tecnologias](docs/arquitetura.md)** | Decisões arquiteturais e justificativas técnicas | • Modelo Cliente-Servidor em 3 Camadas<br>• Módulos de negócio e tempo real (WebSockets)<br>• Stack tecnológica justificada<br>• Repositórios e submódulos Git |

---

## 📦 Repositórios do Código-Fonte

O desenvolvimento da solução está organizado em três frentes independentes integradas via **Submódulos Git**:

```text
trabalho_ES/ (Repositório Principal)
├── trabalho_ES_backend  -> API Node.js / Express / Socket.io / Prisma
├── trabalho_ES_web      -> Painel Recepção React / Vite / Tailwind
└── trabalho_ES_mobile   -> PWA Paciente React / Vite / Tailwind
```

- ⚙️ **[Backend API](https://github.com/talle5/trabalho_ES_backend)**: regras de negócio, persistência no PostgreSQL e notificações em tempo real com `Socket.io`.
- 🖥️ **[Frontend Web](https://github.com/talle5/trabalho_ES_web)**: painel de recepção e triagem voltado para uso desktop.
- 📱 **[Frontend Mobile](https://github.com/talle5/trabalho_ES_mobile)**: PWA responsivo para acompanhamento autônomo pelos pacientes.

### Como clonar o projeto completo:

```bash
git clone --recurse-submodules https://github.com/talle5/trabalho_ES.git
```

Caso já tenha clonado sem os submódulos:
```bash
git submodule update --init --recursive
```

---

## 📂 Estrutura de Diretórios do Repositório

```bash
trabalho_ES/
├── Documento de Especificação de Requisitos.pdf # Documentação de Requisitos (v1.0)
├── Protótipo de Alta Fidelidade - UBS/          # Exportações das telas do Figma
│   ├── mobile/                                  # Módulo Paciente (Mobile First / PWA)
│   └── web/                                     # Módulo Recepção / Triagem (Web Desktop)
├── docs/                                        # Documentação modularizada
│   ├── arquitetura.md                           # Arquitetura, módulos e stack técnica
│   ├── diagrama-de-classes.md                   # Diagrama de Classes UML e Mermaid
│   ├── diagramas-de-atividades.md               # Macrofluxo e diagramas de atividades UML
│   ├── prototipo-e-interfaces.md                # Telas, cores e validação com o cliente
│   ├── cores/                                   # Amostras das cores da paleta
│   └── diagramas/                               # Imagens dos diagramas do sistema
│       ├── diagrama_de_classes.png              # Diagrama de Classes UML
│       ├── diagrama_de_atividades.png           # Macrofluxo Geral de Atividades
│       └── Diagrama de atividades /             # Diagramas de Atividades por fluxo (UML)
├── registro de entrevista.jpeg                  # Evidência da validação com a cliente
├── trabalho_ES_backend/                         # Submódulo do backend
├── trabalho_ES_mobile/                          # Submódulo do app mobile
├── trabalho_ES_web/                             # Submódulo do painel web
└── README.md                                    # Ponto de entrada da documentação
```
