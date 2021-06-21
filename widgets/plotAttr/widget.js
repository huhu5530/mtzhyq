(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {
        //弹窗配置
        get view() {
            return {
                type: "window",
                url: "view.html",
                "style": "dark",
                "windowOptions": {
                    "skin": "layer-mars-dialog animation-scale-up",
                    "width": 250,
                    "position": {
                        "top": 10,
                        "right": 5,
                        "bottom": 30
                    }
                }
            }
        }

        //初始化[仅执行1次]
        create() {
            var that = this;
            $.getJSON(this.path + "config/attr.json", function (data) {
                that.attrConfig = data;

                // that.getDefaultVal();//测试用
                // that.getReadmeTxt(); //测试用


                that.attrConfig["curve"] = that.attrConfig["polyline"]
                that.attrConfig["model-p"] = that.attrConfig["model"]
                that.startEditing();
            });

        }
        //获取所有可配置属性的默认值
        getDefaultVal() {
            var data = this.attrConfig;

            //标号默认样式
            var attrDefConfig = {};
            for (var i in data) {
                var defstyle = {};
                for (var idx = 0; idx < data[i].style.length; idx++) {
                    var item = data[i].style[idx];
                    if (item.defval === "") continue;
                    defstyle[item.name] = item.defval;
                }
                attrDefConfig[i] = defstyle;
            }
            console.log('===========标号默认样式=================');
            console.log(JSON.stringify(attrDefConfig));
        }
        //获取所有可配置属性的说明文档
        getReadmeTxt() {
            var data = this.attrConfig;

            //标号可配置的属性
            var strAPI = '';
            for (var i in data) {
                var strAPIItem = ''
                for (var idx = 0; idx < data[i].style.length; idx++) {
                    var item = data[i].style[idx];
                    if (haoutil.isutil.isString(item.defval))
                        item.defval = '"' + item.defval + '"'

                    var strData = "";
                    if (item.type == "combobox") {
                        strData = ",可选项：";
                        item.data.forEach(function (comb) {
                            strData += `${comb.value}(${comb.text}),`
                        });
                    }
                    strAPIItem += `        "${item.name}": ${item.defval},      //${item.label} ${strData}  \n`


                }
                strAPI += `{
    "type": "${i}", 
    "style": {
${strAPIItem}
    }
}
`;
            }
            haoutil.file.downloadFile("标绘属性配置.txt", strAPI);
        }
        //每个窗口创建完成后调用
        winCreateOK(opt, result) {
            this.viewWindow = result;


        }
        //激活插件
        activate() {

        }
        //释放插件
        disable() {

        }
        getDefStyle(type) {
            return mars3d.draw.attr.getDefStyle(type)
        }
        getMinPointNum() {
            var entity = this.config.entity;
            if (entity && entity.editing && entity.editing._minPointNum)
                return entity.editing._minPointNum
            return 3;
        }
        getMaxPointNum() {
            var entity = this.config.entity;
            if (entity && entity.editing && entity.editing._maxPointNum)
                return entity.editing._maxPointNum
            return 999;
        }
        get defaultAttrList() {
            return [
                { "name": "id", "label": "主键", "type": "label", "defval": "" },
                { "name": "name", "label": "名称", "type": "text", "defval": "" },
                { "name": "remark", "label": "备注", "type": "textarea", "defval": "" }
            ]
        }
        getAttrList() {
            return this.config.attrList || this.defaultAttrList;
        }

        startEditing(entity, lonlats) {
            if (entity) this.config.entity = entity
            if (lonlats) this.config.lonlats = lonlats

            if (this.viewWindow == null) return;

            var entity = this.config.entity;
            var lonlats = this.config.lonlats;//this.drawControl.getCoordinates(entity);
            this.viewWindow.plotEdit.startEditing(entity.attribute, lonlats);
        }
        //更新图上的属性
        updateAttr2map(attr) {
            if (this.config.updateAttr) this.config.updateAttr(attr);
        }
        //更新图上的几何形状、坐标等
        updateGeo2map(coords, withHeight) {
            var positions = [];
            if (withHeight) {
                for (var i = 0; i < coords.length; i += 3) {
                    var point = Cesium.Cartesian3.fromDegrees(coords[i], coords[i + 1], coords[i + 2]);
                    positions.push(point);
                }
            } else {
                for (var i = 0; i < coords.length; i += 2) {
                    var point = Cesium.Cartesian3.fromDegrees(coords[i], coords[i + 1], 0);
                    positions.push(point);
                }
            }

            if (this.config.updateGeo) this.config.updateGeo(positions);

            return positions;
        }
        centerCurrentEntity() {
            var entity = this.config.entity;
            if (this.config.centerAt) this.config.centerAt(entity);
        }
        deleteEntity() {
            var entity = this.config.entity;
            if (this.config.deleteEntity) this.config.deleteEntity(entity);
            this.disableBase();
        }

        //文件处理
        getGeoJson() {
            var entity = this.config.entity;
            return mars3d.draw.attr.toGeoJSON(entity);
        }  
    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d)
