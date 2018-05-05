// Initialize app
var myApp = new Framework7({
    material: true, //enable Material theme
    //swipePanel: 'left',
    //swipePanelActiveArea: 10,
    //pushState: true,
    //uniqueHistory: true,

});

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;
var myId = '-1';
var myPos = '-1';
var questId = '-1';
var storedLogin = myApp.formGetData('stored-login');
var lrs = [];
var auditLrs = [];
var subjectLayer = [];
var mainPage;

google.load('visualization', '1.0');

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

//If user data (login) stored:
if (!!storedLogin){
    var username = storedLogin["username"];
    var password = storedLogin["password"];
    logining(username, password);
} else {
    myApp.loginScreen();
    mainView.hideToolbar();
}

//Login screen
$$('.login-button').on('click', function () {
    var username = $$('.item-input').find('input[name="username"]').val();
    var password = $$('.item-input').find('input[name="password"]').val();
    logining(username, password);
});

$$('#reg-pass-conf').on('blur', function () {
    if ($$('#reg-pass').val() !==  $$('#reg-pass-conf').val() && $$('#reg-pass').val() !== ''){
        myApp.alert('Пароли не совпадают', 'Предупреждение');
    }
});

$$('#reg-username').on('blur', function () {
    var username = $$('#reg-username').val();
    var email = $$('#reg-email').val();
    $$.post('http://nefritor.h1n.ru/php/checkReg.php', {username:username, email: email}, function (data) {
        if (JSON.parse(data)['username'] === true) {
            myApp.alert('Данный логин уже занят', 'Предупреждение');
            var intervalID = setInterval(function(){
                $$('#reg-username').val($$('#reg-username').val().substring(0, $$('#reg-username').val().length - 1));
                if ($$('#reg-username').val().length === 0){
                    clearInterval(intervalID);
                }
            }, 100);
        }
    });
});

$$('#reg-email').on('blur', function () {
    var doglen = $$('#reg-email').val().split('@')[0].length;
    var dotlen = $$('#reg-email').val().split(/[.]/g)[1].length;
    var dogstr = $$('#reg-email').val().search('@');
    var dotstr = $$('#reg-email').val().search(/[.]/g);
    if (dogstr + 1 >= dotstr  || dogstr === -1 || dotstr === -1 || doglen === 0 || dotlen === 0){
        myApp.alert('Введен не корректный email', 'Предупреждение');
    } else {
        var username = $$('#reg-username').val();
        var email = $$('#reg-email').val();
        $$.post('http://nefritor.h1n.ru/php/checkReg.php', {username: username, email: email}, function (data) {
            if (JSON.parse(data)['email'] === true) {
                myApp.alert('Данная электронная почта уже занята', 'Предупреждение');
                var intervalID = setInterval(function(){
                    $$('#reg-email').val($$('#reg-email').val().substring(0, $$('#reg-email').val().length - 1));
                    if ($$('#reg-email').val().length === 0){
                        clearInterval(intervalID);
                    }
                }, 100);
            }
        });
    }
});

$$('.reg-button').on('click', function () {
    var username = $$('.item-input').find('input[name="reg-username"]').val();
    var email = $$('.item-input').find('input[name="reg-email"]').val();
    var password = $$('.item-input').find('input[name="reg-password"]').val();
    if (username !== '' && email !== '' && password !== '' && $$('.item-input').find('input[name="reg-password-conf"]').val() !== '') {
        $$.post('http://nefritor.h1n.ru/php/checkReg.php', {username:username, email: email}, function (data) {
            if (JSON.parse(data)['username'] === true) {
                myApp.alert('Данный логин уже занят', 'Предупреждение');
                var intervalID = setInterval(function(){
                    $$('#reg-username').val($$('#reg-username').val().substring(0, $$('#reg-username').val().length - 1));
                    if ($$('#reg-username').val().length === 0){
                        clearInterval(intervalID);
                    }
                }, 100);
            } else if (JSON.parse(data)['email'] === true) {
                myApp.alert('Данная электронная почта уже занята', 'Предупреждение');
                var intervalID = setInterval(function(){
                    $$('#reg-email').val($$('#reg-email').val().substring(0, $$('#reg-email').val().length - 1));
                    if ($$('#reg-email').val().length === 0){
                        clearInterval(intervalID);
                    }
                }, 100);
            } else {
                $$.post('http://nefritor.h1n.ru/php/registration.php', {
                    username: username,
                    email: email,
                    password: password
                }, function (data) {
                    myApp.alert('Что бы активировать аккаунт, перейдите по ссылке, указанной в письме, которая отправлена вам на почту', 'Завершение');
                    myApp.closeModal('.popup-reg');
                });
            }
        });
    } else {
        myApp.alert('Заполните все поля, чтобы выполнить регистрацию аккаунта', 'Предупреждение');
    }
});

