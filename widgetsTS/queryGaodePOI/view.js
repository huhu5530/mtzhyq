//对应widget.js中MyWidget实例化后的对象
var thisWidget;
var $table;
var drawEntity;
var selectType;
var nowData = [];
//当前页面业务
function initWidgetView(_thisWidget) {
    thisWidget = _thisWidget;
    if (thisWidget.config && thisWidget.config.style) { //适应不同样式
        $("body").addClass(thisWidget.config.style);
    }

    $("#txtCity").citypicker({
        simple: true,
        level: 'district',
        placeholder: "请选择省/市州/区县",
        province: '安徽省',
        city: '合肥市',
        // district: '蜀山区'
    });
    // $(".city-picker-span .placeholder").text("请选择省/市州/区县");

    initTable();

    $('input:radio[name="queryContent"]').change(function () {
        selectType = $(this).val();
        switch (selectType) {
            default: //按城市  
                $(".queryByCity").show();
                $(".queryByDraw").hide();
                break;
            case "2": //当前视角范围  
                $(".queryByCity").hide();
                $(".queryByDraw").hide();
                break;
            case "3": //按范围 
                $(".queryByCity").hide();
                $(".queryByDraw").show();
                break;
        }
    });
    $("#query").click(function () { 
        $table.bootstrapTable("load", []);
        $("#resultView").hide();
        $("#loadMore").hide();
        thisWidget.clearAll(selectType == "3");
        nowData = [];
        switch (selectType) {
            default: //按城市 
                var dnnm = $("#txtCity").data('citypicker').getCode();
                if (!dnnm) {
                    window.toastr.error("请选择具体地区！");
                    haoutil.loading.close();
                    return;
                }
                var queryVal = $.trim($("#queryText").val());
                if (queryVal.length == 0) {
                    window.toastr.error("请输入 名称 关键字筛选数据！")
                    return;
                }
                haoutil.loading.show();
                thisWidget.loadData({
                    page: 1,
                    city: dnnm,
                    count: 25,
                    text: queryVal,
                    citylimit: true,
                });
                break;
            case "2": //当前视角范围   
                var queryVal = $.trim($("#queryText").val());
                if (queryVal.length == 0) {
                    window.toastr.error("请输入 名称 关键字筛选数据！")
                    return;
                }
                var extent = thisWidget.getExtent();
                haoutil.loading.show();
                thisWidget.loadData({
                    page: 1,
                    points: [
                        [extent.xmin, extent.ymin],
                        [extent.xmin, extent.ymax],
                        [extent.xmax, extent.ymax],
                        [extent.xmax, extent.ymin]
                    ],

                    count: 25,
                    text: queryVal
                });
                break;
            case "3": //按范围
                if (!drawEntity) {
                    haoutil.loading.hide();
                    toastr.warning("请绘制限定范围！");
                    return;
                }
                var queryVal = $.trim($("#queryText").val());
                if (queryVal.length == 0) {
                    window.toastr.error("请输入 名称 关键字筛选数据！")
                    return;
                }
                haoutil.loading.show();
                thisWidget.loadData({
                    page: 1,
                    entity: drawEntity,
                    count: 25,
                    text: queryVal
                });
                break;
        }
    });
    //框选查询 矩形  
    $("#drawRectangle").click(function () {
        clearAll();
        thisWidget.draw(1, function (entity) {
            drawEntity = entity;
        })
    });
    //框选查询   多边 
    $("#drawPolygon").click(function () {
        clearAll();
        thisWidget.draw(2, function (entity) {
            drawEntity = entity;
        })
    });
    //框选查询   圆 
    $("#drawCircle").click(function () {
        clearAll();
        thisWidget.draw(3, function (entity) {
            drawEntity = entity;
        })
    });

    $("#clearDraw").click(function () {
        $("#txtCity").citypicker('reset');
        $(".city-picker-span .placeholder").text("请选择省/市州/区县");
        $("#queryText").val("");
        clearAll();
        thisWidget.clearAll();
    });

    //加载更多- 下一页
    $("#loadMore").click(function () {
        thisWidget.loadMore();
    });
}

function loadSuccess(res) {
    var data = res.list;
    nowData = nowData.concat(data);
    $("#resultView").show();
    $table.bootstrapTable("append", data)
    $("#count").html(nowData.length);
    $("#allcount").html(res.allcount);
    if (data.length == 0 || nowData.length >= res.allcount || res.allcount < 25 || nowData.length < 20) {
        $("#loadMore").hide();
    } else {
        $("#loadMore").show();
    }
    haoutil.loading.close();
}

//清除页面
function clearAll() {
    drawEntity = null;
    $table.bootstrapTable("load", []);
    $("#resultView").hide();
    $("#loadMore").hide();
}

function getHeight() {
    return $(window).height() - 230;
}

function initTable() {
    $table = $('#table');
    $table.bootstrapTable({
        height: getHeight(),
        singleSelect: true, //单选
        pagination: false,
        iconsPrefix: 'fa',
        columns: [
            {
                field: 'index',
                title: '序号',
                sortable: true,
                editable: false,
                align: 'left',
                formatter: function (value, row, index) {
                    return index + 1;
                }
            }, {
                field: 'name',
                title: '名称',
                sortable: true,
                editable: false,
                align: 'left',
                formatter: function (value, row) {
                    if (value.length == 0 || !value) return ""
                    return value;
                }
            },
            {
                field: 'address',
                title: '地址',
                sortable: true,
                editable: false,
                align: 'left',
                formatter: function (value, row) {
                    if (value.length == 0 || !value) return ""
                    return value;
                }
            },
            // {
            //     field: 'tel',
            //     title: '联系电话',
            //     sortable: true,
            //     editable: false,
            //     align: 'left',
            //     formatter: function (value, row) {
            //         if (value.length == 0 || !value) return "--"
            //         return value;
            //     }
            // }
        ],
        onClickRow: function (item, $element, field) {
            thisWidget.centerAt(item);
        }
    });


    $(window).resize(function () {
        $table.bootstrapTable('refreshOptions', {
            height: getHeight()
        });
    });
}