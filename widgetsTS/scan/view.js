//对应widget.js中MyWidget实例化后的对象
var thisWidget;

//当前页面业务
function initWidgetView(_thisWidget) {
    thisWidget = _thisWidget;

    if (thisWidget.config && thisWidget.config.style) {//适应不同样式
        $("body").addClass(thisWidget.config.style);
    }

    //测试:调用了【index页面对应widg.js】 中的方法
    // thisWidget.testFun();

    $("#kuosan").click(function(){
        thisWidget.showCircleScan();
    });
    $("#saomiao").click(function(){
        thisWidget.showRadarScan();
    });
    $("#clear").click(function(){
        thisWidget.clear();
    });

}