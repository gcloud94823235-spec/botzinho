Lumena Autoplay Farm Local v7.5.7

Correção principal:
- Corrige o painel preso em “Carregando…”.
- O catálogo completo agora usa globalThis em vez de window, permitindo ser carregado tanto no content script quanto no service worker do Chrome.
- A consulta inicial de status é feita imediatamente e possui mensagem de erro clara se o serviço não responder.

Instalação:
1. Extraia a pasta.
2. Abra chrome://extensions.
3. Ative o modo do desenvolvedor.
4. Recarregue a extensão existente ou carregue esta pasta sem compactação.
5. Recarregue a página do Lumena.

Recursos mantidos:
- farm local em todos os mapas catalogados;
- batalha, captura, treinadores e pausa por tier;
- diagnóstico;
- Auto Spin opcional do Volt Casino.


v7.6.0
- Corrige parada permanente após a primeira batalha no modo DOM fallback.
- Quando a posição oficial não está disponível, usa patrulha local reversível sem depender do debugger.
- Reinicia a patrulha após fechar a batalha e aguarda o foco da cena voltar.
- Remove recuperação do debugger em todo tick durante o modo fallback.
