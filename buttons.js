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

                    // Збираємо всі кнопки
                    var allButtons = fullContainer.find('.buttons--container .full-start__button')
                        .add(targetContainer.find('.full-start__button'));

                    // Категорії кнопок
                    var onlineButtons = allButtons.filter(function () {
                        return ($(this).attr('class') || '').includes('online');
                    });
                    var torrentButtons = allButtons.filter(function () {
                        return ($(this).attr('class') || '').includes('torrent');
                    });
                    var trailerButtons = allButtons.filter(function () {
                        return ($(this).attr('class') || '').includes('trailer');
                    });

                    // Порядок кнопок
                    var buttonOrder = [];

                    // Додаємо online
                    onlineButtons.each(function () {
                        buttonOrder.push($(this));
                    });
                    // Додаємо torrent
                    torrentButtons.each(function () {
                        buttonOrder.push($(this));
                    });
                    // Додаємо trailer
                    trailerButtons.each(function () {
                        buttonOrder.push($(this));
                    });
                    // Інші кнопки — клонуються
                    allButtons.filter(function () {
                        var cls = $(this).attr('class') || '';
                        return !cls.includes('online') && !cls.includes('torrent') && !cls.includes('trailer');
                    }).each(function () {
                        var $clone = $(this).clone(true);
                        buttonOrder.push($clone);
                    });

                    // Очищаємо контейнер
                    targetContainer.empty();

                    // === ДОДАЄМО СТИЛІ ДЛЯ ПЕРЕНОСУ ===
                    targetContainer.css({
                        'display': 'flex',
                        'flex-wrap': 'wrap',
                        'gap': '10px',
                        'justify-content': 'flex-start',
                        'padding': '10px',
                        'overflow': 'visible' // дозволяє "вилізти", але wrap працює
                    });

                    // === ДОДАЄМО КНОПКИ З ВИПРАВЛЕННЯМ ДУБЛЮВАННЯ НАЗВ ===
                    buttonOrder.forEach(function ($button) {
                        // Знаходимо текст кнопки (оригінальний)
                        var $textSpan = $button.find('.full-start__button-text');
                        if ($textSpan.length === 0) {
                            $textSpan = $('<span class="full-start__button-text"></span>');
                            $button.append($textSpan);
                        }

                        // Отримуємо оригінальний текст (з data або text)
                        var originalText = $button.data('name') || $button.text().trim().split('\n')[0].trim();

                        // Встановлюємо лише один текст
                        $textSpan.text(originalText);

                        // Видаляємо дублі (якщо є кілька span або зайві \n)
                        $button.contents().filter(function() {
                            return this.nodeType === 3 && this.nodeValue.trim() !== '';
                        }).remove();

                        // Додаємо кнопку
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
