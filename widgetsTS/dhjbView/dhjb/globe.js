//公共处理js

//数据处理，及自动播放
var dataWork = {
    alltimes: 0,
    arrNode: [],
    analysisData: function (arr) {
        for (var i = 0; i < arr.length; i++) {
            var item = arr[i];
            if (item.widget) {
                item.index = this.arrNode.length; //this.getNextId();
                item.id = item.index;
                item.times = item.times || 60;
                item.text = item.text + "(" + item.times + "秒)"
                this.arrNode.push(item);
                this.alltimes += item.times;
            }

            if (item.children) {
                this.analysisData(item.children);
            }
        }
    },
    steptimes: 0,
    initData: function (data) {
        this.analysisData(data);
        $("#alltimes").html(haoutil.str.formatTime(this.alltimes));
        var that = this;
        setInterval(function () {
            if (!that._isStart) return;
            that.steptimes++;
            $("#thistimes").html(that.steptimes + '秒');
        }, 1000);

        $('#treeOverlays').jstree({
            core: {
                data: data,
                "themes": {
                    "name": "default-dark",
                    "dots": true,
                    "icons": true
                },
            }
        });

        var that = this;
        $('#treeOverlays').on("changed.jstree", function (e, data) {
            var node = data.node.original;
            if (node && node.widget) {
                that.start(node);
            }
        });

    },
    _isStart: false,
    selectdNode: null,
    //开始
    start: function (node) {
        this.stop();

        $("#btn_start").hide();
        $("#btn_pause").show();
        $("#btn_proceed").hide();
        $("#btn_stop").show();

        this._isStart = true;
        dataWork.activateNode(node || this.arrNode[0]);
    },
    //暂停
    pause: function () {
        $("#btn_start").hide();
        $("#btn_pause").hide();
        $("#btn_proceed").show();
        $("#btn_stop").show();

        this._isStart = false;
        viewer.mars.cancelCenterAt();
        JB.windingPointStop();

        if (this.timeIdx && this.timeIdx != -1) {
            clearTimeout(this.timeIdx);
            this.timeIdx = -1;
        }
    },
    //继续
    proceed: function () {
        $("#btn_start").hide();
        $("#btn_pause").show();
        $("#btn_proceed").hide();
        $("#btn_stop").show();

        var node = this.selectdNode;
        if (node) {
            var that = this;
            this.timeIdx = setTimeout(function () {
                that.activateNextNode(node.index);
            }, (node.times - this.steptimes) * 1000);
        }
        else{
            this.start();
        }
        this._isStart = true;
    },

    //停止
    stop: function () {
        this.pause();

        $("#btn_start").show();
        $("#btn_pause").hide();
        $("#btn_stop").hide();
        $("#btn_proceed").hide();

        $("#thisStep").html("无");
        $("#thistimes").html("");
        $("#treeOverlays").jstree("deselect_all", true);
 
        if (this.selectdNode) {
            this.selectdNode.widget.disable();
        }
        this.arrNode[this.arrNode.length-1].widget.disable();

        dataWork.selectdNode = null;
        this._isStart = false;
    },
    activateNode: function (node) {
        this.selectdNode = node;

        $("#stopRoate").val("暂停");

        this.steptimes = 0;
        $("#thisStep").html(node.text);
        $("#treeOverlays").jstree("deselect_all", true);
        $('#treeOverlays').jstree('select_node', node.id, true);

        node.widget.activate(node);

        var that = this;
        this.timeIdx = setTimeout(function () { 
            node.widget.disable();
            that.activateNextNode(node.index);
        }, node.times * 1000);
    },
    activateNextNode: function (index) {
        index++;
        if (index < 0 || index >= this.arrNode.length) {
            this.stop();
            this.selectdNode = null;
            return;
        }
        var node = this.arrNode[index];
        this.activateNode(node);
    },

};

//循环执行数组或对象，参数支持
function loopArrayForFun(opts, callback) {
    if (opts == null) return;
    if (haoutil.isutil.isArray(opts)) {
        var arr = [];
        for (var i = 0, len = opts.length; i < len; i++) {
            arr.push(callback(opts[i]));
        }
        return arr;
    }
    else {
        return callback(opts);
    }
}

var timeColor = {
    color: Cesium.Color.YELLOW.withAlpha(0),
    start: function (clr, max) {
        clr = clr || Cesium.Color.YELLOW;
        this.colorBack = Cesium.Color.clone(clr)
        this.max = max;

        this.stop();

        var time = 30;
        var setp = max / time;

        var alpha = 0;
        this.interVal = setInterval(() => {
            alpha += setp;
            if (alpha > max) alpha = 0;
            this.color = clr.withAlpha(alpha);
        }, time);
    },
    stop: function () {
        clearInterval(this.interVal);
        this.color = this.colorBack.withAlpha(this.max);
    }
};

 

function setModelHead(entity, heading) {
    //角度控制
    var heading = Cesium.Math.toRadians(Number(heading || 0.0));
    var hpr = new Cesium.HeadingPitchRoll(heading, 0, 0);
    entity.orientation = Cesium.Transforms.headingPitchRollQuaternion(entity.position.getValue(), hpr);
}

function bindModelContextMenu(entity) {

    entity.contextmenuItems = entity.contextmenuItems || [];
    entity.contextmenuItems = entity.contextmenuItems.concat([
        {
            text: '开启自旋转',
            iconCls: 'fa fa-eye-slash',
            visible: function () {
                return !mars3d.model.rotate.isStart
            },
            callback: function (e) {
                mars3d.model.rotate.start(entity, { viewer: viewer, step: 30, })
            }
        },
        {
            text: '关闭自旋转',
            iconCls: 'fa fa-eye',
            visible: function () {
                return mars3d.model.rotate.isStart
            },
            callback: function (e) {
                mars3d.model.rotate.stop();
            }
        },
        {
            text: '属性编辑',
            iconCls: 'fa fa-edit',
            callback: function (e) {
                mars3d.widget.activate({
                    uri: 'widgetsJB/model/widget.js',
                    entity: entity
                });
            }
        },
    ]);


}