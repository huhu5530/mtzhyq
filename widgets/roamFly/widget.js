(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {
        //弹窗配置
        get view() {
            return {
                type: "window",
                url: "view.html",
                windowOptions: {
                    width: 230,
                    height: 520,
                    //maxmin: true,
                }
            }
        }
        //初始化[仅执行1次]
        create() {

        }
        //每个窗口创建完成后调用
        winCreateOK(opt, result) {
            //layer.min(opt._layerIdx); //最小化窗口 
            this.viewWindow = result;
        }
        //打开激活
        activate() {
            var lonlats = this.config.data.points;
            if (!lonlats || lonlats.length < 2) {
                toastr.error('路线无坐标数据，无法漫游！');
                return;
            }

            var flyLine = new mars3d.FlyLine(this.viewer, this.config.data);
            this.flyLine = flyLine;

            this.createTimeLine();

            if (this.config.data.clampToGround) {
                var that = this;
                flyLine.clampToGround(function () {//异步计算完成贴地后再启动
                    that.startFly();
                });
            }
            else {
                this.startFly();
            }

        }
        startFly() {
            var flyLine = this.flyLine;

            //显示基本信息，名称、总长、总时间
            this.viewWindow.showAllInfo({
                name: flyLine.name,
                alllen: flyLine.alllen,
                alltime: flyLine.alltimes
            });
            if (this.viewer.timeline)
                this.viewer.timeline.zoomTo(flyLine.startTime, flyLine.stopTime);
            else if (this.timeline)
                this.timeline.zoomTo(flyLine.startTime, flyLine.stopTime);

            flyLine.start();


            var that = this;
            this.timetik = setInterval(function () {
                if (!that.flyLine.timeinfo) return;

                that.viewWindow.showRealTimeInfo(that.flyLine.timeinfo);
                that.updateCharsWidgeFlyOk(that.flyLine.timeinfo.len);//更新剖面图      

            }, 200);
        }
        //关闭释放
        disable() {
            this.viewWindow = null;

            clearInterval(this.timetik);

            this.flyLine.destroy();
            delete this.flyLine;

            this.removeTimeLine();
        }
        //界面更新参数
        getAttr() {
            return this.flyLine.options;
        }
        updateStyle(params) {
            this.flyLine.updateStyle(params);
        }

        //返回列表widget
        toRoamLine() {
            this.flyLine.stop();

            mars3d.widget.activate({
                uri: 'widgets/roamLine/widget.js',
            });
        }

        //显示剖面 
        showHeightChars() {
            var that = this;
            this.flyLine.getTerrainHeight(function (data) {
                that.updateCharsWidge(data);
            }, { splitNum: 100 });
        }
        updateCharsWidge(data) {
            mars3d.widget.activate({
                uri: 'widgets/roamChars/widget.js',
                data: data
            });

            // var roamingJK = mars3d.widget.getClass('widgets/roamChars/widget.js');
            // if (roamingJK && roamingJK.isActivate) { //如果在激活状态直接更新
            //     roamingJK.update(data);
            // }
            // else{
            //     mars3d.widget.activate({ 
            //         uri: 'widgets/roamChars/widget.js',
            //         data: data
            //     });
            // }

        }
        updateCharsWidgeFlyOk(alllen) {
            var roamingJK = mars3d.widget.getClass('widgets/roamChars/widget.js');
            if (roamingJK && roamingJK.isActivate) {
                roamingJK.changeFlyOk(alllen);
            }
        } 

        //创建时间控制
        createTimeLine() {
            var viewerContainer = this.viewer._element;
            if (!this.viewer.animation) {  // Animation 
                var animationContainer = document.createElement('div');
                animationContainer.className = 'cesium-viewer-animationContainer';
                viewerContainer.appendChild(animationContainer);
                var animation = new Cesium.Animation(animationContainer, new Cesium.AnimationViewModel(this.viewer.clockViewModel));
                this.animation = animation;
            }
            if (!this.viewer.timeline) {    // Timeline 
                var timelineContainer = document.createElement('div');
                timelineContainer.className = 'cesium-viewer-timelineContainer';
                timelineContainer.style.right = '0px';
                viewerContainer.appendChild(timelineContainer);
                var timeline = new Cesium.Timeline(timelineContainer, this.viewer.clock);
                timeline.addEventListener('settime', this.onTimelineScrubfunction, false);
                timeline.zoomTo(this.viewer.clock.startTime, this.viewer.clock.stopTime);
                this.timeline = timeline;
            }

            this.locationOldCss = this.viewer.mars.location._dom.css(['left', 'bottom']);
            this.viewer.mars.location._dom.css({ left: '170px', bottom: '25px' });


            this.legendOldCss = $(".distance-legend").css(['left', 'bottom']);
            $(".distance-legend").css({ "left": "150px", "bottom": "25px", });
        }
        onTimelineScrubfunction(e) {
            var clock = e.clock;
            clock.currentTime = e.timeJulian;
            clock.shouldAnimate = false;
        }
        removeTimeLine() {
            if (this.timeline)
                this.timeline.removeEventListener('settime', this.onTimelineScrubfunction, false);

            try {
                var viewerContainer = this.viewer._element;
                if (this.animation) {
                    viewerContainer.removeChild(this.animation.container);
                    this.animation.destroy();
                    this.animation = null;
                }
                if (this.timeline) {
                    viewerContainer.removeChild(this.timeline.container);
                    this.timeline.destroy();
                    this.timeline = null;
                }
                this.viewer.mars.location._dom.css(this.locationOldCss);
                $(".distance-legend").css(this.legendOldCss);
            }
            catch (e) {
                console.log(e);
            }
        } 
    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 