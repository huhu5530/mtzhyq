/* 2017-12-7 12:41:21 | 修改 木遥（微信:  http://marsgis.cn/weixin.html ） */
//对应widget.js中MyWidget实例化后的对象
var thisWidget;

//当前页面业务  
function initWidgetView(_thisWidget) {
    thisWidget = _thisWidget;

    if (thisWidget.config && thisWidget.config.style) {//适应不同样式
        $("body").addClass(thisWidget.config.style);
    }

    //清除所有标号
    $("#btn_plot_delall").click(function () {
        thisWidget.deleteAll();
        // tab2plot()
    });
    $("#btn_plot_end").click(function (e) {
        thisWidget.endDraw();
    });

    $("#btn_plot_socket").click(function (e) {
        thisWidget.socketConfig();
    });



    //是否可以编辑
    var isedit = true;
    $("#btn_plot_isedit").click(function () {
        isedit = !isedit;

        if (isedit) {
            $(this).removeClass("active");
            $(this).children().removeClass("fa-lock").addClass("fa-unlock");
        }
        else {
            $(this).addClass("active");
            $(this).children().removeClass("fa-unlock").addClass("fa-lock");
        }
        thisWidget.hasEdit(isedit);
    });

    var isPopup = false;
    $("#btn_plot_ispopup").click(function () {
        isPopup = !isPopup;

        if (isPopup) {
            $(this).removeClass("active");
            $(this).children().removeClass("fa-file-text").addClass("fa-file-text-o");
        }
        else {
            $(this).addClass("active");
            $(this).children().removeClass("fa-file-text-o").addClass("fa-file-text");
        }
        thisWidget.hasPopup(isPopup);
    });

    plotFile.initEvent();
    plotlist.bindSelList();
    treeWork.initEvent();
}

//文件处理
var plotFile = {
    initEvent: function () {
        var that = this;

        var isClearForOpenFile;
        $("#btn_plot_openfile").click(function () {
            isClearForOpenFile = true;
            $("#input_plot_file").click();
        });

        $("#btn_plot_openfile2").click(function () {
            isClearForOpenFile = false;
            $("#input_plot_file").click();
        });

        $("#btn_plot_savefile").click(function () {
            thisWidget.downloadJson("标绘");
        });

        $("#input_plot_file").change(function (e) {
            var file = this.files[0];

            var fileName = file.name;
            var fileType = (fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length)).toLowerCase();
            if (fileType != "json") {
                toastr.error('文件类型不合法,请选择json格式标注文件！');
                that.clearPlotFile();
                return;
            }

            if (window.FileReader) {
                var reader = new FileReader();
                reader.readAsText(file, 'UTF-8');
                reader.onloadend = function (e) {
                    var strjson = this.result;
                    thisWidget.loadJson(strjson, isClearForOpenFile, true);
                    that.clearPlotFile();
                };
            }
        });
    },
    clearPlotFile: function () {
        if (!window.addEventListener) {
            document.getElementById('input_plot_file').outerHTML += '';  //IE
        } else {
            document.getElementById('input_plot_file').value = "";   //FF
        }
    }
};

