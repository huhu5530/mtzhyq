//对应widget.js中MyWidget实例化后的对象
var thisWidget;


//当前页面业务
function initWidgetView(_thisWidget) {
    thisWidget = _thisWidget;

    if (thisWidget.config && thisWidget.config.style) {
        $("body").addClass(thisWidget.config.style);
    }


    $("#btnDraw").click(function () {
        thisWidget.drawPolygon();
    });

    $("#begin").click(function () {
        var minValue = Number($("#minHeight").val());
        var maxValue = Number($("#maxHeight").val());
        var speed = Number($("#speed").val())

        var result = thisWidget.startFx({
            height: minValue,
            maxHeight: maxValue,
            speed: speed,
        });
        if (result) {
            $("#paramView").hide();
            $("#resultView").show();
        }
    });

    $("#clear").click(function () {
        $("#resultView").hide();
        $("#paramView").show();
        $("#msg").html('');

        thisWidget.clear();
    });

}


function onChangeHeight(height) {
    $("#msg").html('当前高度：' + height.toFixed(1));
}
function onStop() {
    $("#msg").html('已完成分析');
}



function updateHeightForDraw(minDraw, maxDraw) {
    $("#minHeight").val(minDraw.toFixed(1));
    $("#maxHeight").val(maxDraw.toFixed(1));
}