//对应widget.js中MyWidget实例化后的对象
var thisWidget;

//当前页面业务
function initWidgetView(_thisWidget) {
    thisWidget = _thisWidget;

    if (thisWidget.config && thisWidget.config.style) {//适应不同样式
        $("body").addClass(thisWidget.config.style);
    }

    $(".btn-group button").bind("click", function (e) {
        var val = e.target.value;
        if (val === "fire") {
            thisWidget.createFire();
        }
        else if (val === "rain") {
            thisWidget.addRain();
        }
        else if (val === "snow") {
            thisWidget.addSnow();
        }
        else if (val === "clear") {
            thisWidget.clear();
        }
    });
}