//标号列表相关
var plotlist = {
    //绑定标号列表切换下拉框
    bindSelList: function () {
        var that = this;
        var $sel_plot_list = $("#sel_plot_list");
        $.getJSON("config/plotlist.json", function (plotlist) {
            var inhtml = '';
            var defval;
            var count = 0;
            for (var i in plotlist) {
                inhtml += '<option value="' + i + '">' + i + '(' + plotlist[i].length + ')</option>';
                if (defval == null) defval = i;
                count++;
            }
            var historyval = haoutil.storage.get("plot_list")
            if (historyval) {
                defval = historyval
            }

            if (defval && plotlist[defval]) {
                that.showPlotList(plotlist[defval]);
                $sel_plot_list.attr('data-value', defval);
            }
            if (count > 1) {

                $sel_plot_list.html(inhtml);
                $sel_plot_list.select();
                $sel_plot_list.change(function () {
                    var val = $(this).attr('data-value');
                    var list = plotlist[val];
                    that.showPlotList(list);

                    haoutil.storage.add("plot_list", val);//记录历史值
                });

            } else {
                $sel_plot_list.hide();
                $(".mp_mark").css({ 'margin-top': '10px' });
            }

        });
    },
    _listData: null,
    showPlotList: function (list) {
        this._listData = list;
 
        var inhtml = '';
        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            if (item.hide) continue;

            //处理模型url  
            if (item.style && item.style.modelUrl) {
                if (item.style.modelUrl.startsWith("$plot$")) {
                    item.style.modelUrl = item.style.modelUrl.replace("$plot$/", thisWidget.path);  //是模块内部本级图片
                }
                else if (item.style.modelUrl.startsWith("$serverURL_gltf$")) {
                    item.style.modelUrl = item.style.modelUrl.replace("$serverURL_gltf$", thisWidget.gltfServerURL);
                }
                else if (item.style.modelUrl.startsWith("$serverURL$")) {
                    item.style.modelUrl = item.style.modelUrl.replace("$serverURL$", thisWidget.serverURL);
                }
            }

            var defStyle = thisWidget.getDefStyle(item.edittype || item.type)

            //使用图片图标
            var image;
            if (defStyle) {
                image = defStyle.image;
            }
            if (item.style && item.style.image) {
                image = item.style.image;
            }
            if (item.image) {
                image = item.image;
            }

            if (image) {
                if (image.startsWith("http")) {
                    //不用特殊处理
                }
                else if (image.startsWith("$plot$")) {
                    image = image.replace("$plot$/", "");  //是模块内部本级图片
                }
                else if (image.startsWith("$serverURL_gltf$")) {
                    image = image.replace("$serverURL_gltf$", thisWidget.gltfServerURL);
                }
                else if (image.startsWith("$serverURL$")) {
                    image = image.replace("$serverURL$", thisWidget.serverURL);  //是模块内部本级图片
                }
                else {
                    image = "../../" + image;   //相对于父级index页面的图片
                }
                inhtml += ' <li onclick="plotlist.startPlot(' + i + ',this)"> <i title="'
                    + item.name + '"  > <img src="' + image + '"  onerror="plotlist.imgerrorfun();"/></i></li>';
            }
            // else if (item.style && item.style.html) {
            //     inhtml += ' <li onclick="plotlist.startPlot(' + i + ',this)"> <i title="' + item.name + '"  > ' + item.style.html + '</i></li>';
            // }
            else {
                //使用字体图标 
                var icon;
                var clr = "#000000";
                if (defStyle) {
                    icon = defStyle.iconClass;
                    clr = defStyle.color;
                }
                if (item.iconClass) {
                    icon = item.iconClass;
                }
                if (item.style && item.style.iconClass) {
                    icon = item.style.iconClass;
                }

                if (item.color) {
                    clr = item.color;
                }
                if (item.style && item.style.color) {
                    clr = item.style.color;
                }
                if (icon) {
                    inhtml += '<li onclick="plotlist.startPlot(' + i + ',this)"><i title="'
                        + item.name + '"  class="' + icon + '" style="color:' + clr + '"></i></li>';
                }
                else {
                    inhtml += '<li onclick="plotlist.startPlot(' + i + ',this)"><i title="'
                        + item.name + '" style="font-size: 13px;">' + item.name + '</i></li>';
                }
            }
        }
        $("#plotlist").html(inhtml);
    },
    imgerrorfun: function () {
        var img = event.srcElement;
        img.src = "../../../img/favicon/app-icon72x72@2x.png";
        img.onerror = null;
    },
    //激活标绘
    _lastLi: null,
    //开始绘制
    startPlot: function (idx, li) {
        var _thisli = $(li);
        _thisli.addClass('markon');
        if (this._lastLi)
            this._lastLi.removeClass('markon');
        this._lastLi = _thisli;

        var item = haoutil.system.clone(this._listData[idx] || {});
        delete item.image

        //赋值默认样式
        var defStyle = thisWidget.getDefStyle(item.edittype || item.type)
        if (defStyle) {
            item.style = item.style || {};
            for (var i in defStyle) {
                if (item.style[i] == null)
                    item.style[i] = defStyle[i];
            }
        }


        //赋值默认属性
        item.attr = {
            id: "",
            name: "",
            remark: "",
        };

        thisWidget.startDraw(item);
    },
    //绘制结束
    plotEnd: function () {
        //取消选中状态
        if (this._lastLi)
            this._lastLi.removeClass('markon');
    }
};


