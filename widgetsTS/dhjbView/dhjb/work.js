function initEditorJS() {

    //山顶点 
    var sddPoint = {
        activate: function () {
            //添加数据
            this.clearData();
            abdPoint.clearData();
            qxbhdPoint.clearData();
            fxbhdPoint.clearData();

            JB.centerAt({ "y": 36.061436, "x": 113.927874, "z": 1688.82, "heading": 61.4, "pitch": -34.8, "roll": 0 });

            var arrPoint = [{
                "name": '<span style="color:red;">山顶点</span>',
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, //贴地
                point: [113.942777, 36.067056, 459.77]
            }, {
                "name": '<span style="color:red;">山顶点</span>',
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, //贴地
                point: [113.944267, 36.071025, 536.88]
            }, {
                "name": '<span style="color:red;">山顶点</span>',
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, //贴地
                point: [113.939813, 36.072023, 508.97]
            }];
            this.lable = JB.addLabel(arrPoint); //添加注记 


            this.drawEntity = JB.addDraw({
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "properties": {
                        "edittype": "point",
                        "name": "点标记",
                        "style": {
                            "color": "#ffffff",
                            "outlineColor": "#ff0000",
                            "visibleDepth": true,
                            "heightReference": "CLAMP_TO_GROUND"
                        },
                        "attr": {},
                        "type": "point"
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": arrPoint[0].point
                    }
                }, {
                    "type": "Feature",
                    "properties": {
                        "edittype": "point",
                        "name": "点标记",
                        "style": {
                            "color": "#ffffff",
                            "outlineColor": "#ff0000",
                            "visibleDepth": true,
                            "heightReference": "CLAMP_TO_GROUND"
                        },
                        "attr": {},
                        "type": "point"
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": arrPoint[1].point
                    }
                }, {
                    "type": "Feature",
                    "properties": {
                        "edittype": "point",
                        "name": "点标记",
                        "style": {
                            "color": "#ffffff",
                            "outlineColor": "#ff0000",
                            "visibleDepth": true,
                            "heightReference": "CLAMP_TO_GROUND"
                        },
                        "attr": {},
                        "type": "point"
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": arrPoint[2].point
                    }
                }]
            });

        },
        disable: function () {
            JB.visibleLabel(this.lable, false);
        },
        clearData: function () {
            //移除点
            if (this.drawEntity) {
                JB.removeDraw(this.drawEntity);
                delete this.drawEntity;
            }
            //移除注记 
            if (this.lable) {
                JB.removeLabel(this.lable);
                delete this.lable;
            }
        }
    }

    //鞍部点 
    var abdPoint = {
        activate: function () {
            //视角定位 
            JB.centerAt({ "y": 36.06439, "x": 113.93641, "z": 1156, "heading": 50.9, "pitch": -40.9, "roll": 0 });
            //添加数据
            this.clearData();

            var arrPoint = [{
                "name": '<span style="color:yellow;">鞍部点</span>',
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, //贴地
                point: [113.941765, 36.071467, 483.65]
            }, {
                "name": '<span style="color:yellow;">鞍部点</span>',
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, //贴地
                point: [113.943826, 36.068614, 448.83]
            }];
            this.drawEntity = JB.addDraw({
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "properties": {
                        "edittype": "point",
                        "name": "点标记",
                        "style": {
                            "color": "#ffffff",
                            "outlineColor": "#ff0000",
                            "visibleDepth": true,
                            "heightReference": "CLAMP_TO_GROUND"
                        },
                        "attr": {},
                        "type": "point"
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [113.941765, 36.071467, 483.65]
                    }
                }, {
                    "type": "Feature",
                    "properties": {
                        "edittype": "point",
                        "name": "点标记",
                        "style": {
                            "color": "#ffffff",
                            "outlineColor": "#ff0000",
                            "visibleDepth": true,
                            "heightReference": "CLAMP_TO_GROUND"
                        },
                        "attr": {},
                        "type": "point"
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [113.943826, 36.068614, 448.83]
                    }
                }]
            });
            this.lable = JB.addLabel(arrPoint); //添加注记 

        },
        disable: function () {
            JB.visibleLabel(this.lable, false);
        },
        clearData: function () {
            //移除点
            if (this.drawEntity) {
                JB.removeDraw(this.drawEntity);
                delete this.drawEntity;
            }
            //移除注记 
            if (this.lable) {
                JB.removeLabel(this.lable);
                delete this.lable;
            }
        }
    }


    //倾斜变换点 
    var qxbhdPoint = {
        activate: function () {
            //视角定位 
            var arrPoint = [{
                "name": '<span style="">倾斜变换点</span>',
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, //贴地
                point: [113.940833, 36.070734, 440.98]
            }];
            JB.centerAt({ "y": 36.064462, "x": 113.937545, "z": 930.91, "heading": 36.6, "pitch": -32.1, "roll": 0 });
            this.drawEntity = JB.addDraw({
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "properties": {
                        "edittype": "point",
                        "name": "点标记",
                        "style": {
                            "color": "#ffffff",
                            "outlineColor": "#ff0000",
                            "visibleDepth": true,
                            "heightReference": "CLAMP_TO_GROUND"
                        },
                        "attr": {},
                        "type": "point"
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [113.940833, 36.070734, 440.98]
                    }
                }]
            });
            this.lable = JB.addLabel(arrPoint); //添加注记 

        },
        disable: function () {
            JB.visibleLabel(this.lable, false);
        },
        clearData: function () {
            //移除点
            if (this.drawEntity) {
                JB.removeDraw(this.drawEntity);
                delete this.drawEntity;
            }
            //移除注记 
            if (this.lable) {
                JB.removeLabel(this.lable);
                delete this.lable;
            }
        }
    }


    //方向变换点 
    var fxbhdPoint = {
        activate: function () {
            //视角定位 
            JB.centerAt({
                "y": 36.065437,
                "x": 113.935516,
                "z": 720,
                "heading": 51.2,
                "pitch": -22.5,
                "roll": 0
            });
            //添加数据
            this.clearData();
            var arrPoint = [{
                "name": '<span style="color:blue;">方向变换点</span>',
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, //贴地
                point: [113.942894, 36.069431, 443.97]
            }];
            this.drawEntity = JB.addDraw({
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "properties": {
                        "edittype": "point",
                        "name": "点标记",
                        "style": {
                            "color": "#ffffff",
                            "outlineColor": "#ff0000",
                            "visibleDepth": true,
                            "heightReference": "CLAMP_TO_GROUND"
                        },
                        "attr": {},
                        "type": "point"
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [113.942894, 36.069431, 443.97]
                    }
                }]
            });
            this.lable = JB.addLabel(arrPoint); //添加注记 
        },
        disable: function () {
            JB.visibleLabel(this.lable, false);
        },
        clearData: function () {
            //移除点
            //移除点
            if (this.drawEntity) {
                JB.removeDraw(this.drawEntity);
                delete this.drawEntity;
            }
            //移除注记 
            if (this.lable) {
                JB.removeLabel(this.lable);
                delete this.lable;
            }
        }
    }



    var showLine1 = {
        activate: function () {
            //显示所有标记
            JB.visibleLabel(sddPoint.lable, true);
            JB.visibleLabel(abdPoint.lable, true);
            JB.visibleLabel(qxbhdPoint.lable, true);
            JB.visibleLabel(fxbhdPoint.lable, true);
            JB.centerAt({
                "y": 36.064015,
                "x": 113.933652,
                "z": 761.92,
                "heading": 48.8,
                "pitch": -20.3,
                "roll": 360
            });

            //添加线
            var geojson = {
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "properties": {
                        "edittype": "polyline",
                        "name": "线",
                        "config": {
                            "minPointNum": 2
                        },
                        "style": {
                            "animationDuration": 2000,
                            "animationImage": "img/textures/lineClr.png",
                            "color": "#ffff00",
                            "clampToGround": true
                        },
                        "attr": {},
                        "type": "polyline"
                    },
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [
                            [113.934892, 36.070102, 445.18],
                            [113.936306, 36.070792, 470.73],
                            [113.937346, 36.070851, 494.64],
                            [113.939539, 36.071892, 512.87],
                            [113.939814, 36.072021, 509],
                            [113.940431, 36.071829, 494.97],
                            [113.941805, 36.071461, 483.14],
                            [113.944147, 36.071056, 535.93],
                            [113.944267, 36.071024, 536.88],
                            [113.944309, 36.070897, 536.62],
                            [113.944042, 36.070297, 502.58],
                            [113.944066, 36.069944, 484.51],
                            [113.944105, 36.069561, 474.96],
                            [113.943924, 36.068869, 452.38],
                            [113.943827, 36.068606, 448.74],
                            [113.943555, 36.068141, 449.3],
                            [113.942774, 36.067053, 459.68],
                            [113.941194, 36.066608, 419.79]
                        ]
                    }
                }]
            };
            this.line = JB.addDraw(geojson);
        },
        disable: function () {
            // 移除线
            // if (this.line) {
            //     JB.visibleLabel(this.line, false);
            // }
            //隐藏所有标记
            JB.visibleLabel(sddPoint.lable, false);
            JB.visibleLabel(abdPoint.lable, false);
            JB.visibleLabel(qxbhdPoint.lable, false);
            JB.visibleLabel(fxbhdPoint.lable, false);
        },
    }

    //虚线
    var showLine2 = {
        activate: function () {
            JB.centerAt({
                "y": 36.064528,
                "x": 113.937353,
                "z": 952.08,
                "heading": 37.9,
                "pitch": -33.1,
                "roll": 360
            });
            //显示所有标记
            JB.visibleLabel(sddPoint.lable, true);
            JB.visibleLabel(abdPoint.lable, true);
            JB.visibleLabel(qxbhdPoint.lable, true);
            JB.visibleLabel(fxbhdPoint.lable, true);
            //添加线
            var geojson = {
                "type": "Feature",
                "properties": {
                    "edittype": "polyline",
                    "name": "线",
                    "config": {
                        "minPointNum": 2
                    },
                    "style": {
                        "lineType": "dash",
                        "animationDuration": 2000,
                        "animationImage": "img/textures/lineClr.png",
                        "color": "#ffff00",
                        "clampToGround": true
                    },
                    "attr": {},
                    "type": "polyline"
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [113.941765, 36.071467, 483.65],
                        [113.940833, 36.070734, 440.98],
                        [113.940737, 36.070091, 411.82]
                    ]
                }
            };
            this.line = JB.addDraw(geojson);
        },
        disable: function () {
            // 移除线
            // if (this.line) {
            //     JB.visibleLabel(this.line, false);
            // }
            //隐藏所有标记
            JB.visibleLabel(sddPoint.lable, false);
            JB.visibleLabel(abdPoint.lable, false);
            JB.visibleLabel(qxbhdPoint.lable, false);
            JB.visibleLabel(fxbhdPoint.lable, false);
        },
    }

    //线
    var showLine3 = {
        activate: function () {
            //显示所有标记
            JB.centerAt({
                "y": 36.066678,
                "x": 113.936334,
                "z": 781.3,
                "heading": 63.1,
                "pitch": -28.3,
                "roll": 0
            });
            JB.visibleLabel(sddPoint.lable, true);
            JB.visibleLabel(abdPoint.lable, true);
            JB.visibleLabel(qxbhdPoint.lable, true);
            JB.visibleLabel(fxbhdPoint.lable, true);
            //添加线
            var geojson = {
                "type": "Feature",
                "properties": {
                    "edittype": "polyline",
                    "name": "线",
                    "config": {
                        "minPointNum": 2
                    },
                    "style": {
                        "animationDuration": 2000,
                        "animationImage": "img/textures/lineClr.png",
                        "color": "#ffff00",
                        "clampToGround": true
                    },
                    "attr": {},
                    "type": "polyline"
                },
                "geometry": {
                    "type": "LineString",
                    "coordinates": [
                        [113.944267, 36.071025, 536.88],
                        [113.942894, 36.069431, 443.97],
                        [113.942142, 36.069149, 413.18],
                        [113.941354, 36.06898, 394.38]

                    ]
                }
            };
            this.line = JB.addDraw(geojson);
        },
        disable: function () {
            // 移除线
            // if (this.line) {
            //     JB.visibleLabel(this.line, false);
            // }
            //隐藏所有标记
            JB.visibleLabel(sddPoint.lable, false);
            JB.visibleLabel(abdPoint.lable, false);
            JB.visibleLabel(qxbhdPoint.lable, false);
            JB.visibleLabel(fxbhdPoint.lable, false);
        },
    }


    var dgxWork = {
        activate: function () {


            var material = Cesium.Material.fromType('ElevationContour');
            var contourUniforms = material.uniforms;
            contourUniforms.width = 2.0;
            contourUniforms.spacing = 20.0;
            contourUniforms.color = Cesium.Color.RED.clone();

            viewer.scene.globe.material = material;
            JB.centerAt({ "y": 36.064736, "x": 113.935567, "z": 1276.68, "heading": 52.4, "pitch": -44.5, "roll": 0, "duration": 3 }, {
                // duration: 3,
                complete: function () {
                    JB.windingPointStart(new Cesium.Cartesian3.fromDegrees(113.942685, 36.07012, 461.53));
                }
            });


        },
        disable: function () {
            JB.windingPointStop();

            viewer.scene.globe.material = undefined;

            //清除数据
            sddPoint.clearData();
            abdPoint.clearData();
            qxbhdPoint.clearData();
            fxbhdPoint.clearData();

            JB.removeDraw(showLine1.line);
            JB.removeDraw(showLine2.line);
            JB.removeDraw(showLine3.line);
        }

    }

    var data = [{
        'text': '特征点',
        'state': {
            'opened': true,
            'selected': false
        },
        'children': [{
            'text': '山顶点',
            'times': 6,
            "widget": sddPoint
        },
        {
            'text': '鞍部点',
            'times': 6,
            "widget": abdPoint
        },
        {
            'text': '倾斜变换点',
            'times': 4,
            "widget": qxbhdPoint
        },
        {
            'text': '方向变换点',
            'times': 4,
            "widget": fxbhdPoint
        }
        ]
    },
    {
        'text': '特征线',
        'state': {
            'opened': true,
            'selected': false
        },
        'children': [{
            'text': '山脊线',
            'times': 6,
            "widget": showLine1
        },
        {
            'text': '山谷线',
            'times': 5,
            "widget": showLine2
        }, {
            'text': '变换线',
            'times': 5,
            "widget": showLine3
        }
        ]
    },
    {
        'text': '测量结果',
        'state': {
            'opened': true,
            'selected': false
        },
        'children': [
            {
                'text': '等高线',
                'times': 10,
                "widget": dgxWork
            }
        ]
    }
    ];
    dataWork.initData(data);
}