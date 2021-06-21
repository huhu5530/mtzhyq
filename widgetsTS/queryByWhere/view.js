//对应widget.js中MyWidget实例化后的对象
var thisWidget;

//当前选择的图层
var selectedLayer;

//where条件的配置
var whereCfg;

//当前页面业务
function initWidgetView(_thisWidget) {
    thisWidget = _thisWidget;

    if (thisWidget.config && thisWidget.config.style) {//适应不同样式
        $("body").addClass(thisWidget.config.style);
    }


    $.getJSON("config.json", function (data) {
        whereCfg = data.where; //记录查询条件配置

        var layersCfg = data.layers;
        var overlayLayers = {};

        var zNodes = [];
        var defSelected;
        for (var i = 0; i < layersCfg.length; i++) {
            var item = layersCfg[i];

            if (item.name == null || item.name == '')
                continue;

            var node = {
                text: item.name,
                id: item.id || 999 + i,
                pId: item.pid || -1,
            };


            if (item.url == null) {
                node.iconCls = "icon-muyao-folder";
                node.state = (item.open == "true" ? "open" : "closed");
            }
            else {
                if (defSelected == null)
                    defSelected = node.id;//默认选择第一个

                node.iconCls = "icon-muyao-shape_move_forwards";
                overlayLayers[node.id] = item;
            }
            zNodes.push(node);
        }

        $('#queryonewhere_cmb_layer').combotree({
            width: 308,
            data: zNodes,
            loadFilter: function (rows) {
                return convertTree(rows);
            },
            onChange: function (newValue, oldValue) {
                selectedLayer = null;
                var layer = overlayLayers[newValue];
                if (layer == null) {
                    alert('请不要选择分组，请重新选择图层!');
                    $('#queryonewhere_cmb_layer').combotree('setValue', oldValue);
                    return;
                }

                selectedLayer = layer;

                var hasCfgWhere = (selectedLayer.columnsShow && selectedLayer.columnsShow.where);
                var hasCfgTable = (selectedLayer.columnsShow && selectedLayer.columnsShow.table);


                var columnsTbl = [];
                var columnsWhere = [];

                //设置查询结果面板
                var idcol = {};
                idcol["name"] = "序号";
                idcol["field"] = "rowID";
                columnsTbl.push(idcol);

                for (var i = 0; i < selectedLayer.columns.length; i++) {
                    var column = selectedLayer.columns[i];
                    column.editable = true

                    if (!hasCfgTable || selectedLayer.columnsShow.table.indexOf(column['field']) != -1) {
                        column.title = column.name;
                        columnsTbl.push(column);
                    }

                    if (!hasCfgWhere || selectedLayer.columnsShow.where.indexOf(column['field']) != -1)
                        columnsWhere.push(column);
                };

                thisWidget.clearShowFeature();
                $('#queryonewhere_table').datagrid({
                    columns: [columnsTbl],
                    data: []
                });


                //设置字段列表
                $("#queryonewhere_cmb_col_name").combobox({
                    data: columnsWhere,
                    valueField: 'field',
                    textField: 'name',
                    multiple: false, //不允许多选
                    editable: true, //禁止编辑
                    onChange: function (value) {
                        var item = getColumnCfgItem(value);
                        if (item == null) return;

                        var type = item.type || "text";
                        $("#queryonewhere_cmb_col_where").combobox({
                            data: whereCfg[type],
                            multiple: false, //不允许多选
                            editable: false, //禁止编辑
                            width: 100,
                            valueField: 'field',
                            textField: 'name'
                        });
                        $('#queryonewhere_cmb_col_where').combobox('setValue', whereCfg[type][0]['field']); //默认选择第1项
                    }
                });
                $('#queryonewhere_cmb_col_name').combobox('setValue', selectedLayer.columns[0]['field']);//默认选择第1项

                //设置完成

            }
        });
        $('#queryonewhere_cmb_layer').combotree('setValue', defSelected);

    });




    $("#queryonewhere_cmb_col_name").combobox({
        width: 100
    });

    $("#queryonewhere_txt_col_val").textbox({
        width: 100
    });

    //切换选择区域方式
    $('input:radio[name="queryonewhere_drawtype"]').change(function () {
        var drawtype = $('input:radio[name="queryonewhere_drawtype"]:checked').val();
        switch (drawtype) {
            case "0":
                $("#drawPolyView").hide();
                thisWidget.clearDraw();
                break;
            case "1":
                $("#drawPolyView").hide();
                thisWidget.clearDraw();
                break;
            case "2":
                $("#drawPolyView").show();
                break;
        }
    });
    //框选查询 矩形  
    $("#drawRectangle").click(function () {
        thisWidget.drawRectangle();
    });
    //框选查询   多边 
    $("#drawPolygon").click(function () {
        thisWidget.drawPolygon();
    });
    //框选查询   圆 
    $("#drawCircle").click(function () {
        thisWidget.drawCircle();
    });

    $("#queryonewhere_table").datagrid({
        singleSelect: true,
        pagination: true,
        rownumbers: false,
        height: getHeight(),
        fitColumns: true,
        pagination: true,
        onClickRow: function (rowIndex, rowData) {
            thisWidget.centerAt(rowData.rowID);
        }
    });

    $("#btnExQueryOneWhere").click(function () {
        excuteSqlQuery();
    });
}


