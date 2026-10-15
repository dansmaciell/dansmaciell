# Gerador dos SVGs do perfil

Todos os SVGs animados de `../assets` são gerados por `gen.mjs` (Node 18+, sem dependências): pixel art 8-bit em azul, prata, vermelho e amarelo, com fonte 5x7 própria.

```bash
node generator/gen.mjs        # regenera ../assets/*.svg
node generator/serve.mjs      # prévia local em http://localhost:8766/generator/preview.html
```

- `src/` — prints do Simula SISU, miniaturas pixeladas da RDL e do Mind Health e ícones da stack.
- Para mudar os níveis da seção STATUS, edite a lista `stats` em `status()`.
