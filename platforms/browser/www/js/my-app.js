// Initialize app
var myApp = new Framework7({
    material: true, //enable Material theme
    //swipePanel: 'left',
    //swipePanelActiveArea: 10,
    //pushState: true,

});

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;
var myId = '-1';
var questId = '-1';
var storedLogin = myApp.formGetData('stored-login');

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
    if ($$('#reg-pass').val() !==  $$('#reg-pass-conf').val() && $$('#reg-pass').val() != ''){
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
    if (name == '' || surname == '' || spec == '' || year == ''){
        myApp.alert('Пожалуйста, заполните все поля', 'Предупреждение');
    } else {
        $$.post('http://nefritor.h1n.ru/php/edit.php', {myId: myId, name: name, surname: surname, faculty: faculty, spec: spec, year: year, isMag: isMag}, function (data) {
            if (data == 'done'){
                myApp.alert('Данные профиля были изменены', 'Выполнено');
                myApp.closeModal('.popup-edit');
                $$.post('http://nefritor.h1n.ru/php/getUserData.php', {userid:myId}, function (data) {
                    if (data != '-1'){
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
    $$.post('http://nefritor.h1n.ru/php/login.php', {username:username, password: password}, function (data) {
        if (data == '-1') {
            myApp.alert('Пожалуйста, проверьте правильность написания логина и пароля', 'Не удается войти');
        } else if (data == 'notActive'){
            myApp.alert('Данный аккаунт не активирован. Активируйте его через ссылку, указанную в письме в вашей электронной почте', 'Вход заблокирован');
        } else {
            myId = data;
            storedLogin = myApp.formStoreData('stored-login',
                {
                    'username': username,
                    'password' : password
                });
            myApp.closeModal('.login-screen');
            mainView.showToolbar();
            mainView.router.load({
                url: 'quests.html',
                force: true
            });
        }
    });
}

// Userdata autorization
function autorization(data) {
    $$('.profile-name').text(JSON.parse(data)['name'] + ' ' + JSON.parse(data)['surname']);
    $$('.frst-line-profile').text(JSON.parse(data)['faculty'] + ', ' + JSON.parse(data)['spec']);
    var secline = (JSON.parse(data)['ismag'] === '1') ? ', магистратура' : '';
    $$('.scnd-line-profile').text(JSON.parse(data)['year'] + ' курс' + secline);
}

function getQuestList() {

    $$.post('http://nefritor.h1n.ru/php/getQuestList.php', function (data) {
        if (data != '-1') {
            var questsObj = [];
            for (var i = 0; i < Object.keys(JSON.parse(data)).length; i++){
                questsObj.push({
                    id: JSON.parse(data)[i]['id'],
                    title: JSON.parse(data)[i]['task'],
                    short_title: JSON.parse(data)[i]['short_desc'],
                    long_title: JSON.parse(data)[i]['long_desc']});
            }
            var myList = myApp.virtualList('.ul-list-quests', {
                // Array with items data
                items: questsObj,
                // Template 7 template to render each item
                template: '<li class="swipeout">' +
                    '<div class="swipeout-content">'+
                        '<a href="#" onclick="toFullQuest({{id}})" data-picker=".picker-1" class="close-picker item-content item-link">'+
                            '<div class="item-inner">'+
                                '<div class="item-title-row">'+
                                    '<div class="item-title">{{title}}</div>'+
                                    '<div class="item-after">17:14</div>'+
                                '</div>'+
                                '<div class="item-subtitle">{{short_title}}</div>'+
                                '<div class="item-text">{{long_title}}</div>'+
                            '</div>'+
                        '</a>'+
                    '</div>'+
                    '<div class="swipeout-actions-right">'+
                        '<a href="#" class="mark bg-orange">Mark</a>'+
                        '<a href="#" class="swipeout-delete swipeout-overswipe">Delete</a>'+
                    '</div>'+
                '</li>'
            });
        } else {
            myApp.alert('Похоже, что заданий вообще нет)', 'Заданий не найдено...');
        }
    });
}

function toFullQuest(id){
    questId = id;
    mainView.router.loadPage('fullquest.html');
}

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");
});

// Option 2. Using one 'pageInit' event handler for all pages:
$$(document).on('pageInit', function (e) {
    // Get page data from event data
    var page = e.detail.page;

    if (page.name === 'profile') {
        $$.post('http://nefritor.h1n.ru/php/getUserData.php', {userid:myId}, function (data) {
            if (data != '-1') {
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
        getQuestList();
    } else if (page.name === 'fullquest') {
        $$.post('http://nefritor.h1n.ru/php/getQuestInfo.php', {questId:questId},  function (data) {
            if (data != '-1') {
                $$('.quest-title').text(JSON.parse(data)['task']);
                //$$('.quest-header').text(JSON.parse(data)['task']);
                $$('.quest-full-description').text(JSON.parse(data)['long_desc']);

                var map = new GMaps({
                    div: '#mapmin',
                    lat: -12.043333,
                    lng: -77.028333
                });

                // Try HTML5 geolocation.
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function(position) {
                        var pos = {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        };
                        map.setCenter(pos);
                    });
                }
            } else {
                myApp.alert('Не удалось получить информацию...', 'Ошибка');
            }
        });
    } else if (page.name === 'map'){
        var map = new GMaps({
            div: '#map',
            lat: -12.043333,
            lng: -77.028333
        });

        // Try HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.setCenter(pos);
            });
        }
    }
});

// Option 2. Using live 'pageInit' event handlers for each page
$$(document).on('pageInit', '.page[data-page="about"]', function (e) {
    // Following code will be executed for page with data-page attribute equal to "about"
    //myApp.alert('Here comes About page');
});