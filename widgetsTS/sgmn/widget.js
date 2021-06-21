(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {

        //外部资源配置
        get resources() {
            return [
                "./lib/cesiumjs/plugins/class/GaodePOI.js",
                "./lib/cesiumjs/plugins/class/GaodeRoute.js",
                'work/workSGMN.js',
                'work/workJYMN.js',
                'work/workCLMN.js',
            ]
        }

        //弹窗配置
        get view() {
            return {
                type: "window",
                url: "view.html",
                windowOptions: {
                    width: 358,
                    position: {
                        "top": 50,
                        "bottom": 30,
                        "right": 10
                    }
                }
            }
        }

        //初始化[仅执行1次]
        create() {
            this.workSGMN = new WorkSGMN(this.viewer);
            this.workJYMN = new WorkJYMN(this.viewer);
            this.workCLMN = new WorkCLMN(this.viewer);
        }
        //每个窗口创建完成后调用
        winCreateOK(opt, result) {
            this.viewWindow = result;
        }
        //打开激活  
        activate() {


        }
        //关闭释放
        disable() {
            this.viewWindow = null;
            this.clearAll();
        }
        //定位到具体点 
        locateById(x, y) {
            if (!x || !y) return;
            this.viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(x, y, 2500),
                duration: 3,
                orientation: {
                    heading: 0,
                    pitch: Cesium.Math.toRadians(-90),
                    roll: 0
                }
            });
        }
        //结束模拟
        clearAll() {
            this.workSGMN.clearAll();
            this.workJYMN.clearAll();
            this.workCLMN.clearAll();
            haoutil.loading.close()
        }
        //======================事故模拟=============================
        //开始 图上选择事故点 
        startSelectSgd(callback) {
            this.workSGMN.selectSgd(callback);
        }
        //移除事故点
        removeSgd() {
            this.workSGMN.removeSgd();
        }
        //是否可以下一步（需要 选择了事故点）
        check1to2() {
            //this.stopDraw();
            //是否选择了点
            if (!this.workSGMN.point || this.workSGMN.point.length == 0) {
                window.toastr.error("请先选择事故点！");
                return false;
            }
            return true;
        }
        startSgmn(arg) {
            var that = this;
            //如果已有查询结果直接下一步，不用查询
            this.workSGMN.start(arg, {
                timelineCallback: function (step) { //  同步时间轴
                    var dis = that.workSGMN.radiusX || 0;
                    that.viewWindow.effactArea(dis);
                    that.viewWindow.timeProgress(step);
                    var comData = that.workSGMN.YWpois;
                    that.viewWindow.companyInfo(comData);
                },
                bootstrapTableCallback: function (data) { //同步bootstraptable表格
                    that.viewWindow.affectInfo(data);

                }
            });
        }
        loadMorePOI() {
            var that = this;
            this.workSGMN.loadMore(function (data) {
                that.viewWindow.moreTableList(data)
            });
        }
        //是否可以下一步（需要 事故模拟动画结束和查询完毕）
        check2to3() {
            //this.stopDraw();
            if (!this.workSGMN.state) {
                window.toastr.error("请等待模拟结束！");
                return this.workSGMN.state;
            }
            return this.workSGMN.state; //事故模拟过程是否结束
        }

        //======================撤离模拟=============================== 
        startSelectCld(callback) {
            //判断下如果已有查询结果直接下一步，不用查询
            // if (this.workCLMN.flylines && this.workCLMN.flylines.length > 0) {
            //     return;
            // } else {
            //     this.workCLMN.startSelectCld({
            //         lastEllipseData: this.workSGMN.extentData,
            //         callback: callback
            //     });
            // }
            this.workCLMN.startSelectCld({
                lastEllipseData: this.workSGMN.extentData,
                callback: callback
            });
        }
        //是否可以下一步（需要 存在事故模拟查询到的点和设置了撤离点）
        check3to4() {
            //this.stopDraw();
            if (this.workSGMN.point.length == 0) {
                haoutil.msg("没有受影响的点！");
                return false;
            }
            if (!this.workCLMN.points || this.workCLMN.points.length == 0) {
                haoutil.msg("请设置撤离点！");
                return false;
            }
            return true;
        }
        cheliDotNum() {
            return this.workCLMN.points.length;
        }
        //根据id删除对应的撤离点
        removeCLPointById(id) {
            if (!id) return;
            this.workCLMN.removePointById(id);
            this.workCLMN.removeLineAboutByPointId(id)
        }
        //计算撤离路线
        startClmn() {
            var that = this;
            var affectedPointArr = this.workSGMN.allPois;
            if (affectedPointArr.length > 50) {
                haoutil.msg("当前计算路线过多,仅分析前50个点！");
                affectedPointArr = affectedPointArr.slice(0, 50);
            }
            this.viewWindow.showRes(false);

            haoutil.msg("正在计算" + (affectedPointArr.length) + "个路线……");

            haoutil.loading.show();
            this.workCLMN.start({
                affectedPointArr: affectedPointArr,
                callback: function (dataArr) {
                    haoutil.loading.close();
                    //所有路线信息
                    that.viewWindow.safeLine(dataArr);
                    that.viewWindow.showRes(true);
                    that.viewWindow.clearLeave();
                },
                noComputeCallback: function () {
                    haoutil.loading.close();
                    that.viewWindow.showRes(true);
                }
            });
        }

        //漫游之前 先读取速度设置
        roamClmnOne(id, speed) {
            if (!id) return;
            //停止救援模拟
            this.workJYMN.stopAllRoam();
            this.workJYMN.resetAllLineStyle();

            this.closeAllPopup();
            this.workCLMN.roamOneById(id);
            this.workCLMN.updatePlaySpeed(speed || 120);
            this.showHidelineByid(id, true);
            this.workCLMN.hightOneLineById(id); //高亮
        }
        //撤离速度动态变化
        updateCLPlaySpeed(speed) {
            this.workCLMN.updatePlaySpeed(speed || 120);
        }
        roamClmnArr(ids, speed) {
            if (!ids || ids.length == 0) return;
            //停止救援模拟
            this.workJYMN.stopAllRoam();
            this.workJYMN.resetAllLineStyle();

            this.closeAllPopup();
            this.workCLMN.resetAllLineStyle();
            this.workCLMN.roamArrByIds(ids);
            this.workCLMN.updatePlaySpeed(speed || 120);
        }
        resetAllLineStyleCL() {
            this.workCLMN.resetAllLineStyle();
        }
        stopRoamClmnArr(ids) {
            if (!ids || ids.length == 0) return;
            this.closeAllPopup();
            this.workCLMN.stopRoamArrByIds(ids);
        }
        showHidelineByid(id, isShow) {
            if (!id) return;
            this.workCLMN.showHideLineById(id, isShow);
        }
        showHideAllLine(isShow) {
            this.workCLMN.showHideAllLine(isShow);
        }
        getMaxFlylineTime() {
            return this.workCLMN.getMaxFlylineTime();
        }
        //是否可以下一步（需要 路线全部分析完毕）
        check4to5() {
            //this.stopDraw();

            return this.workCLMN.state;
        }

        //===========================救援模拟================================== 
        startSelectJyd(callback) {
            this.workJYMN.startSelectJyd({
                callback: callback
            });
        }
        //是否可以下一步（需要 存在事故模拟查询到的点 和 设置了撤离点）
        check5to6() {
            //this.stopDraw();
            if (this.workSGMN.pois.length == 0) {
                haoutil.msg("没有受影响的点！");
                return false;
            }
            if (!this.workJYMN.points || this.workJYMN.points.length == 0) {
                haoutil.msg("请设置救援点！");
                return false;
            }
            return true;
        }

        //计算救援路线
        startJymn() {
            var that = this;
            haoutil.loading.show();
            this.viewWindow.showPro(false);
            this.workJYMN.start({
                incidentLnglat: this.workSGMN.point,
                callback: function (dataArr) {
                    haoutil.loading.close();
                    //所有路线信息
                    that.viewWindow.rescueLine(dataArr);
                    that.viewWindow.showPro(true);
                    that.viewWindow.clearRescue();
                },
                noComputeCallback: function () {
                    that.viewWindow.showPro(true);
                    haoutil.loading.close();
                }
            });
        }
        //根据id删除对应的救援点
        removeJYPointById(id) {
            if (!id) return;
            this.workJYMN.removePointById(id);
            this.workJYMN.removeLineAboutByPointId(id)
        }
        roamJymnOne(id, speed) {
            if (!id) return;
            //停止撤离模拟
            this.workCLMN.stopAllRoam();
            this.workCLMN.resetAllLineStyle();
            this.closeAllPopup();
            this.workJYMN.roamOneById(id);
            this.workJYMN.updatePlaySpeed(speed || 120);
            this.workJYMN.hightOneLineById(id); //高亮
            this.showHidelineByid_JY(id, true);
        }
        getOneTimeById(id) {
            if (!id) return;
            var times;
            times = this.workCLMN.getFlylineById(id).alltimes;
            return times;
        }
        getOtherOneTimeById(id) {
            if (!id) return;
            var times;
            times = this.workJYMN.getFlylineById(id).alltimes;
            return times;
        }
        roamJymnArr(ids, speed) {
            if (!ids || ids.length == 0) return;
            //停止撤离模拟
            this.workCLMN.stopAllRoam();
            this.workCLMN.resetAllLineStyle();

            this.closeAllPopup();
            this.workJYMN.resetAllLineStyle();
            this.workJYMN.roamArrByIds(ids);
            this.workJYMN.updatePlaySpeed(speed || 120);
        }
        resetAllLineStyleJY() {
            this.workJYMN.resetAllLineStyle();
        }
        stopJymnArr(ids) {
            if (!ids || ids.length == 0) return;
            this.closeAllPopup();
            this.workJYMN.stopRoamArrByIds(ids);
        }
        showHidelineByid_JY(id, isShow) {
            if (!id) return;
            this.workJYMN.showHideLineById(id, isShow);
        }
        showHideAllLine_JY(isShow) {
            this.workJYMN.showHideAllLine(isShow);
        }
        getMaxFlylineTime_JY() {
            return this.workJYMN.getMaxFlylineTime();
        }
        //救援速度动态变化
        updateJYPlaySpeed(speed) {
            this.workJYMN.updatePlaySpeed(speed || 120);
        }
        stopDraw() {
            this.workCLMN.stopDraw();
            this.workJYMN.stopDraw();
            this.workSGMN.stopDraw();
        }
        closeAllPopup() {
            this.viewer.mars.popup.close();
        }



    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 