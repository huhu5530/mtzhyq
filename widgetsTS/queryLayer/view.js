//对应widget.js中MyWidget实例化后的对象
var thisWidget;

//当前页面业务
function initWidgetView(_thisWidget) {
    thisWidget = _thisWidget;

    if (thisWidget.config && thisWidget.config.style) {//适应不同样式
        $("body").addClass(thisWidget.config.style);
    }

    initExtent()
    initLayer()
}

//限定区域相关处理
function initExtent() {

    $("#trFwDraw").hide();
    $("#trFwBuffer").hide();
    $('input:radio[name="radioFwType"]').change(function () {
        var type = $(this).val();

        $("#trFwDraw").hide();
        $("#trFwBuffer").hide();
        thisWidget.clearDraw();

        if (type == "2") {
            $("#trFwDraw").show();
        }
        else if (type == "3") {
            $("#trFwBuffer").show();
        }

    });
    //框选查询 矩形  
    $("#drawRectangle").click(function () {
        thisWidget.clearDraw();
        thisWidget.drawControl.startDraw({
            "type": "rectangle",
            "style": {
                "color": "#00FF00",
                "opacity": 0.3,
                "outline": true,
                "outlineColor": "#ffffff",
                "clampToGround": true
            },
        });
    });
    //框选查询   圆 
    $("#drawCircle").click(function () {
        thisWidget.clearDraw();
        thisWidget.drawControl.startDraw({
            "type": "circle",
            "style": {
                "color": "#00FF00",
                "opacity": 0.3,
                "outline": true,
                "outlineColor": "#ffffff",
                "clampToGround": true
            },
        });
    });

    //框选查询   多边 
    $("#drawPolygon").click(function () {
        thisWidget.clearDraw();
        thisWidget.drawControl.startDraw({
            "type": "polygon",
            "style": {
                "color": "#00FF00",
                "opacity": 0.3,
                "outline": true,
                "outlineColor": "#ffffff",
                "clampToGround": true
            },
        });
    });
    $("#drawClear").click(function () {
        thisWidget.clearDraw();
    });


    //缓冲区  
    $("#txtRadius").change(function (e) {
        thisWidget.updateBufferForRadius();
    });
    $("#drawBufferPoint").click(function () {
        thisWidget.clearDraw();
        thisWidget.drawControl.startDraw({
            type: "point",
            style: {
                pixelSize: 12,
                color: '#ffff00'
            },
            buffer: true//标识是缓冲分析
        });
    });
    $("#drawBufferLine").click(function () {
        thisWidget.clearDraw();
        thisWidget.drawControl.startDraw({
            type: "polyline",
            style: {
                color: "#ffff00",
                width: 3,
                clampToGround: true,
            },
            buffer: true//标识是缓冲分析
        });
    });
    $("#drawBufferPolygon").click(function () {
        thisWidget.clearDraw();
        thisWidget.drawControl.startDraw({
            type: "polygon",
            style: {
                color: "#ffff00",
                outline: true,
                outlineColor: "#f0ce22",
                outlineWidth: 4,
                opacity: 0.5,
                clampToGround: true
            },
            buffer: true//标识是缓冲分析
        });
    });

    $("#btnQuery").click(function () {
        excuteSqlQuery();
    });
    $("#btnClear").click(function () {
        thisWidget.clearDraw();
        clearResult()
    });

}


function getBufferRadius() {
    var bufferRadius = Number($("#txtRadius").val()) * 1000; //km
    return bufferRadius
}

//图层相关处理
var treeObj
var layersObj = {}
var layersCfg;

function initLayer() {
    $.getJSON("config.json", function (data) {
        layersCfg = data.layers.reverse();
        initTree()
    });


    $table = $('#tableResult');
    $(window).resize(function () {
        $table.bootstrapTable('refreshOptions', {
            height: getHeight()
        });
    });
}


function initTree() {

    //初始化树
    var setting = {
        check: {
            enable: true
        },
        data: {
            simpleData: {
                enable: true
            }
        },
        callback: {
            onCheck: treeOverlays_onCheck,
            onClick: treeOverlays_onClick,
        },
    };

    var zNodes = [];
    for (var i = layersCfg.length - 1; i >= 0; i--) {
        var item = layersCfg[i];
        if (item == null || item.hide) continue;

        item.index = i;
        item.result = [];

        var node = {
            id: item.id || 0,
            pId: item.pid || -1,
            name: item.name,
            index: i,
        };

        if (item.url) {
            node.icon = "images/layer.png";
            layersObj[i] = item;
            zNodes.push(node);
        } else {
            node.icon = "images/folder.png";
            node.open = item.open == null ? true : item.open;
            zNodes.push(node);
        }
    }

    $.fn.zTree.destroy()
    treeObj = $.fn.zTree.init($("#treeOverlays"), setting, zNodes);
}

