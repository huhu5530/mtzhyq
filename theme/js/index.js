﻿'use strict'; //首页js by 木遥（微信:  http://marsgis.cn/weixin.html ） 2018-4-12

var defpage;
var rightFrame;

$(document).ready(function () {
    initView();
});

function initView() {

    //获取用户信息,用于校验token
    if (window.hasServer) {
        sendAjax({
            "url": "sys/user/" + getUserId(),
            type: "get",
            contentType: "application/x-www-form-urlencoded",
            success: function (data) {

            },
        });
    }



    var user = JSON.parse(haoutil.storage.get("user"))||{name:"火星科技"};
    $("#lblUserName").html(user.name);

    //根据设置，加载不同皮肤
    //setStyleByTheme();

    $('#userInfo').on('mouseenter', function () {
        var list = $(this).find('dl'),
            child = list.children(),
            size = child.size(),
            offsetV = 6;

        list.css({
            'height': $(child.get(size - 1)).height() * size + offsetV
        });

    })
    $('#userInfo').on('mouseleave', function () {
        var list = $(this).find('dl');

        list.css({
            'height': 0
        });
    });

    rightFrame = document.getElementById('rightFrame');
    if (rightFrame.attachEvent) {
        rightFrame.attachEvent("onload", rightFrame_onload);
    } else {
        rightFrame.onload = rightFrame_onload;
    }

    //加载菜单
    $.ajax({
        url: '../data/menu.json',
        type: 'get',
        dataType: "json",
        cache: false,
        timeout: 0,
        beforeSend: function () {
            $('#navLoadEle').show();
        },
        success: function (json) {
            $('#navLoadEle').hide(); // loading

            defpage = json.defpage;
            //showPage(defpage);

            initMenu(json, clkMenuNodeItem);
        },
        error: function (d) {
            $('#navLoadEle').hide(); // loading

        },
    });

}

//根据设置，加载不同皮肤
//function setStyleByTheme() {
//    var theme;
//    var style = haoutil.system.getRequestByName('style');
//    if (style) { 
//        haoutil.storage.add('theme', style);
//    } else {
//        theme = haoutil.storage.get('theme'); 
//    }
//    if (theme == null) return;

//    switch (theme) {
//        case 'blue':
//            haoutil.system.loadResource("css/themeBlue.css");
//            break;
//        case 'gray':
//            haoutil.system.loadResource("css/themeGray.css");
//            break;
//        case 'steelblue':
//            haoutil.system.loadResource("css/themeSteelBlue.css");
//            break;
//        default:
//            break;
//    }
//}

