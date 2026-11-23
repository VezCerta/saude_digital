# Saúde Digital - Frontend (React Router + Tailwind CSS)

Estrutura organizada por camadas técnicas refinadas para desenvolvimento web em React Router e Tailwind CSS.

---

## 📁 Estrutura de Diretórios

```text
web/
├── app/
│   ├── assets/                   # Imagens, logotipos e ícones estáticos
│   │   ├── avatar.png
│   │   └── Logo_1.svg
│   ├── components/               # Componentes React separados por responsabilidade
│   │   ├── ui/                   # Componentes visuais genéricos e reutilizáveis
│   │   │   ├── AvisoSucesso.tsx
│   │   │   ├── Breadcrumb.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── CampoSelect.tsx
│   │   │   ├── CampoTexto.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── ModalConfirmacao.tsx
│   │   │   ├── SecaoRecolhivel.tsx
│   │   │   ├── TextField.tsx
│   │   │   └── index.ts
│   │   ├── fila/                 # Componentes de domínio da fila de atendimento
│   │   │   ├── AbasProfissionais.tsx
│   │   │   ├── TabelaFila.tsx
│   │   │   └── index.ts
│   │   ├── perfil/               # Componentes de domínio do perfil do atendente
│   │   │   ├── PerfilAtendente.tsx
│   │   │   └── index.ts
│   │   ├── saidas/               # Componentes de domínio de solicitações de saída
│   │   │   ├── ListaSolicitacoes.tsx
│   │   │   └── index.ts
│   │   └── index.ts              # Barrel central de componentes
│   ├── layouts/                  # Estruturas e molduras de tela da aplicação
│   │   ├── components/           # Partes estruturais dos layouts
│   │   │   ├── Footer.tsx
│   │   │   ├── HeaderBar.tsx
│   │   │   └── Navbar.tsx
│   │   ├── AuthLayout.tsx        # Layout das telas de autenticação
│   │   ├── MainLayout.tsx        # Layout principal (Navbar + HeaderBar + Conteúdo + Footer)
│   │   └── index.ts
│   ├── pages/                    # Telas / Páginas registradas em routes.ts
│   │   ├── auth/
│   │   │   └── login.tsx         # /login
│   │   ├── consultas/
│   │   │   ├── index.tsx         # /consulta
│   │   │   └── nova.tsx          # /consulta/nova
│   │   ├── fila.tsx              # /fila
│   │   ├── home.tsx              # /
│   │   ├── perfil.tsx            # /perfil
│   │   └── saidas.tsx            # /saidas
│   ├── services/                 # Comunicação com APIs e regras de dados
│   │   ├── api.ts                # Cliente HTTP base (fetch com tratamento de erro)
│   │   ├── cep.ts                # Consulta de endereço via ViaCEP
│   │   ├── consultas.ts          # Regras e mocks de consultas
│   │   ├── fila.ts               # Regras e mocks da fila de atendimento
│   │   ├── solicitacoes.ts       # Regras e mocks de solicitações de saída
│   │   └── index.ts
│   ├── types/                    # Interfaces e tipos TypeScript compartilhados
│   │   ├── cep.ts
│   │   ├── consulta.ts
│   │   ├── fila.ts
│   │   ├── solicitacao.ts
│   │   └── index.ts
│   ├── utils/                    # Funções utilitárias puras
│   │   ├── formatacao.ts         # Formatação de moeda e datas (pt-BR)
│   │   ├── mascaras.ts           # Máscaras de CPF, SUS, telefone e CEP
│   │   └── index.ts              # Helper 'cn' e re-exports
│   ├── app.css                   # Configurações de estilo global com Tailwind CSS
│   ├── root.tsx                  # Componente raiz da aplicação (HTML shell)
│   └── routes.ts                 # Registro e mapeamento das rotas
├── public/                       # Arquivos estáticos servidos diretamente na raiz
│   └── favicon.ico
├── Dockerfile                    # Configuração Docker
├── package.json                  # Dependências e scripts
├── react-router.config.ts        # Configurações do React Router
├── sonar-project.properties      # Configuração do SonarQube
├── tsconfig.json                 # Configuração do TypeScript e alias (@/*)
└── vite.config.ts                # Configuração de build do Vite
```

---

## 🎯 Onde colocar cada coisa?

- **Quer criar uma nova página/tela?**
  1. Crie o arquivo em `app/pages/minha-pagina.tsx` (ou em uma subpasta por módulo, como `app/pages/consultas/`).
  2. Registre a rota em `app/routes.ts`:
     ```ts
     route("minha-url", "pages/minha-pagina.tsx")
     ```
- **Quer criar um componente visual reutilizável (botão, input, modal, card)?**
  - Crie dentro de `app/components/ui/` e exporte em `app/components/ui/index.ts`.
- **Quer criar um componente específico de um domínio (fila, consultas, saídas, perfil)?**
  - Crie dentro de `app/components/<dominio>/` e exporte no `index.ts` da pasta.
- **Quer alterar o menu, cabeçalho ou rodapé?**
  - Altere os arquivos em `app/layouts/components/` ou os wrappers em `app/layouts/` (`MainLayout.tsx`, `AuthLayout.tsx`).
- **Quer adicionar ou compartilhar interfaces/tipos de domínio?**
  - Defina em `app/types/` e re-exporte em `app/types/index.ts`.
- **Quer chamar uma API ou adicionar regras de dados?**
  - Use ou expanda o cliente em `app/services/api.ts` e crie o serviço em `app/services/`.
- **Quer adicionar imagens ou logos?**
  - Coloque em `app/assets/` e importe usando `import logo from "@/assets/meu-logo.svg"`.

---

## 🚀 Como Executar

```bash
# Instalar dependências
npm install

# Rodar ambiente de desenvolvimento
npm run dev

# Checagem de tipos e compilação
npm run typecheck
npm run build
```