//获取指定字段的配置信息
function getColumnCfgItem(fieldvalue) {
    if (selectedLayer == null) return null;

    for (var i = 0; i < selectedLayer.columns.length; i++) {
        var thisfield = selectedLayer.columns[i];
        if (thisfield.field == fieldvalue) {
            return thisfield;
        }
    }
    return null;
}



function convertTree(rows) {
    function exists(rows, parentId) {
        for (var i = 0; i < rows.length; i++) {
            if (rows[i].id == parentId) return true;
        }
        return false;
    }

    var nodes = [];
    // get the top level nodes
    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (!exists(rows, row.pId)) {
            nodes.push({
                id: row.id,
                text: row.text
            });
        }
    }

    var toDo = [];
    for (var i = 0; i < nodes.length; i++) {
        toDo.push(nodes[i]);
    }
    while (toDo.length) {
        var node = toDo.shift();	// the parent node
        // get the children nodes
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            if (row.pId == node.id) {
                var child = { id: row.id, text: row.text };
                if (node.children) {
                    node.children.push(child);
                } else {
                    node.children = [child];
                }
                toDo.push(child);
            }
        }
    }
    return nodes;
}




function excuteSqlQuery() {
    thisWidget.clearShowFeature();

    if (selectedLayer == null) {
        toastr.warning("请选择图层");
        return;
    }
    var drawtype = $('input:radio[name="queryonewhere_drawtype"]:checked').val();

    var col_name = $("#queryonewhere_cmb_col_name").combobox("getValue");
    var col_where = $("#queryonewhere_cmb_col_where").combobox("getValue");
    var col_val = $("#queryonewhere_txt_col_val").textbox("getValue");

    if (!thisWidget.hasDraw() && drawtype == "2") {
        toastr.warning("请在地图上鼠标单击绘制限定范围！");
        return;
    }

    var sqlstring;
    if ((col_val != null && col_val.length > 0)) {
        if (col_name == null || col_name.length == 0) {
            toastr.warning("请选择需要查询的字段");
            return;
        }
        if (col_where == null || col_where.length == 0) {
            toastr.warning("请选择查询条件方式");
            return;
        }

        var fieldtype = "text";
        var item = getColumnCfgItem(col_name);
        if (item != null && item.type)
            fieldtype = item.type;

        if (fieldtype == "number") {
            sqlstring = col_name + " " + col_where + " " + col_val + "  ";
        }
        else {
            if (col_where == "like")
                sqlstring = col_name + " " + col_where + " '%" + col_val + "%' ";
            else
                sqlstring = col_name + " " + col_where + " '" + col_val + "' ";
        }
    }

    haoutil.loading.show(); //loading
    thisWidget.query({
        url: selectedLayer.url,
        where: sqlstring,
        extenttype: drawtype,
        end: function () {
            haoutil.loading.hide();
        }
    });
}

function clearResult() {
    $('#queryonewhere_table').datagrid('loadData', { total: 0, rows: [] });
}

function showResult(arrResultData) {
    $('#queryonewhere_table').datagrid('loadData', arrResultData.slice(0, 10));
    var pager = $("#queryonewhere_table").datagrid("getPager");
    pager.pagination({
        total: arrResultData.length,
        onSelectPage: function (pageNo, pageSize) {
            var start = (pageNo - 1) * pageSize;
            var end = start + pageSize;
            $("#queryonewhere_table").datagrid("loadData", arrResultData.slice(start, end));
            pager.pagination('refresh', {
                total: arrResultData.length,
                pageNumber: pageNo
            });
        }
    });
}


function getHeight() {
    return $(window).height() - 90;
}