//构造菜单目录
function initMenu(d, callback) {
    var da = d.menu || [],
        menu = $('#menu').get(0),
        navList = $('#navList'),
        positionM = $('#positionMarker').get(0),
        i = 0, len = 0,
        CLA_N = 'active',
        S_PX = 'px',
        OFFL_V = 6,
        _creNavFn = function (d) {
            var liE = document.createElement('li'),
                aEle = document.createElement('a'),
                spanEle = document.createElement('span'),
                divSubMenuEle = document.createElement('div'),
                resultStr = '';

            spanEle.className = d.icon || '';
            aEle.href = 'javascript:void(0)';
            aEle.appendChild(spanEle);
            aEle.innerHTML += d.name || '';

            $(divSubMenuEle).addClass('navCon');

            if (!d.children) {
                aEle.data = d;
            }

            liE.appendChild(aEle);
            liE.appendChild(divSubMenuEle);

            return liE;
        },
        _creMenuFn = function (d) {
            var i = 0, len = 0, arr = d.children, j = 0, subLen = 0,
                doc = document,
                dlE = null, secDlE = doc.createElement('dl'), dtE = null, ddE = null, aE = null, spanE = null, tempO = null, tempSubO = null;

            if (arr && $.isArray(arr) && arr.length > 0) {
                for (i = 0, len = arr.length; i < len; ++i) {
                    tempO = arr[i];
                    if (tempO.children) {
                        dlE = doc.createElement('dl');
                        dtE = doc.createElement('dt');
                        spanE = doc.createElement('span');
                        aE = doc.createElement('a');
                        spanE.className = tempO.icon || '';

                        if (tempO.uri) {
                            aE = doc.createElement('a');
                            aE.href = 'javascript:void(0)';
                            dtE.appendChild(aE);
                        }
                        dtE.appendChild(spanE);
                        dtE.innerHTML += tempO.name || '';
                        dlE.appendChild(dtE);

                        if (tempO.children) {
                            for (j = 0, subLen = tempO.children.length; j < subLen; ++j) {
                                tempSubO = tempO.children[j];

                                ddE = doc.createElement('dd');
                                aE = doc.createElement('a');
                                aE.href = 'javascript:void(0)';

                                spanE = doc.createElement('span');
                                spanE.className = tempSubO.icon || '';
                                aE.appendChild(spanE);
                                aE.innerHTML += tempSubO.name || '';
                                aE.data = tempSubO;

                                ddE.appendChild(aE);

                                dlE.appendChild(ddE);

                            }

                        }

                        fragE.appendChild(dlE);

                    } else {
                        dtE = doc.createElement('dt');
                        spanE = doc.createElement('span');
                        aE = doc.createElement('a');

                        spanE.className = tempO.icon || '';
                        aE.href = 'javascript:void(0)';

                        aE.appendChild(spanE);
                        aE.innerHTML += tempO.name || '';

                        aE.data = tempO;
                        secDlE.className = 'secList';

                        dtE.appendChild(aE);
                        secDlE.appendChild(dtE);
                        fragE.appendChild(secDlE);
                    }
                }
            }
            return fragE;
        },
        _enterFn = function (e) {
            var evt = e || window.event,
                tar = e.target || e.srcElement,
                navCon = $(this).find('.navCon'),
                ind = $(this).index(),
                l = $(this).offset().left, widN = 0, offW = 30;

            docW = $(document).width();
            menu.innerHTML = '';
            navCon.html('');
            navCon.removeClass(CLA_N);

            $(menu).append(_creMenuFn(da[ind]));
            navCon.append(_creMenuFn(da[ind]));

            if ($(menu).children().size() > 1) {
                // widN = 0;
                // $(menu).children().each(function (i, v) {
                //     console.log( v.offsetWidth ) ;
                //     console.log($(v),$(v).offset(),$(v).width(),$(v).innerWidth(),$(v).outerWidth()) ;
                //     widN += $(v).width();
                // });
                // $(menu).css({
                //     'width': widN + 6
                //     //'width': widN
                // });
                $(menu).css({
                    //'width': 'auto'
                    'width': 'auto'
                    //'float' : 'normal'
                });
            } else if ($(menu).children().size() === 1) {

                // $(menu).css({
                //'width': 'auto'
                //'width' : $(this).width()
                //'float' : 'normal'
                // });
            } else {

            }


            widN = $(menu).width();

            l = l >= (docW - widN - offW) ? docW - widN - offW : l;

            $(menu).css({
                'left': l + S_PX
            });

            $(positionM).css({
                'left': $(this).offset().left + S_PX,
                'width': $(this).width()
            });

            $('#menu dl').on('click', function (e) {
                e.preventDefault();

                if (e.target.tagName === 'A') {
                    if ($.isFunction(callback) && e.target.data) {
                        callback(e.target.data);
                    }
                }

            });

            if ($(menu).children().size() >= 1) {
                $(menu).addClass(CLA_N);
            }

            //indNum = this.ind;
            indNum = ind;
        },
        _leaveFn = function (e) {
            var evt = e || L.event,
                navCon = $(this).find('.navCon'),
                tar = e.target || e.srcElement;

            $(positionM).css({
                'left': $(this).offset().left,
                'width': 0
            });
            navCon.removeClass(CLA_N);

            $(menu).removeClass(CLA_N);
        },
        _menuEnterFn = function () {
            var el = navList.children().get(indNum);

            for (i = 0, len = navList.children().size(); i < len; ++i) {
                tempE = navList.children().get(i);

                $(tempE.children[0]).removeClass(CLA_N);
            }

            $(positionM).css({
                'left': $(el).offset().left + S_PX,
                'width': $(el).width()
            });

            $(navList.children().get(indNum).children[0]).addClass(CLA_N);
            $(this).addClass(CLA_N);
        },
        _menuLeaveFn = function () {
            var el = navList.children().get(indNum).children[0];

            $(menu).removeClass(CLA_N);
            $(el).removeClass(CLA_N);

            $(positionM).css({
                'left': $(el).offset().left + $(el).width(),
                'width': 0
            });
        },
        _mediaFn = function () {
            navList.find('li').on('click', function (e) {
                var _self = $(this), tar = e.target, subCon = null, dlEs = null;

                if (docW <= VIEW_W) {
                    //console.log(this, docW) ;
                    //console.log( e.target, _self.find('.navCon').height() ) ;

                    subCon = _self.find('.navCon');
                    dlEs = _self.find('dl');
                    dlEs.on('click', function (e) {
                        var _that = $(this);

                        e.preventDefault();
                        e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true;

                        if (e.target.tagName === 'A') {
                            if ($.isFunction(callback) && e.target.data) {
                                callback(e.target.data);
                                return;
                            }
                        }

                        if (!_that.hasClass(CLA_N)) {
                            _that.addClass(CLA_N);
                        } else {
                            _that.removeClass(CLA_N);
                        }
                    });

                    if (!_self.hasClass(CLA_N)) {
                        $('#navList li').removeClass(CLA_N);
                        if (subCon.children().size() > 0) { // Empty
                            _self.addClass(CLA_N);
                        }
                    } else {
                        _self.removeClass(CLA_N);
                    }

                    // if (!_self.hasClass(CLA_N)) {
                    //     if (subCon.children().size() > 0) { // Empty
                    //         _self.addClass(CLA_N);
                    //     }
                    // } else {
                    //     _self.removeClass(CLA_N);
                    // }

                }
            });

        },
        indNum = -1,
        fragE = document.createDocumentFragment(),
        VIEW_W = 768,
        docW = $(document).width(),
        resultStr = '', menuStr = '', tempE = null;

    if ($.isArray(da)) {
        for (i = 0, len = da.length; i < len; ++i) {
            fragE.appendChild(_creNavFn(da[i]));
        }
        navList.get(0).appendChild(fragE);

        // $('#navList li a:first-child').on('click', function (e) {
        //     //e.preventDefault();
        //     //

        //     if (e.target.tagName === 'A') {
        //         if ($.isFunction(callback) && e.target.data) {
        //             callback(e.target.data);
        //         }
        //     }
        // });

        // for (i = 0, len = navList.children().size() ; i < len; ++i) {
        //     tempE = navList.children().get(i);
        //     tempE.ind = i;

        //     $(tempE).on('mouseenter', _enterFn);
        //     $(tempE).on('mouseleave', _leaveFn);
        //     $(tempE).on('click', _enterFn);
        // }

        $('#navList li').on('mouseenter', _enterFn);
        $('#navList li').on('click', function (e) {
            var _self = $(this);

            _enterFn.call(this, e);

            if (e.target.tagName === 'A') {
                if ($.isFunction(callback) && e.target.data) {
                    callback(e.target.data);
                }
            }

        });

        $('#navList li').on('mouseleave', _leaveFn);

        $(menu).on('mouseenter', _menuEnterFn);
        $(menu).on('mouseleave', _menuLeaveFn);

        $(mediaNav).on('click', function () {
            if (!navList.hasClass(CLA_N)) {
                navList.addClass(CLA_N);
            } else {
                navList.find('dl').removeClass(CLA_N); // Reset
                navList.find('.navCon').removeClass(CLA_N); // Reset
                navList.removeClass(CLA_N);
                $('#navList li').removeClass(CLA_N);
            }
        });

        // $('#menu dl').on('click', function (e) {
        //     e.preventDefault();

        //     if (e.target.tagName === 'A') {
        //         if ($.isFunction(callback) && e.target.data) {
        //             callback(e.target.data);
        //         }
        //     }

        // });

        $(window).on('resize', function () {
            docW = $(document).width();

            if (docW > VIEW_W) {
                $('#navList li').removeClass(CLA_N);
                $(positionM).show();
            } else {
                $(positionM).hide();
            }

        });

        _mediaFn();
    }
}



