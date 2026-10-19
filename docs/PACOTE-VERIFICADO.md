# Conferência do pacote exportado

Extração em pasta nova, independente da instalação de desenvolvimento.

- `npm ci --no-audit --no-fund`: 16 dependências instaladas a partir do lockfile.
- `npm test`: 79 testes aprovados, zero falhas (saída em `docs/clean-install-tests.tap`).
- `npm run build`: construção estática concluída.
- `npm run verify`: 72 cenas, contagens 32/20/10/10, zero arquivos obrigatórios ausentes.
- ZIP: CRC de todas as entradas aprovado por `zipfile.testzip()`; SHA-256 externo gerado após a exportação final.

Não foram necessários arquivos da conversa anterior, credenciais ou variáveis privadas.
