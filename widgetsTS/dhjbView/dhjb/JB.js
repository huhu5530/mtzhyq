//脚本列表
var JB = {
    //视角定位，参数支持数组或单个
    centerAt(params, opts) {
        if (haoutil.isutil.isArray(params))
            viewer.mars.centerAtArr(params, opts);
        else
            viewer.mars.centerAt(params, opts);
    },
    //====================Plot对外接口==========================
    drawModelControl: null,
    getDrawModelControl() {
        if (this.drawModelControl == null) {
            this.drawModelControl = new mars3d.Draw({
                viewer: viewer,
                hasEdit: false
            });
        }
        return this.drawModelControl;
    },
    addModel(geojson) { //添加draw
        var arrEntity = this.getDrawModelControl().loadJson(geojson);

        for (var i = 0, len = arrEntity.length; i < len; i++) {
            var entity = arrEntity[i];
            bindModelContextMenu(entity);
        }

        return arrEntity;
    },
    removeModel(opts) {
        var that = this;
        return loopArrayForFun(opts, function (entity) {
            that.drawModelControl.deleteEntity(entity);
        });
    },
    visibleModel(opts, show) {
        return loopArrayForFun(opts, function (entity) {
            entity.show = show;
        });
    },
    //====================Draw对外接口==========================
    drawControl: null,
    getDrawControl() {
        if (this.drawControl == null) {
            this.drawControl = new mars3d.Draw({
                viewer: viewer,
                hasEdit: false
            });
        }
        return this.drawControl;
    },
    addDraw(geojson) { //添加draw
        return this.getDrawControl().loadJson(geojson);
    },
    removeDraw(opts) {
        var that = this;
        return loopArrayForFun(opts, function (entity) {
            that.drawControl.deleteEntity(entity);
        });
    },
    visibleDraw(opts, show) {
        return loopArrayForFun(opts, function (entity) {
            entity.show = show;
        });
    },
    highlightDraw(entitys, color, max) {
        timeColor.start(color, max || 0.3);

        return loopArrayForFun(entitys, function (entity) {
            if (entity.polyline)
                entity.polyline.material = new Cesium.ColorMaterialProperty(new Cesium.CallbackProperty(function (time) {
                    return timeColor.color;
                }, false));
            if (entity.ellipse)
                entity.ellipse.material = new Cesium.ColorMaterialProperty(new Cesium.CallbackProperty(function (time) {
                    return timeColor.color;
                }, false));
            if (entity.polygon)
                entity.polygon.material = new Cesium.ColorMaterialProperty(new Cesium.CallbackProperty(function (time) {
                    return timeColor.color;
                }, false));
        });
    },
    unHighlightDraw() {
        timeColor.stop();
    },
    updateDrawMaterial(entitys, key, material) {
        return loopArrayForFun(entitys, function (entity) {
            if (entity[key])
                entity[key].material = material;
        });
    },
    //====================自定义div文字注记==========================
    //添加注记，参数支持数组或单个
    addLabel(opts) {
        return loopArrayForFun(opts, this._addLabelItem);
    },
    _addLabelItem(opts) {
        var coor = opts.point;
        var position = Cesium.Cartesian3.fromDegrees(coor[0], coor[1], coor[2] || 0);

        var html = opts.html;
        if (!html) {
            var name = opts.name || "";
            html = `<div class="divpoint1"> 
                        <div class="title">${name}</div>
                    </div >`;
        }
        //文字注记 
        var label = new mars3d.DivPoint(viewer, {
            html: html,
            position: position,
            heightReference: opts.heightReference,
            anchor: opts.anchor || [0, 0],
        });

        return label;
    },
    visibleLabel(opts, show) {
        return loopArrayForFun(opts, function (label) {
            return label.setVisible(show);
        });
    },
    //移除注记，参数支持数组或单个
    removeLabel(opts) {
        return loopArrayForFun(opts, function (label) {
            return label.destroy();
        });
    },
    //====================entity点point===========================
    //添加点，参数支持数组或单个
    addPoint(opts) {
        return loopArrayForFun(opts, this._addPointItem);
    },
    _addPointItem(opts) {
        opts.name = opts.name || "点";

        var coor = opts.point;
        var position = Cesium.Cartesian3.fromDegrees(coor[0], coor[1], coor[2] || 0);
        var entity = viewer.entities.add({
            name: opts.name,
            position: position,
            point: {
                color: Cesium.Color.fromCssColorString("#ffffff"),
                pixelSize: 10,
                outlineColor: Cesium.Color.fromCssColorString(opts.color || "#ff0000"),
                outlineWidth: 2,
                scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 8.0e6, 0.2),
                disableDepthTestDistance: Number.POSITIVE_INFINITY, //一直显示，不被地形等遮挡
            },
            tooltip: opts.name
        });
        return entity;
    },
    visiblePoint(opts, show) {
        return loopArrayForFun(opts, function (entity) {
            entity.show = show;
        });
    },
    //移除点，参数支持数组或单个
    removePoint(opts) {
        return loopArrayForFun(opts, function (entity) {
            viewer.entities.remove(entity);
        });
    },
    //====================entity图标点=========================
    //添加闪烁点 
    addImagePoint(opts) {
        return loopArrayForFun(opts, this._addImagePointItem);
    },
    _addImagePointItem(opts) {
        opts.name = opts.name || "点";
        var coor = opts.point;
        var position = Cesium.Cartesian3.fromDegrees(coor[0], coor[1], coor[2] || 0);
        var entity = viewer.entities.add({
            name: opts.name,
            position: position,
            point: {
                color: Cesium.Color.fromCssColorString("#ffffff"),
                pixelSize: 10,
                outlineColor: Cesium.Color.fromCssColorString("#ff0000"),
                outlineWidth: 2,
                scaleByDistance: new Cesium.NearFarScalar(1.5e2, 1.0, 8.0e6, 0.2),
                disableDepthTestDistance: Number.POSITIVE_INFINITY, //一直显示，不被地形等遮挡
            },
            billboard: {
                image: opts.image,
                scale: opts.scale || 1,
                pixelOffset: new Cesium.Cartesian2((opts.pixelOffsetX || 0), 0),
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
            }
        });
        return entity;
    },
    visibleImagePoint(opts, show) {
        return loopArrayForFun(opts, function (entity) {
            entity.show = show;
        });
    },
    //移除闪烁点
    removeImagePoint(opts) {
        return loopArrayForFun(opts, function (entity) {
            viewer.entities.remove(entity);
        });
    },
    //====================自定义圆ball对象=========================
    //添加
    addBall(opts) {
        return loopArrayForFun(opts, this._addBallItem);
    },
    _addBallItem(opts) {
        var primitive = MarsBallPrimitive.draw(opts);
        viewer.scene.primitives.add(primitive);
        return primitive;
    },
    //移除
    removeBall(opts) {
        return loopArrayForFun(opts, function (primitive) {
            viewer.scene.primitives.remove(primitive);
        });
    },

    //====================自定义面板=========================
    showPanel(html) {
        $("#viewResult").remove();
        var innerHTML = `<div id="viewResult" class="infoview" style="overflow:auto;left: 10px;top:auto; bottom: 40px;"> 
            ${html}
        </div>`
        $("body").append(innerHTML);
    },
    closePanel() {
        $("#viewResult").remove();
    },
    //绕点飞行
    windingPointStart(center) {
        mars3d.point.windingPoint.start(viewer, center);
    },
    windingPointStop() {
        mars3d.point.windingPoint.stop();
    }



};


