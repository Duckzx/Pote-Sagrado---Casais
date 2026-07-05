## 2026-07-28 - Centralização da Formatação de Moeda BRL
**Learning:** Instanciar `Intl.NumberFormat` repetidamente em componentes que renderizam com alta frequência (como animações de números frame-a-frame) causa overhead de memória e CPU desnecessário.
**Action:** Utilizar um singleton para o formatador de moeda e centralizar seu uso em um utilitário.
