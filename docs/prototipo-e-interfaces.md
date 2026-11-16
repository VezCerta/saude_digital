# 🖥️ Protótipo de Alta Fidelidade, Telas e Validação com o Cliente

[⬅ Voltar ao README Principal](../README.md)

---

## 📌 Sumário
- [1. Links dos Protótipos no Figma](#1-links-dos-protótipos-no-figma)
- [2. Identidade Visual e Paleta de Cores](#2-identidade-visual-e-paleta-de-cores)
- [3. Módulo Paciente (App Nativo Jetpack Compose)](#3-módulo-paciente-app-nativo-jetpack-compose)
- [4. Módulo Recepção / Triagem (Web Desktop)](#4-módulo-recepção--triagem-web-desktop)
- [5. Relatório de Evidências de Validação com o Cliente](#5-relatório-de-evidências-de-validação-com-o-cliente)

---

## 1. Links dos Protótipos no Figma

Os protótipos interativos de alta fidelidade foram desenvolvidos no Figma, contemplando as experiências de uso dos pacientes e dos atendentes:

- 🖥️ **[Protótipo Web — Módulo Atendente / Recepção](https://www.figma.com/proto/rKSutBgNt2mCGvUYm8cOHF/Prot%C3%B3tipo-de-Alta-Fidelidade---UBS?node-id=122-277&p=f&t=Ioykrn16y7Bq6IQJ-1&scaling=min-zoom&content-scaling=fixed&page-id=112%3A241&starting-point-node-id=122%3A277)**
- 📱 **[Protótipo Mobile — Módulo Paciente](https://www.figma.com/proto/rKSutBgNt2mCGvUYm8cOHF/Prot%C3%B3tipo-de-Alta-Fidelidade---UBS?node-id=1-3&p=f&t=vvrlcQXM4hmnSqL1-1&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=1%3A3)**

---

## 2. Identidade Visual e Paleta de Cores

As interfaces foram projetadas seguindo princípios de acessibilidade, contraste adequado para o ambiente de saúde pública e clareza nas ações:

<p align="center">
  <img src="../Protótipo de Alta Fidelidade - UBS/mobile/Identidade Visual.png" width="38%" alt="Identidade Visual UBS" />
</p>

| Amostra | Código Hex | Nome / Função | Descrição e Aplicação |
| :---: | :---: | :--- | :--- |
| ![#004F9F](cores/004F9F.png) | `#004F9F` | **Azul Principal** | Cabeçalho, destaque da posição do usuário e barra inferior de navegação. |
| ![#181E2B](cores/181E2B.png) | `#181E2B` | **Azul Escuro / Grafite** | Tipografia principal, títulos e elementos de alto contraste textual. |
| ![#FA5056](cores/FA5056.png) | `#FA5056` | **Vermelho / Coral** | Ações destrutivas, alertas e botão de desistência da fila. |
| ![#F2F6FC](cores/F2F6FC.png) | `#F2F6FC` | **Azul Muito Claro** | Plano de fundo das páginas para conforto visual. |
| ![#FFF1F2](cores/FFF1F2.png) | `#FFF1F2` | **Rosa Claro** | Preenchimento secundário do botão e modais de cancelamento. |

---

## 3. Módulo Paciente (App Nativo Jetpack Compose)

Aplicativo nativo Android desenvolvido com Jetpack Compose, projetado para oferecer uma experiência fluida, acessível e intuitiva diretamente no smartphone do paciente:

### 3.1 Tela de Login e Cadastro
Interface inicial de autenticação simplificada, permitindo o ingresso com credenciais ou novo registro e redirecionamento direto para o painel de atendimento.

<p align="center">
  <img src="../Protótipo de Alta Fidelidade - UBS/mobile/Tela Login Inicio prototipo.png" width="28%" alt="Login" />
  <img src="../Protótipo de Alta Fidelidade - UBS/mobile/Tela Cadastro.png" width="28%" alt="Cadastro" />
  <img src="../Protótipo de Alta Fidelidade - UBS/mobile/Tela Cadastro Concluido.png" width="28%" alt="Cadastro Concluído" />
</p>

### 3.2 Tela de Fila de Espera
- Cabeçalho em tom azul com marca da aplicação e guias dos atendimentos ativos.
- Listagem central com **Posição** e **Nome**, destacando o usuário com tag azul **"Você"**.
- Botão inferior destacado em vermelho para desistência/cancelamento voluntário da consulta com confirmação.
- Barra de navegação inferior permanente:
  - **Esquerda**: Unidades de Saúde (localização).
  - **Centro**: Fila de Atendimento (seção ativa).
  - **Direita**: Perfil do Usuário.

<p align="center">
  <img src="../Protótipo de Alta Fidelidade - UBS/mobile/Tela Fila Ativa Dr. Márcio Gomes.png" width="28%" alt="Fila Aba 1" />
  <img src="../Protótipo de Alta Fidelidade - UBS/mobile/Tela Fila Ativa Dra. Cristiane Cardoso.png" width="28%" alt="Fila Aba 2" />
  <img src="../Protótipo de Alta Fidelidade - UBS/mobile/Atualização da fila.png" width="28%" alt="Atualização da Fila" />
</p>

### 3.3 Fluxo de Cancelamento de Atendimento
Permite ao paciente liberar sua vaga na fila com aviso prévio de confirmação e feedback imediato de conclusão do cancelamento:

<p align="center">
  <img src="../Protótipo de Alta Fidelidade - UBS/mobile/Aviso de Cancelamento.png" width="28%" alt="Aviso de Cancelamento" />
  <img src="../Protótipo de Alta Fidelidade - UBS/mobile/Processando Cancelamento.png" width="28%" alt="Processando" />
  <img src="../Protótipo de Alta Fidelidade - UBS/mobile/Cancelamento confirmado.png" width="28%" alt="Confirmado" />
</p>

### 3.4 Unidades de Saúde, Perfil e Histórico
- **Unidades de Saúde**: exibe dados geográficos e endereço da UBS vinculada.
- **Perfil do Paciente**: dados cadastrais e opções da conta.
- **Histórico de Atendimentos**: consultas anteriores e status de encerramento de cada chamada.

<p align="center">
  <img src="../Protótipo de Alta Fidelidade - UBS/mobile/Tela Localização de UBS próxima.png" width="28%" alt="Unidades UBS" />
  <img src="../Protótipo de Alta Fidelidade - UBS/mobile/Tela Perfil.png" width="28%" alt="Perfil do Paciente" />
  <img src="../Protótipo de Alta Fidelidade - UBS/mobile/Tela Histórico de consultas.png" width="28%" alt="Histórico" />
</p>

---

## 4. Módulo Recepção / Triagem (Web Desktop)

Interface otimizada para computadores da recepção da UBS, priorizando velocidade de operação e visão simultânea das filas de atendimento:

### 4.1 Tela de Login
Autenticação restrita de atendentes com e-mail corporativo e senha.

<p align="center">
  <img src="../Protótipo de Alta Fidelidade - UBS/web/Login Page.png" width="85%" alt="Tela de Login Recepção" />
</p>

### 4.2 Tela de Fila (Acompanhamento por Médico)
- **Menu Lateral**: navegação principal para alternar entre *Fila*, *Consultas*, *Solicitações de saída*, *Meu perfil*, *Configurações* e *Sair*.
- **Cabeçalho**: mensagem de saudação (*"Bom dia!"*), data atual (*18/06/2026*) e indicação da unidade (*UBS CENTRO*).
- **Barra de Busca**: campo *"Buscar fila por médico ou paciente"* para localização ágil.
- **Visualização da Fila**: navegação por guias superiores organizadas por profissional e especialidade (*Dr. Ricardo Mendes - Clínico Geral*, *Dra. Luiza Freitas - Dentista*, *Dr. Pedro Henrique - Cardiologista*, *Dra. Juliana Silva - Nutricionista*).
- **Tabela de Atendimento**: listagem com Posição (*1º, 2º, 3º*), Nome do Paciente e ação de controle com botão destacado *"Remover paciente"* para gerenciar desistências.

<p align="center">
  <img src="../Protótipo de Alta Fidelidade - UBS/web/Fila Dr. Ricardo Mendes.png" width="85%" alt="Tela de Fila - UBS" />
</p>

### 4.3 Tela de Consultas
- **Navegação**: mantém o menu lateral e inclui breadcrumb no topo (`> Consultas`).
- **Ação Principal**: botão em destaque *"Cadastrar nova consulta"* no canto superior direito.
- **Filtro por Profissional**: abas superiores para alternar a visualização das consultas entre os médicos.
- **Listagem de Agendamentos**: lista os pacientes agendados para a data selecionada com nome completo e CPF, com aviso de reinício automático de registro de fila após o último paciente atendido.

<p align="center">
  <img src="../Protótipo de Alta Fidelidade - UBS/web/Cadastro de Pacientes - Saúde Digital.png" width="85%" alt="Tela de Consultas / Pacientes" />
</p>

### 4.4 Tela de Solicitações de Saída
- **Indicador no Menu**: ícone de notificação com contador dinâmico (ex.: indicador `3` solicitações pendentes).
- **Organização por Médico**: seleção de abas para filtrar as solicitações pelo profissional responsável.
- **Listagem de Solicitações**: cartões com dados do paciente (Nome e CPF), horário da solicitação e botão de ação *"Aceitar Solicitação"*.

<p align="center">
  <img src="../Protótipo de Alta Fidelidade - UBS/web/Solicitação de saida.png" width="85%" alt="Tela de Solicitações de Saída" />
</p>

### 4.5 Tela de Meu Perfil
- **Cabeçalho de Perfil**: foto/avatar, nome completo (*Mariana Costa Ferreira*), cargo (*Atendente · Recepção*), perfil de acesso (*atendente*), unidade vinculada (*UBS CENTRO*) e matrícula (*ATD-0042*).
- **Dados Pessoais e de Contato**: formulário editável para manutenção das informações do usuário.
- **Vínculo Profissional e Segurança**: bloco informativo com os dados de lotação na unidade e gerenciamento de credenciais de acesso.

<p align="center">
  <img src="../Protótipo de Alta Fidelidade - UBS/web/Perfil do atendente dados preenchidos — Saúde Digital.png" width="85%" alt="Tela de Perfil do Atendente" />
</p>

---

## 5. Relatório de Evidências de Validação com o Cliente

- **Cliente / Validadora**: Eliane Brito (Técnica de Enfermagem).
- **Método Utilizado**: Chamada de vídeo no Google Meet com demonstração interativa e navegação pelos fluxos do protótipo.

| Item Testado | Feedback do Cliente | Ação / Ajuste Realizado |
| :--- | :--- | :--- |
| **Protótipo Web (Recepção)** | Aprovou a interface, organização visual das telas e fluxo ágil de navegação. | Mantido conforme apresentado. |
| **Funcionalidades do Protótipo Web** | Considerou que o conjunto de recursos atende com precisão às rotinas diárias da recepção da UBS. | Funcionalidades aprovadas e mantidas. |
| **Protótipo Mobile (Paciente)** | Aprovou a facilidade de acompanhamento e simplicidade da interface mobile. | Mantido conforme apresentado. |
| **Validação Geral** | Aprovou a solução global sem necessidade de alterações estruturais nesta etapa. | Protótipo homologado para a fase de desenvolvimento. |

<p align="center">
  <img src="../registro de entrevista.jpeg" width="30%" alt="Registro da Chamada de Validação com a Cliente" />
  <br />
  <em>Registro da reunião de apresentação e validação com a técnica de enfermagem Eliane Brito.</em>
</p>

---

[⬅ Voltar ao README Principal](../README.md)
