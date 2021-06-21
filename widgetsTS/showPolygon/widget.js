(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {

        //初始化[仅执行1次]
        create() {
            this.barColors = ['#00fdcf', '#63AEFF', '#FFB861', '#FF6D5D']
            this.cityPosition = [
                { name: '亳州', jwd: [116.203602, 33.496075] },
                { name: '商丘', jwd: [115.871509, 34.297084] },
                { name: '淮北', jwd: [116.688413, 33.689214] },
                { name: '宿州', jwd: [117.234682, 33.740035] },
                { name: '徐州', jwd: [117.70509, 34.350708] },
                { name: '宿迁', jwd: [118.559349, 33.807355] },
                { name: '连云港', jwd: [118.875445, 34.619808] },
                { name: '临沂', jwd: [118.026908, 35.262767] },
                { name: '枣庄', jwd: [117.320268, 35.072555] },
                { name: '济宁', jwd: [116.856599, 35.500232] },
                { name: '菏泽', jwd: [115.716086, 35.05629] }
            ]



            this.layerWork = mars3d.layer.createLayer(this.viewer, {
                "type": "geojson",
                "name": "淮海经济区11市",
                "url": 'http://data.marsgis.cn/file/geojson/huaihai.json',
                "symbol": {
                    "styleOptions": {
                        "opacity": 0.5,
                        "outline": false
                    },
                    "styleField": "Name",
                    "styleFieldOptions": {
                        "济宁市": { "color": "#D4AACE" },
                        "临沂市": { "color": "#8DC763" },
                        "菏泽市": { "color": "#F7F39A" },
                        "枣庄市": { "color": "#F7F39A" },
                        "徐州市": { "color": "#96F0F1" },
                        "宿迁市": { "color": "#EAC9A8" },
                        "连云港市": { "color": "#F7F39A" },
                        "商丘市": { "color": "#D4AACE" },
                        "宿州市": { "color": "#8DC763" },
                        "亳州市": { "color": "#96F0F1" },
                        "淮北市": { "color": "#EAC9A8" }
                    }
                },
                "center": { "y": 28.578006, "x": 117.878968, "z": 808743.45, "heading": 0, "pitch": -50, "roll": 360 },
                "visible": true
            });


            this.dataSource = new Cesium.CustomDataSource();
            this.viewer.dataSources.add(this.dataSource);

            //加载数据
            $.ajax({
                type: 'GET',
                url: 'http://data.marsgis.cn/file/apidemo/huaihai-jj.json',
                success: (res) => {
                    this.showCityEconomyData(res.data)
                },
                error: (err) => {
                    haoutil.msg('实时查询气象信息失败，请稍候再试')
                },
            })


        }
        //打开激活
        activate() {
            this.layerWork.visible = true;
            this.dataSource.show = true
            this.layerWork.centerAt();

        }
        //关闭释放
        disable() {
            this.layerWork.visible = false;
            this.dataSource.show = false


        }
        /**
         * 根据名称获取坐标
        */
        getJWDByName(name) {
            for (let i = 0; i < this.cityPosition.length; i += 1) {
                const item = this.cityPosition[i];
                if (item.name === name) {
                    return item.jwd;
                }
            }
            return [];
        }
        showCityEconomyData(data) {
            const yearArr = Object.keys(data);
            this.showYearZT(data[yearArr[0]]);
        }


        /**
         * 展示某年的椎体
        */
        showYearZT(arr) {
            this.dataSource.entities.removeAll()

            for (let i = 0; i < arr.length; i += 1) {
                const attr = arr[i];
                const jwd = this.getJWDByName(attr['name']);

                const num1 = attr['第一产业'];
                const num2 = attr['第二产业'];
                const num3 = attr['第三产业'];
                const numall = Number((num1 + num2 + num3)).toFixed(2);
                const html = `${attr['name']}<br/>第一产业：${num1}<br/>第二产业：${num2}<br/>第三产业：${num3}`;

                var height1 = Math.floor(num1 * 10)
                var height2 = Math.floor(num2 * 10)
                var height3 = Math.floor(num3 * 10)

                var p1 = Cesium.Cartesian3.fromDegrees(jwd[0], jwd[1], height3 / 2);
                var p2 = Cesium.Cartesian3.fromDegrees(jwd[0], jwd[1], height3 + height2 / 2);
                var p3 = Cesium.Cartesian3.fromDegrees(jwd[0], jwd[1], height3 + height2 + height1 / 2);


                // 添加柱体
                this.createZT(p1, height3, Cesium.Color.fromCssColorString('#63AEFF'), html);
                this.createZT(p2, height2, Cesium.Color.fromCssColorString('#FFB861'), html);
                this.createZT(p3, height1, Cesium.Color.fromCssColorString('#FF6D5D'), html);

                // 添加文字
                this.dataSource.entities.add({
                    position: Cesium.Cartesian3.fromDegrees(jwd[0], jwd[1], height1 + height2 + height3),
                    label: {
                        text: numall,
                        font: 'normal small-caps normal 18px 楷体',
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        fillColor: Cesium.Color.fromCssColorString('#00ff00'),
                        outlineColor: Cesium.Color.BLACK,
                        outlineWidth: 1,
                        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        pixelOffset: new Cesium.Cartesian2(0, -20)
                    }
                });

            }
        }


        /**  创建柱体 */
        createZT(position, len, color, html) {
            const greenCylinder = this.dataSource.entities.add({
                position: new Cesium.CallbackProperty(() => {
                    return greenCylinder.position_show
                }, false),
                cylinder: {
                    length: new Cesium.CallbackProperty(() => {
                        return greenCylinder.length_show
                    }, false),
                    topRadius: 6000.0,
                    bottomRadius: 6000.0,
                    material: color
                },
                tooltip: html
            });
            greenCylinder.position_show = position;
            greenCylinder.length_show = len;
            return greenCylinder;
        }


    }



    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 