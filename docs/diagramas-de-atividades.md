# 🔄 Diagramas de Atividades

[⬅ Voltar ao README Principal](../README.md)

---

## 📌 Sumário
- [1. Visão Geral e Estrutura em Raias](#1-visão-geral-e-estrutura-em-raias)
- [2. Macrofluxo Integrado do Atendimento](#2-macrofluxo-integrado-do-atendimento)
- [3. Fluxos Operacionais Específicos em UML](#3-fluxos-operacionais-específicos-em-uml)
  - [Fluxo 1: Cadastro e Adição à Fila](#31-fluxo-1--cadastro-e-adição-à-fila)
  - [Fluxo 2: Visualização da Fila pelo Paciente](#32-fluxo-2--visualização-da-fila-pelo-paciente)
  - [Fluxo 3: Solicitar Cancelamento de Consulta (Paciente)](#33-fluxo-3--solicitar-cancelamento-de-consulta-paciente)
  - [Fluxo 4: Gerenciamento de Solicitações de Cancelamento (Atendente)](#34-fluxo-4--gerenciamento-de-solicitações-de-cancelamento-atendente)
  - [Fluxo 5: Gerenciamento da Fila e Baixa (Atendente)](#35-fluxo-5--gerenciamento-da-fila-e-baixa-atendente)

---

## 1. Visão Geral e Estrutura em Raias

A modelagem de atividades do sistema **Saude Digital** utiliza o conceito formal de raias (*swimlanes*), delimitando claramente a responsabilidade de cada ator durante o ciclo de atendimento na UBS Rosália Mota Almeida:

| Raia / Ator | Plataforma | Responsabilidades Principais |
| :--- | :--- | :--- |
| **Atendente** | Painel Web Desktop | Cadastro de pacientes, registro de chegada, definição de prioridades, chamada do próximo e baixa de atendimentos. |
| **Sistema Saude Digital** | Backend & Engine WebSocket | Validações de negócio, cálculo de prioridades, controle do estado da fila, envio de alertas instantâneos e auditoria. |
| **Paciente** | App Nativo (Jetpack Compose) | Visualização remota da posição e tempo estimado, solicitação de desistência voluntária e comparecimento. |

---

## 2. Macrofluxo Integrado do Atendimento

Apresenta a dinâmica global ponta a ponta desde a chegada do cidadão até o desfecho clínico (*atendimento realizado* ou *no-show/desistência*):

<p align="center">
  <img src="diagramas/diagrama_de_atividades.png" width="85%" alt="Macrofluxo do Atendimento Saude Digital" />
</p>

### Detalhamento Sequencial do Processo:
1. **Recepção e Entrada**:
   - O atendente busca ou cadastra o paciente e registra sua chegada na UBS.
2. **Processamento da Fila**:
   - O sistema valida as informações cadastrais e calcula a prioridade (legal ou de triagem).
   - O paciente é posicionado na fila e passa a ser monitorado em tempo real.
3. **Acompanhamento do Paciente**:
   - O paciente visualiza sua posição pelo smartphone através do aplicativo nativo (Jetpack Compose).
   - Possui autonomia para aguardar ou acionar o cancelamento voluntário caso desista da consulta.
4. **Chamada do Paciente**:
   - A recepção ou consultório aciona *"Chamar próximo"*.
   - O sistema emite notificação instantânea via WebSocket para o celular do paciente.
5. **Desfecho do Atendimento**:
   - **Se o paciente comparece**: o atendimento é registrado e concluído com sucesso.
   - **Se o paciente não comparece (*No-show*)**: a ausência é registrada e o paciente é removido da fila.

---

## 3. Fluxos Operacionais Específicos em UML

### 3.1 Fluxo 1 — Cadastro e Adição à Fila
Mapeia a entrada do paciente no fluxo da UBS pela recepção, com checagem de cadastro prévio e classificação de prioridade:

- **Raias**: `Atendente` e `Sistema`
- **Sequência de Ações**:
  1. O **Atendente** acessa a tela e insere as informações do paciente.
  2. O **Sistema** verifica se o cadastro já existe:
     - *Se não existir*: habilita o formulário para preenchimento dos dados básicos.
     - *Se já existir*: carrega e exibe os dados cadastrais do paciente automaticamente.
  3. O **Atendente** preenche os dados da consulta e avalia se o paciente é prioridade:
     - *Não prioritário*: mantido na fila convencional.
     - *Prioritário*: registrado como prioritário com justificativa do motivo (idade, gestação, etc.).
  4. O **Atendente** confirma *"Adicionar à fila"*, e o **Sistema** exibe o paciente na lista de espera.

<p align="center">
  <img src="diagramas/Diagrama de atividades /IMG-20261007-WA0027.jpg" width="75%" alt="Diagrama de Atividades - Cadastro e Adição à Fila" />
</p>

---

### 3.2 Fluxo 2 — Visualização da Fila pelo Paciente
Descreve o fluxo de consulta remota da posição e estimativa de espera via dispositivo móvel:

- **Raias**: `Paciente` e `Sistema`
- **Sequência de Ações**:
  1. O **Paciente** acessa o sistema mobile e insere suas credenciais ou token de acesso.
  2. O **Sistema** valida os dados do paciente.
  3. O **Sistema** retorna a posição na fila em tempo real juntamente com as informações da consulta agendada.
  4. O **Paciente** visualiza a sua colocação e acompanha a evolução da fila.

<p align="center">
  <img src="diagramas/Diagrama de atividades /IMG-20261007-WA0025.jpg" width="75%" alt="Diagrama de Atividades - Visualização da Fila" />
</p>

---

### 3.3 Fluxo 3 — Solicitar Cancelamento de Consulta (Paciente)
Permite ao paciente liberar sua vaga na fila voluntariamente caso não possa aguardar:

- **Raias**: `Paciente` e `Sistema`
- **Sequência de Ações**:
  1. O **Paciente** acessa o aplicativo mobile, seleciona a consulta e clica em *"Solicitar cancelamento"*.
  2. O **Sistema** exibe modal de confirmação.
  3. O **Paciente** confirma o cancelamento.
  4. O **Sistema** processa a solicitação e avalia a aprovação:
     - *Se aprovado*: remove o paciente da fila, atualiza o status para cancelado, recalcula a posição dos pacientes seguintes, registra a aprovação e envia notificação de confirmação.
     - *Se não aprovado*: mantém o paciente na fila, registra a recusa e notifica o paciente.
  5. O **Paciente** visualiza o feedback na tela.

<p align="center">
  <img src="diagramas/Diagrama de atividades /IMG-20261007-WA0028.jpg" width="75%" alt="Diagrama de Atividades - Solicitar Cancelamento de Consulta" />
</p>

---

### 3.4 Fluxo 4 — Gerenciamento de Solicitações de Cancelamento (Atendente)
Trata a análise e homologação das saídas solicitadas pelos pacientes pela recepção:

- **Raias**: `Atendente` e `Sistema`
- **Sequência de Ações**:
  1. O **Atendente** acessa a tela de solicitações de cancelamento e checa a existência de pedidos pendentes:
     - *Sem solicitações*: o **Sistema** exibe o aviso *"Não há solicitações"*.
     - *Com solicitações*: o **Atendente** seleciona o pedido e decide aceitar ou recusar:
       - *Recusar*: informa o motivo e o **Sistema** notifica o paciente.
       - *Aceitar*: confirma a solicitação, o **Sistema** remove o paciente da fila, altera o status do atendimento para cancelado, atualiza a ordenação da fila e emite a notificação ao paciente.

<p align="center">
  <img src="diagramas/Diagrama de atividades /IMG-20261007-WA0026.jpg" width="75%" alt="Diagrama de Atividades - Solicitações de Cancelamento" />
</p>

---

### 3.5 Fluxo 5 — Gerenciamento da Fila e Baixa (Atendente)
Controla o avanço dos atendimentos e desfechos de presença ou desistência direta no balcão:

- **Raias**: `Atendente` e `Sistema`
- **Sequência de Ações**:
  1. O **Atendente** acessa o painel de filas com suas credenciais.
  2. Diante da chamada, avalia: *Paciente compareceu à consulta?*
     - *Sim (Compareceu)*: o **Atendente** dá baixa na consulta e o **Sistema** atualiza imediatamente a ordem da fila.
     - *Não (Ausente / Desistente)*: o **Atendente** clica em *"Remover paciente da fila"*, o **Sistema** solicita confirmação, o **Atendente** confirma e o **Sistema** processa a remoção e reorganiza a fila.

<p align="center">
  <img src="diagramas/Diagrama de atividades /IMG-20261007-WA0024.jpg" width="75%" alt="Diagrama de Atividades - Gerenciamento de Fila" />
</p>

---

[⬅ Voltar ao README Principal](../README.md)