$$('.popup-reg').on('popup:opened', function () {
    console.log('About Popup opened')
});

$$('.edit-finish').on('click', function () {
    var name = $$('.item-input').find('input[name="user-name"]').val();
    var surname = $$('.item-input').find('input[name="user-surname"]').val();
    var faculty = $$('.item-input').find('select[name="user-faculty"]').val();
    var spec = $$('.item-input').find('input[name="user-spec"]').val().toUpperCase();
    var year = $$('.item-input').find('input[name="user-year"]').val();
    var isMag = $$('.item-input').find('input[type=checkbox][name="user-ismag"]:checked').val() === 'on' ? '1' : '0';
    if (name === '' || surname === '' || spec === '' || year === ''){
        myApp.alert('Пожалуйста, заполните все поля', 'Предупреждение');
    } else {
        $$.post('http://nefritor.h1n.ru/php/edit.php', {myId: myId, name: name, surname: surname, faculty: faculty, spec: spec, year: year, isMag: isMag}, function (data) {
            if (data === 'done'){
                myApp.alert('Данные профиля были изменены', 'Выполнено');
                myApp.closeModal('.popup-edit');
                $$.post('http://nefritor.h1n.ru/php/getUserData.php', {userid:myId}, function (data) {
                    if (data !== '-1'){
                        autorization(data);
                    } else {
                        myApp.alert('Ваших данных в БД не найдено!', 'Не удается получить данные');
                    }
                });
            } else {
                myApp.alert('Ну тут уже просто наши полномочия и всё... окончено...', 'Чё?');
            }
        });
    }
});

function openUserEdit(haveCancel) {
    haveCancel ? $$('.edit-cancel').css('display', 'block') : $$('.edit-cancel').css('display', 'none');
}

// User logining
function logining(username, password) {
    myApp.showIndicator();
    $$.post('http://nefritor.h1n.ru/php/login.php', {username:username, password: password}, function (data) {
        if (data === '-1') {
            myApp.alert('Пожалуйста, проверьте правильность написания логина и пароля', 'Не удается войти');
        } else if (data == 'notActive'){
            myApp.alert('Данный аккаунт не активирован. Активируйте его через ссылку, указанную в письме в вашей электронной почте', 'Вход заблокирован');
        } else {
            myId = data;
            storedLogin = myApp.formStoreData('stored-login',
                {
                    'username': username,
                    'password' : password,
                });
            myApp.closeModal('.login-screen');
            mainView.showToolbar();
            /*mainView.router.load({
                url: 'quests.html',
                force: true
            });*/
            mainView.router.back({
                url: 'quests.html', // - in case you use Ajax pages
                force: true
            });
            mainPage = mainView.activePage.url;
        }
        myApp.hideIndicator();
    });
}

// Userdata autorization
function autorization(data) {
    $$('.profile-name').text(JSON.parse(data)['name'] + ' ' + JSON.parse(data)['surname']);
    $$('.frst-line-profile').text(JSON.parse(data)['faculty'] + ', ' + JSON.parse(data)['spec']);
    var secline = (JSON.parse(data)['ismag'] === '1') ? ', магистратура' : '';
    $$('.scnd-line-profile').text(JSON.parse(data)['year'] + ' курс' + secline);
}