//标号树处理
var objFeature = {};
var treeObj

var treeWork = {
    initEvent: function () {
        $("#btn_plot_addgroup").click(function (e) {
            thisWidget.editGroupName();
        });
        $("#btn_plot_delAllGroup").click(function (e) {
            thisWidget.removeNullGroup();
        });

        bindRightMenuEvnet();  //右键
        thisWidget.showLayerTree();
    },
    loadData: function (arrGroup) {
        //初始化树 http://www.treejs.cn/v3/api.php
        var setting = {
            check: {
                enable: true
            },
            edit: {
                drag: {
                    isMove: true,
                },
                showRemoveBtn: false,
                showRenameBtn: false,
                enable: true
            },
            data: {
                simpleData: {
                    enable: true
                }
            },
            callback: {
                beforeDrag: treeOverlays_beforeDrag,
                beforeDrop: treeOverlays_beforeDrop,
                onDrop: treeOverlays_onDrop,
                onCheck: treeOverlays_onCheck,
                onRightClick: treeOverlays_OnRightClick,
                onClick: treeOverlays_onClick,
                onRemove: treeOverlays_onRemove
            },
        };


        //构造树节点
        var id = 0;
        objFeature = {};

        var zNodes = [];
        for (var i = 0; i < arrGroup.length; i++) {
            var layer = arrGroup[i]

            var name = layer.isActivate ? (layer.name + "(激活)") : layer.name
            var oldNode = treeObj && treeObj.getNodeByParam("name", name);

            //添加分组
            var groupNode = {
                id: id++,
                pId: layer.pid,
                name: name,
                icon: "img/tree/folder.png",
                isGroup: true,
                checked: layer.show,
                open: oldNode && oldNode.open,  //是否展开分组
            };


            zNodes.push(groupNode);

            objFeature[groupNode.id] = layer;

            var arrEntity = layer.entities.values;
            for (var j = 0, len = arrEntity.length; j < len; j++) {
                var entity = arrEntity[j];

                //添加标号
                var plotNode = {
                    id: id++,
                    pId: groupNode.id,
                    name: (entity.attribute.attr && entity.attribute.attr.name) || entity.attribute.name || "未命名",
                    checked: entity.show,
                    icon: "img/tree/plot.png",
                };
                zNodes.push(plotNode);

                objFeature[plotNode.id] = entity;
            }
        }


        $.fn.zTree.destroy()
        treeObj = $.fn.zTree.init($("#treeOverlays"), setting, zNodes);
    },

};



//===================================单击定位图层====================================
function treeOverlays_onClick(event, treeId, treeNode) {
    if (treeNode == null || treeNode.id == null) return;

    var layer = objFeature[treeNode.id];
    if (layer == null) return;

    thisWidget.centerAt(layer);
};


//===================================勾选显示隐藏图层====================================

function treeOverlays_onCheck(e, treeId, treeNode) {

    //获得所有改变check状态的节点
    var changedNodes = treeObj.getChangeCheckedNodes();
    for (var i = 0; i < changedNodes.length; i++) {
        var treeNode = changedNodes[i];
        treeNode.checkedOld = treeNode.checked;

        var layer = objFeature[treeNode.id];
        if (layer == null) continue;

        layer.show = treeNode.checked
    }
}


