//对应widget.js中MyWidget实例化后的对象
var thisWidget;

//当前页面业务
function initWidgetView(_thisWidget) {
    thisWidget = _thisWidget;

    if (thisWidget.config && thisWidget.config.style) {//适应不同样式
        $("body").addClass(thisWidget.config.style);
    }

    $(window).resize(refHeight);
    refHeight();

    // 搜索框绑定文本框值发生变化,隐藏默认搜索信息栏,显示匹配结果列表
    $("#txtKey").bind("input propertychange", function () {
        var queryVal = $.trim($("#txtKey").val());
        var newdata = thisWidget.queryData({ key: queryVal }, bindData);
    });

    $("#qyList").mCustomScrollbar({
        theme: "minimal"
    });

    thisWidget.queryData({ key: '' }, bindData);
}



//绑定数据的table
function bindData(newdata) {
    var inhtml = "";
    for (var i = 0; i < newdata.length; i++) {
        
        var item = newdata[i];
        inhtml += ' <div class="col-small col-big activate">'
            + '  <div class="container1" onclick="thisWidget.showItem(\'' + item.tfid + '\')">'
            + '    <div class="container2">'
            + '        <span class="numSpan">' + (i + 1) + '</span>'
            + '        <div class="line1">' +  item.name + '<span class="typeLabel">' + item.tfid + '</span></div>'
            + '        <div class="line2">开始时间：' + item.starttime + '</div>'
            + '        <div class="line3">结束时间：' + item.endtime+ '</div>'
            + '    </div>'
            + '  </div>'
            + '</div>';
    }
    $("#mCSB_1_container").html(inhtml);
}



function refHeight() {
    var height = $(window).height();
    $("#qyList").height(height);
}

function searchToggle(obj, evt) {
    var container = $(obj).closest('.search-wrapper');
    if (!container.hasClass('active')) {
        container.addClass('active');
        evt.preventDefault();
    } else if (container.hasClass('active') && $(obj).closest('.input-holder').length == 0) {
        container.removeClass('active');
        container.find('.search-input').val('');
    }
}