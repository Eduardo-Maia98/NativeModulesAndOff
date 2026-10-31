# Spec-Driven Development

Este repositório segue Spec-Driven Development: a spec é a fonte da verdade. Código nasce da spec, não o contrário.

## Como trabalhamos

1. Escreva ou atualize a spec em `specs/<id>-<nome>/spec.md`.
2. Derive o plano técnico em `plan.md`.
3. Quebre o plano em tarefas pequenas em `tasks.md`.
4. Só então implemente. Se o código precisar divergir, atualize a spec primeiro.

## Convenção de pastas

```
specs/
  constitution.md          # regras do projeto (não negociáveis sem revisão)
  001-offline-first/       # fluxo SQLite + sync
  002-native-modules/      # Turbo Modules nativos
```

Cada feature recebe um prefixo numérico sequencial. Não reaproveite números.

## Status inicial

As specs `001` e `002` descrevem o recorte de estudo. A configuração básica de apps já existe para permitir experimentação; a implementação completa de cada tarefa acontece a partir desses documentos.