//===================================右键菜单====================================
var lastRightClickTreeId;
var lastRightClickTreeNode;

function treeOverlays_OnRightClick(event, treeId, treeNode) {
    if (treeNode == null || objFeature[treeNode.id] == null) return;

    //右击时的节点
    lastRightClickTreeId = treeId;
    lastRightClickTreeNode = treeNode;

    var top = event.clientY;
    var left = event.clientX;
    var maxtop = document.body.offsetHeight - 100;
    var maxleft = document.body.offsetWidth - 100;

    if (top > maxtop) top = maxtop;
    if (left > maxleft) left = maxleft;

    if (treeNode.isGroup) {
        $('#plot_rMenu_group .group').show();
        $('#plot_rMenu_group .plot').hide();
    }
    else {
        $('#plot_rMenu_group .group').hide();
        $('#plot_rMenu_group .plot').show();
    }

    $('#plot_rMenu_group').css({
        "top": top + "px",
        "left": left + "px"
    }).show();
    $("body").bind("mousedown", onBodyMouseDown);
}


function bindRightMenuEvnet() {
    $("#plot_rMenu_group li").on("click", function () {
        hideRMenu();

        var type = $(this).attr("data-type");
        moveNodeAndLayer(type);
    });
}


function onBodyMouseDown(event) {
    if (!(event.target.id == "plot_rMenu_group" || $(event.target).parents('#plot_rMenu_group').length > 0)) {
        hideRMenu();
    }
}

function hideRMenu() {
    $("body").unbind("mousedown", onBodyMouseDown);
    $('#plot_rMenu_group').hide();
}


//移动节点及图层位置
function moveNodeAndLayer(type) {
    var thisNode = lastRightClickTreeNode;
    var thisLayer = objFeature[thisNode.id];

    switch (type) {
        case "g_act": //置为激活分组
            thisWidget.activateGroup(thisLayer);
            break;
        case "g_name": //重命名分组 
            thisWidget.editGroupName(thisLayer);
            break;
        case "g_del": //删除分组
            // if (thisWidget.checkRemoveGroup(thisLayer)) {
            treeObj.removeNode(thisNode);
            thisWidget.removeGroup(thisLayer);
            // }
            break;
        case "p_del": //删除标号  
            treeObj.removeNode(thisNode);
            thisWidget.deleteEntity(thisLayer);
            break;
        case "g_json": //导出GeoJson   
            thisWidget.downloadJson("标绘分组_" + thisNode.name, thisLayer);
            break;
        case "p_json": //导出GeoJson  
            thisWidget.downloadJson(thisNode.name, thisLayer);
            break;
    }
}

//===================================删除处理====================================

function treeOverlays_onRemove(event, treeId, treeNode) {
    if (treeNode == null || treeNode.id == null) return;

    var layer = objFeature[treeNode.id];
    if (layer == null) return;

    if (treeNode.isGroup)
        thisWidget.removeGroup(layer);
    else
        thisWidget.deleteEntity(layer);
}

//===================================拖拽调整层次处理====================================

function treeOverlays_beforeDrag(treeId, treeNodes) {
    for (var i = 0, l = treeNodes.length; i < l; i++) {
        if (treeNodes[i].isGroup) {
            return false;//禁止拖拽
        }
    }
    return true;
}
function treeOverlays_beforeDrop(treeId, treeNodes, targetNode, moveType) {
    if (targetNode && targetNode.isGroup)
        return true
    else
        return false //禁止拖拽到我身上 
}

function treeOverlays_onDrop(event, treeId, treeNodes, targetNode, moveType, isCopy) {
    if (!targetNode) return

    // var group = targetNode.name //分组名称
    var layerGroup = objFeature[targetNode.id];//分组 
    var entity = objFeature[treeNodes[0].id]

    thisWidget.moveEntityGroup(entity, layerGroup);

}