function getQuestList(showHidden, ptrUsing) {
    myApp.showIndicator();
    $$.post('http://nefritor.h1n.ru/php/getQuestList.php', {userid: myId}, function (data) {
        if (data !== '-1') {
            var questsObj = [];
            var quests = [], hquests = [], complets = [], hNotExist = true, cNotExist = true; hCount = 0;
            for (var i = 0; i < Object.keys(JSON.parse(data)).length; i++){
                questsObj.push({
                    id: JSON.parse(data)[i]['id'],
                    title: JSON.parse(data)[i]['task'],
                    short_title: JSON.parse(data)[i]['short_desc'],
                    long_title: JSON.parse(data)[i]['long_desc'],
                    is_hidden: JSON.parse(data)[i]['is_hidden'],
                    is_completed: JSON.parse(data)[i]['is_completed']
                });
                //alert(JSON.parse(data)[i]['id'] + ' ' + JSON.parse(data)[i]['is_hidden'] + ' ' + JSON.parse(data)[i]['is_completed']);
                if (JSON.parse(data)[i]['is_hidden'] && JSON.parse(data)[i]['is_completed'] === '0'){
                    hNotExist = false;
                    hCount++
                }

                if (JSON.parse(data)[i]['is_completed'] === '1'){
                    cNotExist = false;
                }
            }

            if (questsObj.length === hCount)
                quests.push('<li class="list-group-title">Активных заданий нет</li>');
            else
                quests.push('<li class="list-group-title">Активные задания</li>');

            if (hNotExist)
                hquests.push('<li class="list-group-title">Удаленных заданий нет</li>');
            else
                hquests.push('<li class="list-group-title">Удаленные задания</li>');

            if (cNotExist)
                complets.push('<li class="list-group-title">Завершенных заданий нет</li>');
            else
                complets.push('<li class="list-group-title">Завершенные задания</li>');

            questsObj.forEach(function(element) {
                if (!element.is_hidden) {
                    quests.push('<li class="swipeout">' +
                        '<div class="swipeout-content">'+
                        '<a href="#" onclick="toFullQuest(' + element.id + ')" data-picker=".picker-1" class="close-picker item-content item-link">'+
                        '<div class="item-inner">'+
                        '<div class="item-title-row">'+
                        '<div class="item-title">' + element.title + '</div>'+
                        '<div class="item-after">17:14</div>'+
                        '</div>'+
                        '<div class="item-text">' + element.short_title + '</div>'+
                        '</div>'+
                        '</a>'+
                        '</div>'+
                        '<div class="swipeout-actions-right">'+
                        // '<a href="#" class="mark bg-orange">Mark</a>'+
                        '<a onclick="deleteQuest(' + element.id + ')" class="swipeout-delete swipeout-overswipe">Удалить</a>'+
                        '</div>'+
                        '</li>')
                } else if (element.is_completed === '0') {
                    hquests.push('<li class="swipeout">' +
                        '<div class="swipeout-content">'+
                        '<a href="#" onclick="toFullQuest(' + element.id + ')" data-picker=".picker-1" class="close-picker item-content item-link">'+
                        '<div class="item-inner">'+
                        '<div class="item-title-row">'+
                        '<div class="item-title">' + element.title + '</div>'+
                        '<div class="item-after">17:14</div>'+
                        '</div>'+
                        '<div class="item-text">' + element.short_title + '</div>'+
                        '</div>'+
                        '</a>'+
                        '</div>'+
                        '<div class="swipeout-actions-right">'+
                        // '<a href="#" class="mark bg-orange">Mark</a>'+
                        '<a onclick="restoreQuest(' + element.id + ')" class="swipeout-delete bg-orange swipeout-overswipe">Восстановить</a>' +
                        '</div>'+
                        '</li>')
                } else if (element.is_completed === '1'){
                    complets.push('<li>' +
                        '<a href="#" class="item-link item-content">' +
                        '<div class="item-inner">'+
                        '<div class="item-title-row">'+
                        '<div class="item-title">' + element.title + '</div>'+
                        '<div class="item-after">17:14</div>'+
                        '</div>'+
                        '<div class="item-text">' + element.short_title + '</div>'+
                        '</div>'+
                        '</li>')
                }
            });
            var myList = myApp.virtualList('.ul-list-quests', { items: quests });
            if (showHidden) {
                myList.appendItems(hquests);
                myList.appendItems(complets);
            }

        } else {
            myApp.alert('Похоже, что заданий вообще нет)', 'Заданий не найдено...');
        }
        ptrUsing ? myApp.pullToRefreshDone() : '';
        myApp.hideIndicator();
    });
}

