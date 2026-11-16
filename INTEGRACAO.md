# Guia de integração com o back-end

**API:** https://ubs-backend-90zn.onrender.com  |  **Documentação interativa:** `/docs`

> O plano gratuito do Render "dorme": a primeira chamada depois de um tempo parado pode levar uns 50 segundos. Antes de apresentar, abra `/docs` ou chame `GET /fila/profissionais` para acordar o servidor.

## Regras gerais

- Corpo e resposta em JSON (`Content-Type: application/json`).
- Todas as rotas, exceto os dois logins, exigem o header `Authorization: Bearer <accessToken>`.
- Existem dois tipos de token, e um não funciona no lugar do outro:
  - **Funcionário (web):** `POST /auth/login`
  - **Paciente (app):** `POST /paciente/login`
- O token vale 8 horas. Token ausente, inválido ou do tipo errado responde `401`.
- Erros vêm no formato `{ "message": "...", "error": "...", "statusCode": 400 }`.
- CORS: o back aceita `localhost` em qualquer porta. Para outro endereço (site publicado), peça para incluir em `CORS_ORIGINS`. O app Android não depende de CORS.

## Web (funcionário)

| Tela | Rota | Resposta |
| --- | --- | --- |
| Login | `POST /auth/login` `{ "email", "senha" }` | `{ accessToken, usuario }` |
| Abas dos profissionais | `GET /fila/profissionais` | `[{ id, nome, cargo }]` |
| Fila | `GET /fila?profissionalId=2&busca=ana` | `[{ id, senha, status, paciente, profissional, posicao }]` |
| Remover paciente | `PATCH /fila/{id}/remover` | atendimento com `status: "CANCELADO"` |
| Colocar na fila | `POST /fila` `{ "pacienteId", "senha", "profissionalId" }` | atendimento criado |
| Consultas | `GET /consultas?profissionalId=1&data=2026-11-16` | `[{ id, status, horario, paciente: { nome, cpf }, profissional }]` |
| Cadastrar consulta | `POST /consultas` `{ "pacienteId", "profissionalId" }` | atendimento criado |
| Solicitações de saída | `GET /solicitacoes-saida?profissionalId=1` | `[{ id, status, horarioSolicitacao, atendimentoId, paciente: { nome, cpf }, profissional }]` |
| Bolinha do menu | `GET /solicitacoes-saida/total` | `{ total }` |
| Aceitar solicitação | `PATCH /solicitacoes-saida/{id}/aceitar` | `{ id, status: "ACEITA" }` |
| Buscar paciente | `GET /pacientes?busca=maria` (nome ou CPF) | `[{ id, nome, identificador, telefone, email, dataNascimento, endereco }]` |
| Cadastrar paciente | `POST /pacientes` `{ nome, identificador (CPF), telefone, email, dataNascimento, endereco, senha }` | paciente criado |
| Redefinir senha do paciente | `PATCH /pacientes/{id}/senha` `{ "novaSenha" }` | `{ mensagem }` |
| Meu perfil | `GET /auth/me` | perfil com CPF mascarado |
| Editar perfil | `PATCH /auth/me` `{ nome, email, telefone, nomeSocial }` | perfil atualizado |
| Trocar senha | `PATCH /auth/senha` `{ senhaAtual, novaSenha }` | `{ mensagem }` |

`status` do atendimento: `AGUARDANDO`, `EM_TRIAGEM`, `EM_ATENDIMENTO`, `FINALIZADO`, `CANCELADO`.

## App (paciente)

| Tela | Rota | Resposta |
| --- | --- | --- |
| Login (CPF ou e-mail) | `POST /paciente/login` `{ "login", "senha" }` | `{ accessToken, paciente }` |
| Abas dos profissionais | `GET /paciente/profissionais` | `[{ id, nome, cargo }]` |
| Fila ativa | `GET /paciente/fila?profissionalId=2` | `{ profissional, minhaPosicao, fila: [{ posicao, nome, voce }] }` |
| Meu perfil | `GET /paciente/me` | `{ nome, cpf (mascarado), dataNascimento, email, telefone, endereco }` |
| Histórico de consultas | `GET /paciente/consultas` | `{ total, consultas: [{ id, profissional, data, situacao }] }` |
| Solicitar cancelamento | `POST /paciente/cancelamento` `{ "profissionalId": 2 }` | `{ id, status: "PENDENTE", ... }` |

- A fila só devolve posição, nome e o destaque `voce` (dados pessoais dos outros pacientes não são enviados).
- Se o paciente está em mais de uma fila, o cancelamento exige o `profissionalId`.
- `situacao` do histórico: `Aguardando`, `Em triagem`, `Em atendimento`, `Atendido`, `Desistiu`. A tela mostra só `Atendido` e `Desistiu`.

## Exemplos

**JavaScript (web):**

```js
const API = 'https://ubs-backend-90zn.onrender.com';

async function login(email, senha) {
  const r = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });
  if (!r.ok) throw new Error('E-mail ou senha inválidos');
  const { accessToken } = await r.json();
  localStorage.setItem('token', accessToken);
}

async function api(caminho, opcoes = {}) {
  const r = await fetch(`${API}${caminho}`, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      ...(opcoes.headers ?? {}),
    },
  });
  if (r.status === 401) { /* token ausente ou expirado: voltar para o login */ }
  return r.json();
}

// const fila = await api('/fila?profissionalId=2');
```

**Kotlin (Android, OkHttp):**

```kotlin
val cliente = OkHttpClient()
val base = "https://ubs-backend-90zn.onrender.com"

fun login(cpfOuEmail: String, senha: String): String? {
    val corpo = """{"login":"$cpfOuEmail","senha":"$senha"}"""
        .toRequestBody("application/json".toMediaType())
    val pedido = Request.Builder().url("$base/paciente/login").post(corpo).build()
    cliente.newCall(pedido).execute().use { resposta ->
        if (!resposta.isSuccessful) return null
        return JSONObject(resposta.body!!.string()).getString("accessToken")
    }
}

fun fila(token: String, profissionalId: Int): String {
    val pedido = Request.Builder()
        .url("$base/paciente/fila?profissionalId=$profissionalId")
        .header("Authorization", "Bearer $token")
        .build()
    cliente.newCall(pedido).execute().use { return it.body!!.string() }
}
```

O app precisa da permissão `INTERNET` no `AndroidManifest.xml`. Chame a API fora da thread principal (corrotina ou `Dispatchers.IO`).

## Contas de teste

Peça ao João a senha da funcionária de teste (`mariana.ferreira@example.com`) e do paciente de teste (CPF `111.456.789-22`).
