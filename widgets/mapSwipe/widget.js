(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {
        //外部资源配置
        get resources() {
            return [
                'view.css'
            ]
        }

        //弹窗配置
        get view() {
            return {
                type: "append",
                url: 'view.html',
                parent: 'body'
            }
        }

        //每个窗口创建完成后调用
        winCreateOK(html) {
            var that = this;

            var arrLayers = this.getBaseMaps();

            var inhtmlBaseLayer = "";
            var inhtmlSwipelayer = "";
            for (var i = 0; i < arrLayers.length; i++) {
                var item = arrLayers[i];
                if (item.config.type == "group" && item.config.layers == null) continue;

                inhtmlBaseLayer += ' <li><a href="javascript:mapSwipeWidget.changeSelectBaseLayer(' + i + ',true)">' + item.name + '</a></li>';
                inhtmlSwipelayer += ' <li><a href="javascript:mapSwipeWidget.changeSelectSwipeLayer(' + i + ',true)">' + item.name + '</a></li>';
            }
            $("#ddl_basemap").html(inhtmlBaseLayer);
            $("#ddl_swipelayer").html(inhtmlSwipelayer);

            $("#btn_mapSwipe_close").click(function () { 
                that.disableBase();
            });
        }
        //激活插件
        activate() {
            $(".toolBarRight").css({ top: '60px' });

            var scene = this.viewer.scene;

            var slider = $("<div id='slider' class='cesium-map-contrast-slider'></div>");
            $("#cesiumContainer").append(slider);
            scene.imagerySplitPosition = (slider[0].offsetLeft) / slider[0].parentElement.offsetWidth;

            var dragStartX = 0;
            document.getElementById('slider').addEventListener('mousedown', mouseDown, false);
            window.addEventListener('mouseup', mouseUp, false);


            var arrLayers = this.getBaseMaps();
            var defbaseIdx = -1;
            var defoverIdx = -1;
            for (var i = 0; i < arrLayers.length; i++) {

                var item = arrLayers[i];
                if (item.type == "group" && item.layers == null) continue;

                if (defbaseIdx == -1)
                    defbaseIdx = i;
                else if (defbaseIdx != -1 && defoverIdx == -1) {
                    defoverIdx = i;
                    break;
                }
            }
            this.changeSelectBaseLayer(defbaseIdx, true);
            this.changeSelectSwipeLayer(defoverIdx, true);


            function mouseUp() {
                window.removeEventListener('mousemove', sliderMove, true);
            }

            function mouseDown(e) {
                var slider = document.getElementById('slider');
                dragStartX = e.clientX - slider.offsetLeft;
                window.addEventListener('mousemove', sliderMove, true);
            }

            function sliderMove(e) {
                var slider = document.getElementById('slider');
                var splitPosition = (e.clientX - dragStartX) / slider.parentElement.offsetWidth;
                slider.style.left = 100.0 * splitPosition + "%";

                scene.imagerySplitPosition = splitPosition;
            }

        }
        //释放插件
        disable() {
            $(".toolBarRight").css({ top: '10px' });
            $("#slider").remove();

            if (this.leftLayer != null) {
                this.leftLayer.visible = false;
            }
            if (this.rightLayer != null) {
                this.rightLayer.visible = false;
            }
            this.leftLayer = null;
            this.rightLayer = null;

            var arrLayers = this.getBaseMaps();
            for (var i = 0; i < arrLayers.length; i++) {

                var item = arrLayers[i];
                if (item.config.type == "group" && item.config.layers == null) continue;

                item.visible = true;
                break;
            }
        }
        getBaseMaps() {
            var arr = [];
            var basemapsCfg = this.viewer.mars.arrBasemaps;
            for (var i = 0; i < basemapsCfg.length; i++) {
                arr.push(basemapsCfg[i]);
            }

            var operationallayersCfg = this.viewer.mars.arrOperationallayers;
            for (var i = 0; i < operationallayersCfg.length; i++) {
                var item = operationallayersCfg[i];

                if (item.isTile) {//instanceof mars3d.layer.TileLayer 
                    arr.push(item);
                }
            }
            return arr;
        }
        updateLeftLayer(item) {
            if (this.leftLayer != null) {
                this.leftLayer.visible = false;
            }
            this.leftLayer = item;

            item.visible = true;

            if (item.config.type == "group") {
                for (var i = 0; i < item._layers.length; i++) {
                    var layer = item._layers[i].layer;
                    layer.splitDirection = Cesium.ImagerySplitDirection.LEFT;
                }
            }
            else {

                item.layer.splitDirection = Cesium.ImagerySplitDirection.LEFT;
            }
        }
        updateRightLayer(item) {
            if (this.rightLayer != null) {
                this.rightLayer.visible = false;
            }
            this.rightLayer = item;

            item.visible = true;

            if (item.config.type == "group") {
                for (var i = 0; i < item._layers.length; i++) {
                    var layer = item._layers[i].layer;
                    layer.splitDirection = Cesium.ImagerySplitDirection.RIGHT;
                }
            }
            else {
                item.layer.splitDirection = Cesium.ImagerySplitDirection.RIGHT;
            }
        }
        //view界面控制
        changeSelectBaseLayer(id, ischange) {
            if (this._last_swipeLayer_id == id) {
                toastr.warning('图层对比不能为同一图层！');
                return;
            }
            this._last_baselayer_id = id;

            var arrLayers = this.getBaseMaps();
            var thisLayer = arrLayers[id];

            $("#btnSelectBaseMap").html('已选:' + thisLayer.name + '<span class="caret"></span>');
            if (ischange)
                this.updateLeftLayer(thisLayer);
        }
        changeSelectSwipeLayer(id, ischange) {
            if (this._last_baselayer_id == id) {
                toastr.warning('图层对比不能为同一图层！');
                return;
            }
            this._last_swipeLayer_id = id;

            var arrLayers = this.getBaseMaps();
            var thisLayer = arrLayers[id];

            $("#btnSelectSwipelayer").html('已选:' + thisLayer.name + '<span class="caret"></span>');

            if (ischange)
                this.updateRightLayer(thisLayer);
        }


    }


    //注册到widget管理器中。
    window.mapSwipeWidget = mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 