function deleteQuest(id) {
    $$.post('http://nefritor.h1n.ru/php/deleteQuest.php', {userid: myId, questid: id}, function () {
    });
}

function restoreQuest(id) {
    $$.post('http://nefritor.h1n.ru/php/restoreQuest.php', {userid: myId, questid: id}, function () {
    });
}

function toFullQuest(id){
    questId = id;
    mainView.router.loadPage('fullquest.html');
}

function setLayer(fusionId, layerFillColor, layerType, floor) {

    var fusionTable = fusionId; // usatu_b

    lrs.forEach(function (t) {
        t.setMap(null);
    });

    auditLrs.forEach(function (t) {
        t.setMap(null);
    });

    var sql = encodeURIComponent("SELECT 'geom' FROM " + fusionTable + " WHERE floor = '" + floor + "'");

    var query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=' + sql);

    var queryEnd = false;

    query.send(function (response) {

        numbOfPoly = response.getDataTable().getNumberOfRows();

        for (var i2 = 0; i2 < numbOfPoly; i2++) {

            var data = response.getDataTable().getValue(i2, 0);
            //create a XML parser
            if (window.DOMParser) {
                var parser = new DOMParser();
                var kml = parser.parseFromString(data, "text/xml");
            } else { // Internet Explorer
                var kml = new ActiveXObject("Microsoft.XMLDOM");
                kml.loadXML(data);
            }
            //get the coordinates of Subject Polygon
            var latLngs = kml.getElementsByTagName("coordinates")[0].childNodes[0].nodeValue.split(' ');

            //create an array of LatLngs
            var subLatLngs = [];
            for (var i = 0; i < latLngs.length; i++) {
                var latLng = latLngs[i].split(',');
                //<coordinates> for this FusionTable comes in lng,lat format
                subLatLngs.push(new google.maps.LatLng(latLng[1], latLng[0]));
                //alert(latLng[1] + ' ' + latLng[0])
            }
            //initialize the polygon


            subjectLayer[i2] = new google.maps.Polygon({
                paths: subLatLngs,
                clickable: false,
                fillColor: layerFillColor,
                strokeColor: 'black',
                strokeWeight: 1,
                map: map
            });
            lrs.push(subjectLayer[i2]);
        }

        setTimeout("$$('.floor-elem').removeAttr('disabled')", 1000); //включаем возможность изменения floor

        queryEnd = true;
    });
}

function fullAuditSelect(floor, selectElem) {

    var sql = encodeURIComponent("SELECT 'number' FROM 1y-mDlD84jz7MZ9OHj-q6aFgE7RgRevJWPrKPveF5 WHERE floor = '" + floor + "'");
    var query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=' + sql);
    var queryEnd = false;
    var dataList = [];

    query.send(function (response) {

        numbOfRows = response.getDataTable().getNumberOfRows();

        for (var i2 = 0; i2 < numbOfRows; i2++) {

            var data = response.getDataTable().getValue(i2, 0);

            if (data !== '') {
                dataList.push(data);
            }
        }
        dataList.sort();

        var auditSel = document.getElementById(selectElem);

        auditSel.options.length = 0;

        for (var i = 0; i < dataList.length; i++){
            auditSel.options[i] = new Option(dataList[i], dataList[i]);
        }
        queryEnd = true;
    });
}