//单击了菜单叶子节点回调
function clkMenuNodeItem(item) {
    //console.log('单击了菜单：' + JSON.stringify(item));

    lastFun = null;

    //存在uri
    var uri = item.uri;
    if (uri && uri.length > 0) {
        console.log('单击了菜单：' + item.uri);

        if (uri.endsWith("js") || uri.indexOf(".js?") != -1) {//widget js
            item = haoutil.system.clone(item, ["_class"]); //需要拷贝，防止在子页面被引用

            var isref = showPage(defpage);
            if (isref) {
                lastFun = function () {
                    rightFrame.contentWindow.activateWidget(item);
                }
            }
            else {
                rightFrame.contentWindow.activateWidget(item);
            }
        }
        else {//页面
            showPage(uri);
        }
    }
    else {
        showPage(defpage);
    }

    //存在事件
    var callback = item.callback;
    if (callback && callback.length > 0) {
        if (rightFrame.contentWindow && rightFrame.contentWindow.activateFunByMenu)
            rightFrame.contentWindow.activateFunByMenu(callback);
        else
            lastFun = function () {
                rightFrame.contentWindow.activateFunByMenu(callback);
            }
    }
}

var lastFun;
function rightFrame_onload() {
    if (lastFun) {
        setTimeout(function () {
            lastFun();
        }, 200);
    }
}

function showPage(url) {
    if (url == null || url == '') return false;

    var lastsrc = $("#rightFrame").attr('src');
    if (lastsrc != url) {
        $("#rightFrame").attr('src', url);
        return true
    }
    else {
        return false;
    }
}

function logout() {
    if (window.hasServer) {
        sendAjax({
            url: "pub/user/logout",
            type: "post",
            success: function (result) {
                location.href = "./login.html";
            },
        });
    }
    else {
        location.href = "./login.html";
    }
}