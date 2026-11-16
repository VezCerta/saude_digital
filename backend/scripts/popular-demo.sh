#!/usr/bin/env bash
# Cria a fila de demonstração do dia. As rotas agora exigem login do atendente.
# Uso: SENHA='<senha do atendente>' bash scripts/popular-demo.sh
URL=${URL:-https://ubs-backend-90zn.onrender.com}
EMAIL=${EMAIL:-mariana.ferreira@example.com}
SENHA=${SENHA:?Informe a senha: SENHA='...' bash scripts/popular-demo.sh}

TOKEN=$(curl -s -X POST "$URL/auth/login" -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"senha\":\"$SENHA\"}" \
  | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Login falhou: confira o e-mail e a senha."
  exit 1
fi

SUFIXO=$(date +%H%M%S)

for p in 1 2 3 4 5; do
  curl -s -X POST "$URL/fila" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"pacienteId\":$p,\"senha\":\"L$p-$SUFIXO\",\"profissionalId\":2}" > /dev/null
done

for p in 6 7 8; do
  curl -s -X POST "$URL/fila" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    -d "{\"pacienteId\":$p,\"senha\":\"R$p-$SUFIXO\",\"profissionalId\":1}" > /dev/null
done

echo "Fila de demonstração criada."