function extentToAudit(audit) {

    auditLrs.forEach(function (t) {
        t.setMap(null);
    });

    var sql = encodeURIComponent("SELECT 'geom' FROM 1y-mDlD84jz7MZ9OHj-q6aFgE7RgRevJWPrKPveF5 WHERE number = '" + audit + "'");
    var query = new google.visualization.Query('http://www.google.com/fusiontables/gvizdata?tq=' + sql);
    var queryEnd = false;

    query.send(function (response) {

        var data = response.getDataTable().getValue(0, 0);

        if (window.DOMParser) {
            var parser = new DOMParser();
            var kml = parser.parseFromString(data, "text/xml");
        } else { // Internet Explorer
            var kml = new ActiveXObject("Microsoft.XMLDOM");
            kml.loadXML(data);
        }
        //get the coordinates of Subject Polygon
        var latLngs = kml.getElementsByTagName("coordinates")[0].childNodes[0].nodeValue.split(' ');
        var latit = 0, longtit = 0;

        var subLatLngs = [];

        for (var i = 0; i < latLngs.length; i++) {
            var latLng = latLngs[i].split(',');
            latit += parseFloat(latLng[1]);
            longtit += parseFloat(latLng[0]);
            subLatLngs.push(new google.maps.LatLng(latLng[1], latLng[0]));
        }

        subjectLayer[0] = new google.maps.Polygon({
            paths: subLatLngs,
            clickable: false,
            fillColor: 'red',
            strokeColor: 'black',
            strokeWeight: 1,
            map: map
        });

        auditLrs.push(subjectLayer[0]);

        longtit = longtit / latLngs.length;
        latit = latit / latLngs.length;

        var pos = {
            lat: latit,
            lng: longtit
        };
        map.setCenter(pos);
        map.setZoom(17);

        queryEnd = true;
    });
}

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");
});

function scrollToTop(scrollDuration) {
    const   scrollHeight = window.scrollY,
        scrollStep = Math.PI / ( scrollDuration / 15 ),
        cosParameter = scrollHeight / 2;
    var     scrollCount = 0,
        scrollMargin,
        scrollInterval = setInterval( function() {
            if ( window.scrollY != 0 ) {
                scrollCount = scrollCount + 1;
                scrollMargin = cosParameter - cosParameter * Math.cos( scrollCount * scrollStep );
                window.scrollTo( 0, ( scrollHeight - scrollMargin ) );
            }
            else clearInterval(scrollInterval);
        }, 15 );
}


