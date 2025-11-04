Lampa.Platform.tv();

(function () {
    'use strict';

    function startPlugin() {
        // Проверяем, есть ли full_btn_priority в Storage
        if (Lampa.Storage.get('full_btn_priority') !== undefined) {
            Lampa.Storage.set('full_btn_priority', '{}');
        }

        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                setTimeout(function () {
                    var fullContainer = e.object.activity.render();
                    var targetContainer = fullContainer.find('.full-start-new__buttons');

                    fullContainer.find('.button--play').remove();

                    // Додаємо стилі для перенесення кнопок на новий рядок
                    if (!$('#custom-buttons-style').length) {
                        $('<style id="custom-buttons-style">')
                            .text(`
                                .full-start-new__buttons {
                                    display: flex !important;
                                    flex-wrap: wrap !important;
                                    gap: 10px !important;
                                    justify-content: flex-start !important;
                                }
                                .full-start-new__buttons .full-start__button {
                                    flex: 0 1 auto !important;
                                    min-width: 150px !important;
                                    max-width: calc(33.333% - 10px) !important;
                                }
                                @media (max-width: 768px) {
                                    .full-start-new__buttons .full-start__button {
                                        max-width: calc(50% - 10px) !important;
                                    }
                                }
                            `)
                            .appendTo('head');
                    }

                    var allButtons = fullContainer.find('.buttons--container .full-start__button')
                        .add(targetContainer.find('.full-start__button'));

                    // Функція для додавання підпису до кнопки
                    function addLabel($button, text, color) {
                        // Видаляємо всі існуючі текстові вузли та span з оригінальним текстом
                        $button.contents().filter(function() {
                            return this.nodeType === 3; // Текстові вузли
                        }).remove();
                        
                        // Видаляємо всі span, які не є іконками
                        $button.find('span').not('.full-start__icon').remove();
                        
                        // Видаляємо старі підписи
                        $button.find('.button-label').remove();

                        // Додаємо новий підпис
                        var $label = $('<span class="button-label"></span>')
                            .text(text)
                            .css({
                                'font-size': '1em',
                                'color': color,
                                'font-weight': 'bold',
                                'text-transform': 'uppercase',
                                'margin-left': '0.5em'
                            });
                        $button.append($label);
                    }

                    // Визначаємо категорії кнопок по наявності слів в класах
                    var torrentButtons = allButtons.filter(function () {
                        var className = $(this).attr('class') || '';
                        return className.includes('torrent');
                    });
                    
                    var onlineButtons = allButtons.filter(function () {
                        var className = $(this).attr('class') || '';
                        return className.includes('online');
                    });
                    
                    var trailerButtons = allButtons.filter(function () {
                        var className = $(this).attr('class') || '';
                        return className.includes('trailer');
                    });

                    // Додаємо підписи до кнопок
                    torrentButtons.each(function () {
                        addLabel($(this), 'Торрент', '#4CAF50');
                    });

                    onlineButtons.each(function () {
                        addLabel($(this), 'Онлайн', '#2196F3');
                    });

                    trailerButtons.each(function () {
                        addLabel($(this), 'Трейлер', '#FF9800');
                    });

                    // Створюємо масив порядку кнопок
                    var buttonOrder = [];

                    // СПОЧАТКУ додаємо всі torrent-кнопки
                    torrentButtons.each(function () {
                        buttonOrder.push($(this));
                    });

                    // ПОТІМ додаємо всі online-кнопки
                    onlineButtons.each(function () {
                        buttonOrder.push($(this));
                    });

                    // Додаємо всі trailer-кнопки
                    trailerButtons.each(function () {
                        buttonOrder.push($(this));
                    });

                    // Обробляємо всі інші кнопки з клонуванням
                    allButtons.filter(function () {
                        var className = $(this).attr('class') || '';
                        return !className.includes('online') &&
                               !className.includes('torrent') &&
                               !className.includes('trailer');
                    }).each(function () {
                        var $clone = $(this).clone(true); // Клонуємо з подіями
                        addLabel($clone, 'Інше', '#9E9E9E');
                        buttonOrder.push($clone);
                    });

                    // Очищаємо та заповнюємо контейнер
                    targetContainer.empty();
                    buttonOrder.forEach(function ($button) {
                        targetContainer.append($button);
                    });

                    // Підсвічуємо online та torrent кнопки
                    targetContainer.find('.full-start__button').each(function () {
                        var className = $(this).attr('class') || '';
                        if (className.includes('online')) {
                            $(this).css({
                                'box-shadow': '0 0 15px rgba(33, 150, 243, 0.5)',
                                'border': '2px solid #2196F3'
                            });
                        } else if (className.includes('torrent')) {
                            $(this).css({
                                'box-shadow': '0 0 15px rgba(76, 175, 80, 0.5)',
                                'border': '2px solid #4CAF50'
                            });
                        }
                    });

                    // Включаємо "full_start" після виконання
                    Lampa.Controller.toggle("full_start");

                }, 100); // Таймаут 100 мс для стабільності
            }
        });

        if (typeof module !== 'undefined' && module.exports) {
            module.exports = {};
        }
    }

    startPlugin();
})();
