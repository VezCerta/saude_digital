import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { JwtAuthGuard } from './jwt-auth.guard.js';

type Requisicao = { method?: string; path?: string; url?: string };

// Rotas abertas, sem login
const ROTAS_PUBLICAS = ['GET /', 'POST /auth/login', 'POST /paciente/login'];

// Guard global: toda rota exige o token do FUNCIONÁRIO, exceto as rotas
// públicas e as que já declaram o próprio guard (@UseGuards), como as do
// app do paciente e as de perfil.
@Injectable()
export class AutenticacaoGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly funcionarioGuard: JwtAuthGuard,
  ) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Requisicao>();
    let normalizado = (request.path ?? request.url ?? '/').split('?')[0];
    while (normalizado.length > 1 && normalizado.endsWith('/')) {
      normalizado = normalizado.slice(0, -1);
    }

    if (ROTAS_PUBLICAS.includes(`${request.method} ${normalizado}`)) {
      return true;
    }

    const proprios = this.reflector.getAllAndOverride<unknown[] | undefined>(
      '__guards__',
      [context.getHandler(), context.getClass()],
    );

    if (proprios && proprios.length > 0) {
      return true;
    }

    return this.funcionarioGuard.canActivate(context);
  }
}