// Option 2. Using one 'pageInit' event handler for all pages:
$$(document).on('pageInit', function (e) {
    // Get page data from event data
    var page = e.detail.page;

    //mainView.pagesCache.destroy();
    //alert(mainView.history.length);

    if (page.name === 'profile') {
        $$.post('http://nefritor.h1n.ru/php/getUserData.php', {userid:myId}, function (data) {
            if (data !== '-1') {
                if (JSON.parse(data)['name'] === 'Null' || JSON.parse(data)['surname'] === 'Null' || JSON.parse(data)['faculty'] === 'Null' || JSON.parse(data)['spec'] === 'Null' || JSON.parse(data)['year'] === '0') {
                    myApp.popup('.popup-edit');
                    openUserEdit(false);
                } else autorization(data);
            } else {
                myApp.alert('Ваших данных в БД не найдено!', 'Не удается получить данные');
            }
        });

        $$('.open-popup').on('click', function () {
            $$.post('http://nefritor.h1n.ru/php/getUserData.php', {userid:myId}, function (data) {
                $$('.item-input').find('input[name="user-name"]').val(JSON.parse(data)['name']);
                $$('.item-input').find('input[name="user-surname"]').val(JSON.parse(data)['surname']);
                $$('.item-input').find('select[name="user-faculty"]').val(JSON.parse(data)['faculty']);
                $$('.item-input').find('input[name="user-spec"]').val(JSON.parse(data)['spec']);
                $$('.item-input').find('input[name="user-year"]').val(JSON.parse(data)['year']);
                $$('.item-input').find('input[type=checkbox][name="user-ismag"]').prop("checked", JSON.parse(data)['ismag'] === '1');
                openUserEdit(true);
            });
            openUserEdit(true);
        });

        $$('.goto-index').on('click', function () {
        });

        // Stored data (login) deleting
        $$('.delete-stored-data').on('click', function () {
            storedLogin = myApp.formDeleteData('stored-login');
            myApp.alert('Данные входа были успешно удалены!', 'Удаление', function () {
                location.reload();
            });
        });
    } else if (page.name === 'quests'){
        var ptrContent = $$('.pull-to-refresh-content');

        getQuestList(false, false);

        $$('.popover-links-quests').on('closed', function () {
            getQuestList($$('.item-content').find('input[type=checkbox][name="checkbox-showhidden"]').prop("checked"), false);
        });

        ptrContent.on('refresh', function (e) {
            getQuestList($$('.item-content').find('input[type=checkbox][name="checkbox-showhidden"]').prop("checked"), true);
        });
    } else if (page.name === 'fullquest') {

        if (myPos === '-1')
            $$('.goto-begin').text("Задать начало");
        var qtype, qfloor, qtarget, mpfloor, mptarget;
        $$.post('http://nefritor.h1n.ru/php/getQuestInfo.php', {questId:questId},  function (data) {
            if (data !== '-1') {
                $$('.quest-title').text(JSON.parse(data)['task']);
                //$$('.quest-header').text(JSON.parse(data)['task']);
                $$('.quest-full-description').text($$('.quest-full-description').text() + ' ' + JSON.parse(data)['long_desc']);

                qtype = JSON.parse(data)['target'].split(':')[0];
                qfloor = JSON.parse(data)['target'].split(':')[1];
                qtarget = JSON.parse(data)['target'].split(':')[2];

                google.maps.visualRefresh = true;

                var extent = new google.maps.LatLng(54.434823, 48.231956);

                function CoordMapType(tileSize) {
                    this.tileSize = tileSize;
                }

                CoordMapType.prototype.maxZoom = 17;
                CoordMapType.prototype.minZoom = 14;
                CoordMapType.prototype.name = 'Blank Map';
                CoordMapType.prototype.alt = 'Tile Coordinate Map Type';

                CoordMapType.prototype.getTile = function(coord, zoom, ownerDocument) {
                    var div = ownerDocument.createElement('div');
                    return div;
                };

                var mapOptions = {
                    zoom: 17,
                    center: extent,
                    mapTypeId: 'coordinate',
                    mapTypeControlOptions: {
                        mapTypeIds: []
                    },
                    gestureHandling: 'cooperative'
                };

                map = new google.maps.Map(document.getElementById("mapmin"), mapOptions);

                map.mapTypes.set('coordinate',
                    new CoordMapType(new google.maps.Size(150, 150)));

                google.setOnLoadCallback(setLayer("1Z5Foc0IP0N4z7u8Q3E-siabn6vzE6mNCUWa7kTNN", 'black', 'ws', qfloor)); //wall_structural
                google.setOnLoadCallback(setLayer("1-yiNpbyp0jKW-RSMx9ffJxbsxz5K8fkeeBhmYCes", 'black', 'wi', qfloor)); //wall internal
                google.setOnLoadCallback(setLayer("1KTChLin1RSNDYSVeq8ODbFTFSDCHcLyt07_8Ux_6", 'grey', 's', qfloor)); //stairs
                google.setOnLoadCallback(setLayer("1y-mDlD84jz7MZ9OHj-q6aFgE7RgRevJWPrKPveF5", 'blue', 'p', qfloor)); //placement
                google.setOnLoadCallback(setLayer("1fx6CDDB6rrzPeiN0Rmz5PEdPdq2tuJwO9szz4KVA", 'grey', 'f', qfloor)); //floor
                google.setOnLoadCallback(setLayer("1B4X-Mgskw2lSwoabQea3e0AhNpaiPncKmnWdUdpT", 'grey', 'd', qfloor)); //doors

                if (qtype === "A"){
                    extentToAudit(qtarget);
                }

                // Try HTML5 geolocation.
                /*if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function(position) {
                        var pos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        map.setCenter(pos);
                    });
                }*/
            } else {
                myApp.alert('Не удалось получить информацию...', 'Ошибка');
            }
        });
        $$('.goto-begin').on('click', function () {
            if (myPos === '-1'){
                myApp.pickerModal('.picker-info');
                $$('#mypos-floor').trigger('change');
            } else {
                google.setOnLoadCallback(setLayer("1Z5Foc0IP0N4z7u8Q3E-siabn6vzE6mNCUWa7kTNN", 'black', 'ws', myPos.split(':')[1])); //wall_structural
                google.setOnLoadCallback(setLayer("1-yiNpbyp0jKW-RSMx9ffJxbsxz5K8fkeeBhmYCes", 'black', 'wi', myPos.split(':')[1])); //wall internal
                google.setOnLoadCallback(setLayer("1KTChLin1RSNDYSVeq8ODbFTFSDCHcLyt07_8Ux_6", 'grey', 's', myPos.split(':')[1])); //stairs
                google.setOnLoadCallback(setLayer("1y-mDlD84jz7MZ9OHj-q6aFgE7RgRevJWPrKPveF5", 'blue', 'p', myPos.split(':')[1])); //placement
                google.setOnLoadCallback(setLayer("1fx6CDDB6rrzPeiN0Rmz5PEdPdq2tuJwO9szz4KVA", 'grey', 'f', myPos.split(':')[1])); //floor
                google.setOnLoadCallback(setLayer("1B4X-Mgskw2lSwoabQea3e0AhNpaiPncKmnWdUdpT", 'grey', 'd', myPos.split(':')[1])); //doors
                extentToAudit(myPos.split(':')[2]);
            }
        });
        $$('.goto-end').on('click', function () {
            if (qtype === "A"){
                google.setOnLoadCallback(setLayer("1Z5Foc0IP0N4z7u8Q3E-siabn6vzE6mNCUWa7kTNN", 'black', 'ws', qfloor)); //wall_structural
                google.setOnLoadCallback(setLayer("1-yiNpbyp0jKW-RSMx9ffJxbsxz5K8fkeeBhmYCes", 'black', 'wi', qfloor)); //wall internal
                google.setOnLoadCallback(setLayer("1KTChLin1RSNDYSVeq8ODbFTFSDCHcLyt07_8Ux_6", 'grey', 's', qfloor)); //stairs
                google.setOnLoadCallback(setLayer("1y-mDlD84jz7MZ9OHj-q6aFgE7RgRevJWPrKPveF5", 'blue', 'p', qfloor)); //placement
                google.setOnLoadCallback(setLayer("1fx6CDDB6rrzPeiN0Rmz5PEdPdq2tuJwO9szz4KVA", 'grey', 'f', qfloor)); //floor
                google.setOnLoadCallback(setLayer("1B4X-Mgskw2lSwoabQea3e0AhNpaiPncKmnWdUdpT", 'grey', 'd', qfloor)); //doors
                extentToAudit(qtarget);
            }
        });
        $$('#mypos-floor').on('change', function () {
            google.setOnLoadCallback(fullAuditSelect($$('#mypos-floor').val(), 'mypos-audit'));
        });
        $$('.mypos-conf').on('click', function () {
            myPos = 'A:' + $$('#mypos-floor').val() + ':' + $$('#mypos-audit').val();
            $$('.goto-begin').text("К началу");
        });
        $$('.mypos-clear').on('click', function () {
            myPos = '-1';
            $$('.goto-begin').text("Задать начало");
        });

        var answfoc= false, codefoc = false;

        $$('.input-text-answer').on('focus', function () {
            answfoc = true;
            if (!codefoc)
                $('.page-content').animate({scrollTop: $$('.input-text-answer').offset().top}, 700, 'swing');
            codefoc = false;
        });

        $$('.input-text-code').on('focus', function () {
            codefoc = true;
            if (!answfoc)
                $('.page-content').animate({scrollTop: $$('.input-text-code').offset().top}, 700, 'swing');
            answfoc = false;
        });

        $$('.quest-realiz').on('click', function () {
            $('.page-content').stop().animate({scrollTop: $$('.input-text-code').offset().top}, 700, 'swing');
        });
        $$('.sendanswer-button').on('click', function () {
            var answer = $$('.item-input').find('textarea[name="questanswer"]').val();
            var code = $$('.item-input').find('input[name="questcode"]').val();
            if (answer === '' || code === '') {
                myApp.alert("Все поля должны быть заполнены", "Внимание!");
            } else {
                $$.post('http://nefritor.h1n.ru/php/saveQuestData.php', {userid:myId, questid:questId, useranswer: answer, usercode: code}, function (data) {
                    if (data === '1'){
                        myApp.alert('Задание успешно выполнено', "Поздравляем!");
                        mainView.router.back({
                            url: 'quests.html', // - in case you use Ajax pages
                            force: true
                        });
                    } else if (data === '0'){
                        myApp.alert('Вы ввели не верный код', "Внимание");
                    } else if (data === '-1'){
                        myApp.alert('Вы дали неверный ответ', "Ой-ой");
                    }
                });
            }
        })

    } else if (page.name === 'map'){

        google.maps.visualRefresh = true;

        var extent = new google.maps.LatLng(60.8346931556014, 52.4292745271029);

        function CoordMapType(tileSize) {
            this.tileSize = tileSize;
        }

        CoordMapType.prototype.maxZoom = 17;
        CoordMapType.prototype.minZoom = 14;
        CoordMapType.prototype.name = 'Blank Map';
        CoordMapType.prototype.alt = 'Tile Coordinate Map Type';

        CoordMapType.prototype.getTile = function(coord, zoom, ownerDocument) {
            var div = ownerDocument.createElement('div');
            return div;
        };

        var mapOptions = {
            zoom: 14,
            center: extent,
            streetViewControl: false,
            mapTypeId: 'coordinate',
            mapTypeControlOptions: {
                mapTypeIds: []
            }
        };

        map = new google.maps.Map(document.getElementById("map"), mapOptions);

        map.mapTypes.set('coordinate',
            new CoordMapType(new google.maps.Size(150, 150)));

        $$('.floor-block').scrollTop($$('.floor-block').prop("scrollHeight"));

        $$('.floor-elem').on('click', function () {
            var flr = parseInt($(this).text());
            $$('#floorInput').val(flr);
            $$('.floor-elem').removeClass("floor-selected");
            $(this).addClass("floor-selected");
            $$('#floorInput').trigger('change');
        });

        $$('#floorInput').on('change', function (e) {
            var floor = $$('#floorInput').val();
            $$('.floor-elem').attr({disabled: 'disabled'}); //отключаем возможность изменения floor, пока обрабатывается запрос

            //setLayer("1NcDztIrzBe6snO3FvBgnjo5_t22QGQxTFD9pLD5O", 'grey', 'b'); //box
            google.setOnLoadCallback(setLayer("1Z5Foc0IP0N4z7u8Q3E-siabn6vzE6mNCUWa7kTNN", 'black', 'ws', floor)); //wall_structural
            google.setOnLoadCallback(setLayer("1-yiNpbyp0jKW-RSMx9ffJxbsxz5K8fkeeBhmYCes", 'black', 'wi', floor)); //wall internal
            google.setOnLoadCallback(setLayer("1KTChLin1RSNDYSVeq8ODbFTFSDCHcLyt07_8Ux_6", 'grey', 's', floor)); //stairs
            google.setOnLoadCallback(setLayer("1y-mDlD84jz7MZ9OHj-q6aFgE7RgRevJWPrKPveF5", 'blue', 'p', floor)); //placement
            google.setOnLoadCallback(setLayer("1fx6CDDB6rrzPeiN0Rmz5PEdPdq2tuJwO9szz4KVA", 'grey', 'f', floor)); //floor
            google.setOnLoadCallback(setLayer("1B4X-Mgskw2lSwoabQea3e0AhNpaiPncKmnWdUdpT", 'grey', 'd', floor)); //doors
            google.setOnLoadCallback(fullAuditSelect(floor, 'auditSelect'));
        });

        $$('#floorInput').trigger('change');

        $$('#auditSelect').on('change', function () {
            extentToAudit($$('#auditSelect').val());
        });


        // Try HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                //map.setCenter(pos);
            });
        }
    }
});

// Option 2. Using live 'pageInit' event handlers for each page
$$(document).on('pageInit', '.page[data-page="about"]', function (e) {
    // Following code will be executed for page with data-page attribute equal to "about"
    //myApp.alert('Here comes About page');
});