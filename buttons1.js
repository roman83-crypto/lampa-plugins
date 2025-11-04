Lampa.Platform.tv();
(function () {
    'use strict';

    function startPlugin() {
        // Ініціалізація full_btn_priority
        if (Lampa.Storage.get('full_btn_priority') === undefined) {
            Lampa.Storage.set('full_btn_priority', '{}');
        }

        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                setTimeout(function () {
                    var fullContainer = e.object.activity.render();
                    var targetContainer = fullContainer.find('.full-start-new__buttons');

                    // Видаляємо кнопку Play
                    fullContainer.find('.button--play').remove();

                    // Усі кнопки
                    var allButtons = fullContainer.find('.buttons--container .full-start__button')
                        .add(targetContainer.find('.full-start__button'));

                    // Категорії
                    var onlineButtons  = allButtons.filter(function () { return ($(this).attr('class') || '').includes('online'); });
                    var torrentButtons = allButtons.filter(function () { return ($(this).attr('class') || '').includes('torrent'); });
                    var trailerButtons = allButtons.filter(function () { return ($(this).attr('class') || '').includes('trailer'); });

                    var buttonOrder = [];

                    // online → torrent → trailer
                    onlineButtons.each(function () { buttonOrder.push($(this)); });
                    torrentButtons.each(function () { buttonOrder.push($(this)); });
                    trailerButtons.each(function () { buttonOrder.push($(this)); });

                    // Інші кнопки – клон
                    allButtons.filter(function () {
                        var cls = $(this).attr('class') || '';
                        return !cls.includes('online') && !cls.includes('torrent') && !cls.includes('trailer');
                    }).each(function () {
                        buttonOrder.push($(this).clone(true));
                    });

                    // Очищаємо контейнер
                    targetContainer.empty();

                    /* ---------- СТИЛІ ДЛЯ ПЕРЕНОСУ ---------- */
                    targetContainer.css({
                        'display': 'flex',
                        'flex-wrap': 'wrap',
                        'gap': '10px',
                        'justify-content': 'flex-start',
                        'padding': '10px',
                        'overflow': 'visible'
                    });

                    /* ---------- ДОДАЄМО КНОПКИ З ПРАВИЛЬНИМ ТЕКСТОМ ---------- */
                    buttonOrder.forEach(function ($button) {
                        // 1. Отримуємо оригінальний текст
                        var originalText = $button.data('name') || $button.text().trim();

                        // 2. Шукаємо/створюємо єдиний span з текстом
                        var $textSpan = $button.find('.full-start__button-text');
                        if ($textSpan.length === 0) {
                            $textSpan = $('<span class="full-start__button-text"></span>');
                            $button.append($textSpan);
                        }

                        // 3. Встановлюємо текст (видаляємо зайві \n, пробіли)
                        $textSpan.text(originalText.replace(/\s+/g, ' ').trim());

                        // 4. Прибираємо будь-які текстові вузли поза span (дублі)
                        $button.contents().filter(function () {
                            return this.nodeType === 3 && this.nodeValue.trim() !== '';
                        }).remove();

                        // 5. Додаємо кнопку
                        targetContainer.append($button);
                    });

                    // Увімкнути full_start
                    Lampa.Controller.toggle("full_start");

                }, 100);
            }
        });

        if (typeof module !== 'undefined' && module.exports) {
            module.exports = {};
        }
    }

    startPlugin();
})();
