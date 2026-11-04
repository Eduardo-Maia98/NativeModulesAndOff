# Plano 007 — Acessibilidade para leitor de tela

Só props de acessibilidade e área de toque. Sem dependência nova.

## Navegação

`RootTabs`: `tabBarAccessibilityLabel` em cada `Tab.Screen`. Ícone da tab não é focável à parte.

## Adicionar

`AddScreen`:

- cabeçalho, card nativo e card offline: `accessible` + label composto
- `TextInput` local/remoto com label próprio
- botões com role, label distinto, hint e `accessibilityState.disabled` no remoto
- item da lista: bloco título+data agrupado; `Pressable` excluir com label da nota e `minHeight` 44
- vazio e erro remotos focáveis; erro com `accessibilityLiveRegion`

## Tabelas

`LocalTableScreen` / `RemoteTableScreen`: cabeçalho agrupado; título com role `header`; erro remoto com live region.

`NoteTable`: cabeçalho e cada row `accessible` com label das colunas. Células deixam de ser foco individual.
