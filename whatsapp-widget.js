(function (window, document) {
    'use strict';

    const DEFAULTS = {
        name: 'Atendimento',
        role: 'Normalmente responde rapidamente',
        image: '',
        message: 'Olá! Como podemos ajudar?',
        phone: '',
        whatsappMessage: 'Olá! Vim pelo site e gostaria de mais informações.',
        buttonText: 'Iniciar conversa',
        color: '#25d366',
        position: 'right',
        autoOpen: true,
        delay: 2500,
        typingDelay: 900,
        typingSpeed: 32,
        showOncePerSession: true,
        sessionKey: 'whatsapp-widget-greeting-shown'
    };

    const ICONS = {
        whatsapp: '<svg viewBox="0 0 32 32" aria-hidden="true"><path fill="currentColor" d="M16.04 3A12.79 12.79 0 0 0 5.17 22.53L3.36 29l6.62-1.74A12.8 12.8 0 1 0 16.04 3Zm0 23.27c-1.92 0-3.8-.53-5.43-1.52l-.39-.23-3.93 1.03 1.05-3.83-.25-.4A10.45 10.45 0 1 1 16.04 26.27Zm5.73-7.83c-.31-.16-1.86-.92-2.15-1.02-.29-.1-.5-.16-.71.16-.21.31-.81 1.02-.99 1.23-.18.21-.37.24-.68.08-.31-.16-1.33-.49-2.53-1.56a9.43 9.43 0 0 1-1.75-2.18c-.18-.31-.02-.48.14-.64.14-.14.31-.37.47-.55.16-.18.21-.31.31-.52.11-.21.05-.39-.03-.55-.08-.16-.71-1.7-.97-2.33-.25-.61-.51-.53-.71-.54h-.6c-.21 0-.55.08-.84.39-.29.31-1.1 1.08-1.1 2.63s1.13 3.05 1.29 3.26c.16.21 2.22 3.39 5.38 4.75.75.32 1.34.52 1.8.66.76.24 1.44.21 1.99.13.61-.09 1.86-.76 2.12-1.5.26-.73.26-1.36.18-1.49-.08-.13-.29-.21-.6-.37Z"/></svg>',
        close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 5 14 14M19 5 5 19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
        send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3.4 20.4 21.85 12 3.4 3.6l-.01 6.53L16.57 12 3.39 13.87l.01 6.53Z"/></svg>'
    };

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function validPosition(position) {
        return position === 'left' ? 'left' : 'right';
    }

    class Widget {
        constructor(options) {
            this.options = { ...DEFAULTS, ...(options || {}) };
            this.options.position = validPosition(this.options.position);
            this.timers = [];
            this.typingTimer = null;
            this.state = 'button';
            this.render();
            this.bindEvents();
            this.scheduleGreeting();
        }

        render() {
            const o = this.options;
            const avatar = o.image
                ? '<img class="waw-avatar-image" src="' + escapeHtml(o.image) + '" alt="' + escapeHtml(o.name) + '">'
                : '<span class="waw-avatar-fallback">' + escapeHtml(o.name.charAt(0).toUpperCase()) + '</span>';

            this.root = document.createElement('div');
            this.root.className = 'waw-widget waw-position-' + o.position;
            this.root.style.setProperty('--waw-color', o.color);
            this.root.innerHTML = `
                <section class="waw-teaser" aria-label="Mensagem do atendimento" aria-hidden="true">
                    <button class="waw-teaser-close" type="button" aria-label="Fechar mensagem">${ICONS.close}</button>
                    <div class="waw-avatar waw-avatar-small">${avatar}</div>
                    <div class="waw-teaser-content">
                        <strong>${escapeHtml(o.name)}</strong>
                        <span>${escapeHtml(o.role)}</span>
                        <div class="waw-teaser-message" aria-live="polite">
                            <span class="waw-typing" aria-label="Digitando"><i></i><i></i><i></i></span>
                            <span class="waw-typed-text"></span><span class="waw-caret" aria-hidden="true"></span>
                        </div>
                    </div>
                </section>

                <section class="waw-chat" aria-label="Conversa no WhatsApp" aria-hidden="true">
                    <header class="waw-chat-header">
                        <div class="waw-avatar">${avatar}</div>
                        <div class="waw-profile">
                            <strong>${escapeHtml(o.name)}</strong>
                            <span>${escapeHtml(o.role)}</span>
                        </div>
                        <button class="waw-chat-close" type="button" aria-label="Fechar conversa">${ICONS.close}</button>
                    </header>
                    <div class="waw-chat-body">
                        <div class="waw-message">
                            <p>${escapeHtml(o.message).replace(/\n/g, '<br>')}</p>
                            <time></time>
                        </div>
                    </div>
                    <footer class="waw-chat-footer">
                        <a class="waw-start" href="#" target="_blank" rel="noopener noreferrer">
                            ${ICONS.send}<span>${escapeHtml(o.buttonText)}</span>
                        </a>
                    </footer>
                </section>

                <button class="waw-button" type="button" aria-label="Abrir conversa no WhatsApp" aria-expanded="false">
                    <span class="waw-icon-whatsapp">${ICONS.whatsapp}</span>
                    <span class="waw-icon-close">${ICONS.close}</span>
                    <span class="waw-notification" aria-hidden="true"></span>
                </button>
            `;

            document.body.appendChild(this.root);
            this.teaser = this.root.querySelector('.waw-teaser');
            this.chat = this.root.querySelector('.waw-chat');
            this.button = this.root.querySelector('.waw-button');
            this.typedText = this.root.querySelector('.waw-typed-text');
            this.typing = this.root.querySelector('.waw-typing');
            this.caret = this.root.querySelector('.waw-caret');
            this.root.querySelector('.waw-start').href = this.whatsappUrl();
            this.root.querySelector('.waw-message time').textContent = this.currentTime();
        }

        bindEvents() {
            this.onButtonClick = () => this.state === 'chat' ? this.closeChat() : this.openChat();
            this.onTeaserClick = (event) => {
                if (!event.target.closest('.waw-teaser-close')) this.openChat();
            };
            this.onKeyDown = (event) => {
                if (event.key === 'Escape') {
                    if (this.state === 'chat') this.closeChat();
                    else if (this.state === 'teaser') this.closeTeaser();
                }
            };

            this.button.addEventListener('click', this.onButtonClick);
            this.teaser.addEventListener('click', this.onTeaserClick);
            this.root.querySelector('.waw-teaser-close').addEventListener('click', () => this.closeTeaser());
            this.root.querySelector('.waw-chat-close').addEventListener('click', () => this.closeChat());
            document.addEventListener('keydown', this.onKeyDown);
        }

        scheduleGreeting() {
            if (!this.options.autoOpen || this.wasShown()) return;
            this.timers.push(window.setTimeout(() => this.openTeaser(), Math.max(0, this.options.delay)));
        }

        openTeaser() {
            if (this.state === 'chat') return;
            this.clearTyping();
            this.state = 'teaser';
            this.root.classList.add('waw-teaser-open');
            this.teaser.setAttribute('aria-hidden', 'false');
            this.markShown();
            this.typedText.textContent = '';
            this.typing.hidden = false;
            this.caret.hidden = true;
            this.timers.push(window.setTimeout(() => this.typeMessage(), Math.max(0, this.options.typingDelay)));
        }

        typeMessage() {
            const message = String(this.options.message);
            let index = 0;
            this.typing.hidden = true;
            this.caret.hidden = false;

            const typeNext = () => {
                if (this.state !== 'teaser') return;
                this.typedText.textContent = message.slice(0, index + 1);
                index += 1;
                if (index < message.length) {
                    this.typingTimer = window.setTimeout(typeNext, Math.max(8, this.options.typingSpeed));
                } else {
                    this.caret.hidden = true;
                }
            };
            typeNext();
        }

        closeTeaser() {
            this.clearTyping();
            this.state = 'button';
            this.root.classList.remove('waw-teaser-open');
            this.teaser.setAttribute('aria-hidden', 'true');
        }

        openChat() {
            this.clearTyping();
            this.state = 'chat';
            this.root.classList.remove('waw-teaser-open');
            this.root.classList.add('waw-chat-open');
            this.teaser.setAttribute('aria-hidden', 'true');
            this.chat.setAttribute('aria-hidden', 'false');
            this.button.setAttribute('aria-expanded', 'true');
            this.button.setAttribute('aria-label', 'Fechar conversa');
            this.markShown();
        }

        closeChat() {
            this.state = 'button';
            this.root.classList.remove('waw-chat-open');
            this.chat.setAttribute('aria-hidden', 'true');
            this.button.setAttribute('aria-expanded', 'false');
            this.button.setAttribute('aria-label', 'Abrir conversa no WhatsApp');
            this.button.focus();
        }

        whatsappUrl() {
            const phone = String(this.options.phone).replace(/\D/g, '');
            const text = encodeURIComponent(this.options.whatsappMessage || '');
            return 'https://wa.me/' + phone + (text ? '?text=' + text : '');
        }

        currentTime() {
            return new Intl.DateTimeFormat('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            }).format(new Date());
        }

        wasShown() {
            if (!this.options.showOncePerSession) return false;
            try { return sessionStorage.getItem(this.options.sessionKey) === '1'; }
            catch (_) { return false; }
        }

        markShown() {
            if (!this.options.showOncePerSession) return;
            try { sessionStorage.setItem(this.options.sessionKey, '1'); }
            catch (_) { /* Navegador sem sessionStorage disponível. */ }
        }

        clearTyping() {
            if (this.typingTimer) window.clearTimeout(this.typingTimer);
            this.typingTimer = null;
        }

        destroy() {
            this.timers.forEach((timer) => window.clearTimeout(timer));
            this.clearTyping();
            document.removeEventListener('keydown', this.onKeyDown);
            this.root.remove();
        }
    }

    let activeWidget = null;

    window.WhatsAppWidget = {
        init(options) {
            if (activeWidget) activeWidget.destroy();
            activeWidget = new Widget(options);
            return activeWidget;
        },
        destroy() {
            if (activeWidget) activeWidget.destroy();
            activeWidget = null;
        }
    };
})(window, document);