function treeOverlays_onCheck(e, treeId, treeNode) {
    var zTree = $.fn.zTree.getZTreeObj(treeId);
    //获得所有改变check状态的节点
    var changedNodes = zTree.getChangeCheckedNodes();
    for (var i = 0; i < changedNodes.length; i++) {
        var treeNode = changedNodes[i];
        treeNode.checkedOld = treeNode.checked;

        var layer = layersObj[treeNode.index];
        if (layer == null) continue;

        layer.visible = treeNode.checked
    }
}
function treeOverlays_onClick(event, treeId, treeNode) {
    if (treeNode == null || treeNode.id == null) return;

    var layer = layersObj[treeNode.index];
    if (layer == null) return;

    initTable(layer)
};

var $table; 
function initTable(layer) { 
    var columnsTbl = [];
    columnsTbl.push({
        field: 'index',
        title: '序号',
        sortable: true,
        editable: false,
        align: 'left',
        formatter: function (value, row, index) {
            return index + 1;
        }
    });

    var tableCoumns = layer.tableCoumns;
    for (var i = 0; i < layer.columns.length; i++) {
        var column = layer.columns[i];

        if (!tableCoumns || tableCoumns.indexOf(column['field']) != -1) {
            columnsTbl.push({
                field: column.field,
                title: column.name,
                sortable: true,
                editable: false,
                align: 'left',
            });
        }
    };


    $table.bootstrapTable("destroy");
    $table.bootstrapTable({
        data: layer.result,
        height: getHeight(),
        singleSelect: false, //单选
        showPaginationSwitch: false,
        pagination: true,
        pageNumber: 1,
        pageSize: 10,
        pageList: [5, 10, 20, 50, 100],
        columns: columnsTbl,
        onClickRow: function (item, $element, field) {
            thisWidget.centerAt(item,layer);
        }
    });
}
function getHeight() {
    return $(window).height() - 400;
}

//开始查询 

function clearResult() {
    allCount = 0;
    $("#lblCounts").html('');

    thisWidget.clearShowFeature(); 
    $table.bootstrapTable("destroy");

    for (var i = layersCfg.length - 1; i >= 0; i--) {
        var item = layersCfg[i];
        if (item == null || item.hide) continue;

        item.result = [];

        if (item.url) {
            var node = treeObj.getNodeByParam("index", item.index);
            node.name = `${item.name}`
            treeObj.updateNode(node);
        }
    }
}

function excuteSqlQuery() {
    clearResult()

    var arrSelect = [];
    for (var i in layersObj) {
        var item = layersObj[i]
        if (item.visible)
            arrSelect.push(item);
    }

    if (arrSelect.length == 0) {
        toastr.warning("请至少选择1个图层");
        return;
    }

    var drawtype = $('input:radio[name="radioFwType"]:checked').val();

    if (!thisWidget.hasDraw() && (drawtype == "2" || drawtype == "3")) {
        toastr.warning("请在地图上鼠标单击绘制限定范围！");
        return;
    }
    var extent = thisWidget.getExtentByType(drawtype);

    var col_val = $.trim($("#txtKey").val());

    for (let i = 0, len = arrSelect.length; i < len; i++) {
        var layer = arrSelect[i];

        var sqlstring;
        if (col_val.length > 0) {
            sqlstring = "1=1 "
            layer.queryCoumns.forEach(col_name => {
                sqlstring += " and " + col_name + " like '%" + col_val + "%' ";
            })
        }

        thisWidget.query({
            layer: layer,
            where: sqlstring,
            extent: extent,
        });
    }
}


var allCount;
function updateAllCount(thiscount, layer) {
    allCount += thiscount
    $("#lblCounts").html(`共${allCount}条`);

    var node = treeObj && treeObj.getNodeByParam("index", layer.index);
    node.name = `${layer.name}(${thiscount})`
    treeObj.updateNode(node);
}