import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Paciente } from './entities/paciente.entity.js';
import { Atendimento } from './entities/atendimento.entity.js';
import { Profissional } from './entities/profissional.entity.js';
import { Triagem } from './entities/triagem.entity.js';
import { SolicitacaoSaida } from './entities/solicitacao-saida.entity.js';
import { Usuario } from './entities/usuario.entity.js';

import { PacientesModule } from './pacientes/pacientes.module.js';
import { FilaModule } from './fila/fila.module.js';
import { SolicitacoesSaidaModule } from './solicitacoes-saida/solicitacoes-saida.module.js';
import { ConsultasModule } from './consultas/consultas.module.js';
import { AuthModule } from './auth/auth.module.js';
import { AutenticacaoGuard } from './auth/autenticacao.guard.js';
import { PacienteAppModule } from './paciente-app/paciente-app.module.js';

// DB_SSL: "false" (padrão, rede interna do Render), "true" (SSL com
// verificação do certificado) ou "no-verify" (SSL sem verificar o certificado)
function configurarSsl(config: ConfigService) {
  const modo = config.get<string>('DB_SSL', 'false');

  if (modo === 'true') {
    return { rejectUnauthorized: true };
  }

  if (modo === 'no-verify') {
    return { rejectUnauthorized: false };
  }

  return false;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, FilaModule, PacientesModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_DATABASE', 'ubs'),
        entities: [
          Paciente,
          Atendimento,
          Profissional,
          Triagem,
          SolicitacaoSaida,
          Usuario,
        ],
        synchronize: false,
        ssl: configurarSsl(config),
      }),
    }),

    FilaModule,
    SolicitacoesSaidaModule,
    ConsultasModule,
    AuthModule,
    PacienteAppModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: AutenticacaoGuard }],
})
export class AppModule {}
