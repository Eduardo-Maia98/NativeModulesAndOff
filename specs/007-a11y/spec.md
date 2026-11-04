# Spec 007 — Acessibilidade para leitor de tela

## Problema

As três abas não descrevem controles para TalkBack/VoiceOver. Dois botões “Salvar” soam iguais. “excluir” não diz qual nota. Cards e linhas da tabela viram vários focos soltos.

## Decisão

Publicar árvore de acessibilidade nas telas atuais. Sem SDK novo. Sem mudar fluxo de sync, SQLite ou Turbo Module.

## Regras

- Controle de ação tem `accessibilityRole`, `accessibilityLabel` único e `accessibilityHint` só quando o nome não basta.
- Texto informativo que forma uma unidade (card, cabeçalho, linha da tabela) vira um foco só (`accessible`).
- Título da nota e “excluir” permanecem dois focos. O botão inclui o título da nota no label.
- Erro de rede/API usa `accessibilityLiveRegion` para o TalkBack anunciar sozinho.
- Alvo de toque do excluir ≥ 44×44.

## Critérios de aceite

- TalkBack diferencia “Salvar nota local” e “Salvar nota no backend”.
- TalkBack anuncia “Excluir nota {título}” em cada item da lista.
- Card Turbo Module e card Offline-first são um foco cada.
- Cada linha da tabela Local/Backend é um foco, não cinco células.
- Abas anunciam Adicionar, Local e Backend.
