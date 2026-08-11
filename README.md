# WhatsApp Widget

Widget reutilizável em JavaScript puro, sem dependências. Ele mostra um botão flutuante, abre uma mensagem automática com indicador e efeito de digitação e, ao receber um clique, exibe uma pequena conversa antes de encaminhar o visitante ao WhatsApp.

Demo: https://kaikdev.github.io/whatsapp-widget-reutilizavel/demo.html

## Instalação

Copie `whatsapp-widget.css` e `whatsapp-widget.js` para o projeto e inclua-os antes do fechamento de `</body>`:

```html
<link rel="stylesheet" href="/css/whatsapp-widget.css">

<script src="/js/whatsapp-widget.js"></script>
<script>
    WhatsAppWidget.init({
        name: 'Nome da empresa',
        role: 'Proprietário do negócio',
        image: '/img/perfil-whatsapp.webp',
        message: 'Olá! Deixe sua pergunta, que respondo na sequência.',
        phone: '5511999999999',
        whatsappMessage: 'Olá! Vim pelo site e gostaria de mais informações.'
    });
</script>
```

O telefone deve conter código do país e DDD. Pontuação é aceita porque o widget remove automaticamente tudo o que não for número.

## Opções

| Opção | Padrão | Descrição |
|---|---:|---|
| `name` | `Atendimento` | Nome exibido nos dois cartões. |
| `role` | `Normalmente responde rapidamente` | Texto abaixo do nome. |
| `image` | vazio | Caminho ou URL da imagem de perfil. Sem imagem, mostra a inicial do nome. |
| `message` | `Olá! Como podemos ajudar?` | Mensagem recebida que é digitada na tela. |
| `phone` | vazio | Número que receberá o contato, com código do país. |
| `whatsappMessage` | texto padrão | Mensagem preenchida no WhatsApp do visitante. |
| `buttonText` | `Iniciar conversa` | Texto do botão final. |
| `color` | `#25d366` | Cor principal do widget. |
| `position` | `right` | Posição: `right` ou `left`. |
| `autoOpen` | `true` | Abre automaticamente o aviso compacto. |
| `delay` | `2500` | Espera, em milissegundos, antes do aviso. |
| `typingDelay` | `900` | Tempo exibindo os três pontos antes de digitar. |
| `typingSpeed` | `32` | Intervalo, em milissegundos, entre as letras. |
| `showOncePerSession` | `true` | Evita repetir a abertura automática durante a sessão. |
| `sessionKey` | `whatsapp-widget-greeting-shown` | Chave usada no `sessionStorage`. |

Para testar repetidamente durante o desenvolvimento, defina `showOncePerSession: false`.

## Laravel Blade

Os arquivos podem ficar em `public/css` e `public/js`:

```blade
<link rel="stylesheet" href="{{ asset('css/whatsapp-widget.css') }}">

<script src="{{ asset('js/whatsapp-widget.js') }}"></script>
<script>
    WhatsAppWidget.init({
        name: @json(config('app.name')),
        image: @json(asset('img/perfil-whatsapp.webp')),
        message: 'Olá! Como podemos ajudar?',
        phone: '5511999999999'
    });
</script>
```

## Controle manual

Uma nova chamada de `WhatsAppWidget.init()` substitui a instância atual. Para remover o widget:

```javascript
WhatsAppWidget.destroy();
```
