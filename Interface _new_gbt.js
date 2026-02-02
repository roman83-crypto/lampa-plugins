(function(){
    'use strict';

    if(typeof Lampa==='undefined') return;

    /* ====================== УТИЛІТИ ====================== */
    if(!String.prototype.startsWith){String.prototype.startsWith=function(search,pos){return this.indexOf(search,pos||0)===0;}}

    function plural(n,one,two,five){n=Math.abs(n)%100;if(n>=5&&n<=20)return five;n=n%10;if(n===1)return one;if(n>=2&&n<=4)return two;return five;}
    function getBool(key,def){var v=Lampa.Storage.get(key,def);if(typeof v==='string')v=v.trim().toLowerCase();return v===true||v==='true'||v===1||v==='1';}
    function calculateAverageEpisodeDuration(movie){if(!movie||typeof movie!=='object')return 0;var t=0,c=0;if(Array.isArray(movie.episode_run_time)&&movie.episode_run_time.length){movie.episode_run_time.forEach(m=>{if(m>0&&m<=200){t+=m;c++;}});}else if(Array.isArray(movie.seasons)){movie.seasons.forEach(s=>{if(Array.isArray(s.episodes)){s.episodes.forEach(e=>{if(e.runtime&&e.runtime>0&&e.runtime<=200){t+=e.runtime;c++;}});}});}if(c>0)return Math.round(t/c);if(movie.last_episode_to_air&&movie.last_episode_to_air.runtime>0&&movie.last_episode_to_air.runtime<=200)return movie.last_episode_to_air.runtime;return 0;}
    function formatDurationMinutes(min){if(!min||min<=0)return '';var h=Math.floor(min/60),m=min%60,o='';if(h>0){o+=h+' '+plural(h,'година','години','годин');if(m>0)o+=' '+m+' '+plural(m,'хвилина','хвилини','хвилин');}else{o+=m+' '+plural(m,'хвилина','хвилини','хвилин');}return o;}

    /* ====================== ЛОКАЛІЗАЦІЯ ====================== */
    Lampa.Lang.add({
        interface_mod_new_group_title:{ru:'Интерфейс +',en:'Interface +',uk:'Інтерфейс +'},
        interface_mod_new_info_panel:{ru:'Новая инфо-панель',en:'New info panel',uk:'Нова інфо-панель'},
        interface_mod_new_info_panel_desc:{ru:'Цветная и перефразированная строка информации',en:'Colored and rephrased info line',uk:'Кольорова та перефразована інфо-панель'},
        interface_mod_new_colored_ratings:{ru:'Цветной рейтинг',en:'Colored rating',uk:'Кольоровий рейтинг'},
        interface_mod_new_colored_ratings_desc:{ru:'Включить подсветку рейтингов',en:'Enable colored rating highlight',uk:'Увімкнути кольорове виділення рейтингу'},
        interface_mod_new_colored_status:{ru:'Цветные статусы',en:'Colored statuses',uk:'Кольорові статуси'},
        interface_mod_new_colored_status_desc:{ru:'Подсвечивать статус сериала цветом',en:'Colorize series status',uk:'Підсвічувати статус серіалу'},
        interface_mod_new_colored_age:{ru:'Цветной возрастной рейтинг',en:'Colored age rating',uk:'Кольоровий віковий рейтинг'},
        interface_mod_new_colored_age_desc:{ru:'Подсвечивать возрастной рейтинг',en:'Colorize age rating',uk:'Підсвічувати віковий рейтинг'},
        interface_mod_new_theme_select_title:{ru:'Тема интерфейса',en:'Interface theme',uk:'Тема інтерфейсу'},
        interface_mod_new_theme_default:{ru:'По умолчанию',en:'Default',uk:'За замовчуванням'},
        interface_mod_new_theme_emerald_v1:{ru:'Emerald V1',en:'Emerald V1',uk:'Emerald V1'},
        interface_mod_new_theme_emerald_v2:{ru:'Emerald V2',en:'Emerald V2',uk:'Emerald V2'},
        interface_mod_new_theme_aurora:{ru:'Aurora',en:'Aurora',uk:'Aurora'}
    });

    /* ====================== НАЛАШТУВАННЯ ====================== */
    var settings={
        info_panel:getBool('interface_mod_new_info_panel',true),
        colored_ratings:getBool('interface_mod_new_colored_ratings',true),
        colored_status:getBool('interface_mod_new_colored_status',false),
        colored_age:getBool('interface_mod_new_colored_age',true),
        theme:Lampa.Storage.get('interface_mod_new_theme_select','default')||'default'
    };

    /* ====================== БАЗОВІ СТИЛІ ====================== */
    (function(){
        if(document.getElementById('interface_mod_base')) return;
        var css=`
            .full-start-new__details{color:#fff !important;margin:-0.45em !important;margin-bottom:1em !important;display:flex !important;align-items:center !important;flex-wrap:wrap !important;min-height:1.9em !important;font-size:1.1em !important;}
            *:not(input){-webkit-user-select:none !important;-moz-user-select:none !important;-ms-user-select:none !important;user-select:none !important;}
            *{-webkit-tap-highlight-color:transparent;-webkit-touch-callout:none;box-sizing:border-box;outline:none;-webkit-user-drag:none;}
            .full-start-new__rate-line > * {margin-left:0 !important;margin-right:1em !important;flex-shrink:0;flex-grow:0;}
            .info-badge{padding:0.2em 0.5em;border-radius:0.5em;font-size:0.9em;display:inline-block;margin:0.1em;}
            .rating-badge{padding:0.2em 0.5em;border-radius:0.4em;font-size:0.85em;font-weight:bold;display:inline-block;margin:0.1em;}
        `;
        var st=document.createElement('style'); st.id='interface_mod_base'; st.textContent=css; document.head.appendChild(st);
    })();

    /* ====================== КОЛЬОРИ ЖАНРІВ ====================== */
    var genreColors={
        'Бойовик':{bg:'rgba(231,76,60,.85)',text:'white'}, 'Пригоди':{bg:'rgba(39,174,96,.85)',text:'white'},
        'Мультфільм':{bg:'rgba(155,89,182,.85)',text:'white'}, 'Комедія':{bg:'rgba(241,196,15,.9)',text:'black'},
        'Кримінал':{bg:'rgba(192,57,43,.85)',text:'white'}, 'Документальний':{bg:'rgba(22,160,133,.85)',text:'white'},
        'Драма':{bg:'rgba(142,68,173,.85)',text:'white'}, 'Сімейний':{bg:'rgba(46,204,113,.85)',text:'white'},
        'Фентезі':{bg:'rgba(155,89,182,.85)',text:'white'}, 'Історія':{bg:'rgba(211,84,0,.85)',text:'white'},
        'Жахи':{bg:'rgba(192,57,43,.85)',text:'white'}, 'Музика':{bg:'rgba(52,152,219,.85)',text:'white'},
        'Детектив':{bg:'rgba(52,73,94,.85)',text:'white'}, 'Мелодрама':{bg:'rgba(233,30,99,.85)',text:'white'},
        'Фантастика':{bg:'rgba(41,128,185,.85)',text:'white'}, 'Трилер':{bg:'rgba(192,57,43,.85)',text:'white'},
        'Військовий':{bg:'rgba(127,140,141,.85)',text:'white'}
    };

    /* ====================== ФУНКЦІЯ ДЛЯ ДИНАМІЧНОГО КОЛЬОРУ РЕЙТИНГУ ====================== */
    function getRatingColor(value){
        if(value>=8) return {bg:'rgba(46,204,113,0.9)',text:'white'}; // зелений
        if(value>=5) return {bg:'rgba(241,196,15,0.9)',text:'black'}; // жовтий
        return {bg:'rgba(231,76,60,0.85)',text:'white'}; // червоний
    }

    /* ====================== ТЕМИ ====================== */
    function applyTheme(theme){
        var old=document.getElementById('interface_mod_theme'); if(old) old.remove();
        if(theme==='default') return;
        var themeCss={
            emerald_v1:`body{background:linear-gradient(135deg,#0c1619 0%,#132730 50%,#18323a 100%) !important;color:#dfdfdf !important;}`,
            emerald_v2:`body{background:radial-gradient(1200px 600px at 70% 10%,#214a57 0%,transparent 60%),linear-gradient(135deg,#112229 0%,#15303a 45%,#0f1c22 100%) !important;color:#e6f2ef !important;}`,
            aurora:`body{background:linear-gradient(135deg,#0f2027 0%,#203a43 50%,#2c5364 100%) !important;color:#ffffff !important;}`
        };
        var st=document.createElement('style'); st.id='interface_mod_theme'; st.textContent=themeCss[theme]; document.head.appendChild(st);
    }
    applyTheme(settings.theme);

    /* ====================== ІНФО-ПАНЕЛЬ ====================== */
    function buildInfoPanel(details,movie){
        if(!details||!movie) return;
        var container=$('<div>').css({display:'flex','flex-direction':'column',width:'100%',gap:'0em',margin:'-1em 0 0.2em 0.45em'});
        var row1=$('<div>').css({display:'flex','flex-wrap':'wrap',gap:'0.2em','align-items':'center'}); // рейтинги + PG
        var row2=$('<div>').css({display:'flex','flex-wrap':'wrap',gap:'0.2em','align-items':'center'}); // серії/сезони
        var row3=$('<div>').css({display:'flex','flex-wrap':'wrap',gap:'0.2em','align-items':'center'}); // наступна серія/тривалість
        var row4=$('<div>').css({display:'flex','flex-wrap':'wrap',gap:'0.2em','align-items':'flex-start'}); // жанри

        // Рейтинги з динамічним підсвічуванням
        if(settings.colored_ratings){
            if(movie.vote_average){
                var c=getRatingColor(movie.vote_average);
                row1.append($('<div>').addClass('rating-badge').css({background:c.bg,color:c.text}).text(`IMDB: ${movie.vote_average}`));
            }
            if(movie.rating_kp){
                var c=getRatingColor(movie.rating_kp);
                row1.append($('<div>').addClass('rating-badge').css({background:c.bg,color:c.text}).text(`KP: ${movie.rating_kp}`));
            }
        }

        if(settings.colored_age && movie.age_rating){
            row1.append($('<div>').addClass('rating-badge').css({background:'#e74c3c',color:'white'}).text(movie.age_rating));
        }

        // Серії/сезони
        if(movie.number_of_seasons) row2.append($('<div>').addClass('info-badge').css({background:'rgba(52,152,219,0.8)',color:'white'}).text(`Сезони: ${movie.number_of_seasons}`));
        if(movie.number_of_episodes) row2.append($('<div>').addClass('info-badge').css({background:'rgba(46,204,113,0.8)',color:'white'}).text(`Епізоди: ${movie.number_of_episodes}`));

        // Наступна серія / тривалість
        if(movie.next_episode_to_air && movie.next_episode_to_air.air_date){
            row3.append($('<div>').addClass('info-badge').css({background:'rgba(230,126,34,0.9)',color:'white'}).text(`Наступна: ${movie.next_episode_to_air.name || '??'} (${movie.next_episode_to_air.air_date})`));
        }
        var dur = movie.runtime || calculateAverageEpisodeDuration(movie);
        if(dur>0) row3.append($('<div>').addClass('info-badge').css({background:'rgba(52,152,219,0.8)',color:'white'}).text(`Тривалість: ${formatDurationMinutes(dur)}`));

        // Жанри
        if(Array.isArray(movie.genres)){
            movie.genres.forEach(g=>{
                var color=genreColors[g.name||g]||{bg:'rgba(100,100,100,.85)',text:'white'};
                row4.append($('<div>').addClass('info-badge').css({background:color.bg,color:color.text}).text(g.name||g));
            });
        }

        container.append(row1,row2,row3,row4);
        $('.full-start-new__details').empty().append(container);
    }

    /* ====================== НАЛАШТУВАННЯ ====================== */
    function initInterfaceModSettingsUI(){
        if(window.__ifx_settings_ready) return; window.__ifx_settings_ready=true;

        Lampa.SettingsApi.addComponent({
            component:'interface_mod_new',
            name:Lampa.Lang.translate('interface_mod_new_group_title'),
            icon:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 5h16v2H4V5zm0 6h16v2H4v-2zm0 6h16v2H4v-2z"/></svg>'
        });

        var add=Lampa.SettingsApi.addParam;
        add({component:'interface_mod_new',param:{name:'interface_mod_new_info_panel',type:'trigger',values:true,default:true},field:{name:Lampa.Lang.translate('interface_mod_new_info_panel'),description:Lampa.Lang.translate('interface_mod_new_info_panel_desc')}});
        add({component:'interface_mod_new',param:{name:'interface_mod_new_colored_ratings',type:'trigger',values:true,default:true},field:{name:Lampa.Lang.translate('interface_mod_new_colored_ratings'),description:Lampa.Lang.translate('interface_mod_new_colored_ratings_desc')}});
        add({component:'interface_mod_new',param:{name:'interface_mod_new_colored_status',type:'trigger',values:true,default:false},field:{name:Lampa.Lang.translate('interface_mod_new_colored_status'),description:Lampa.Lang.translate('interface_mod_new_colored_status_desc')}});
        add({component:'interface_mod_new',param:{name:'interface_mod_new_colored_age',type:'trigger',values:true,default:true},field:{name:Lampa.Lang.translate('interface_mod_new_colored_age'),description:Lampa.Lang.translate('interface_mod_new_colored_age_desc')}});
        add({component:'interface_mod_new',param:{name:'interface_mod_new_theme_select',type:'select',values:{'default':Lampa.Lang.translate('interface_mod_new_theme_default'),'emerald_v1':Lampa.Lang.translate('interface_mod_new_theme_emerald_v1'),'emerald_v2':Lampa.Lang.translate('interface_mod_new_theme_emerald_v2'),'aurora':Lampa.Lang.translate('interface_mod_new_theme_aurora')},default:'default'},field:{name:Lampa.Lang.translate('interface_mod_new_theme_select_title')}});

        if(!window.__ifx_patch_storage){
            window.__ifx_patch_storage=true;
            var _set=Lampa.Storage.set;
            Lampa.Storage.set=function(key,val){var res=_set.apply(this,arguments);if(typeof key==='string'&&key.startsWith('interface_mod_new_')){settings.info_panel=getBool('interface_mod_new_info_panel',true);settings.colored_ratings=getBool('interface_mod_new_colored_ratings',true);settings.colored_status=getBool('interface_mod_new_colored_status',false);settings.colored_age=getBool('interface_mod_new_colored_age',true);settings.theme=Lampa.Storage.get('interface_mod_new_theme_select','default')||'default';applyTheme(settings.theme);}return res;};
        }
    }
    initInterfaceModSettingsUI();

    /* ====================== ВИКЛИК ПАНЕЛІ ====================== */
    $(document).on('DOMNodeInserted', '.full-start-new__details', function(){
        var data = Lampa.Activity.details.data;
        if(data) buildInfoPanel(data.details||{},data.movie||data);
    });

})();
