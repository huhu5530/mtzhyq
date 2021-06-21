(function (window, mars3d) {
    //创建widget类，需要继承BaseWidget
    class MyWidget extends mars3d.widget.BaseWidget {


        //弹窗配置
        get view() {
            return {
                type: "window",
                url: "view.html",
                windowOptions: {
                    width: 240,
                    height: 100
                }
            }
        }


        //初始化[仅执行1次]
        create() {
            this.particles = [];
            this.drawControl = new mars3d.Draw({
                viewer: this.viewer,
                hasEdit: false
            });
        }
        //每个窗口创建完成后调用
        winCreateOK(opt, result) {
            this.viewWindow = result;
        }
        //激活插件
        activate() {
            //this.viewer.scene.debugShowFramesPerSecond = true;
        }
        //释放插件
        disable() {
            this.viewWindow = null;
            //this.viewer.scene.debugShowFramesPerSecond = false;
            //this.clear();
        }
        createFire(options) {
            var that = this;
            this.drawControl.startDraw({
                type: "point",
                style: {},
                success: function (entity) {
                    that.createParticle(entity);
                }
            });
        }
        createParticle(entity) {
            var modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(entity.position.getValue());
            this.drawControl.deleteEntity(entity);

            //
            var viewModel = {
                emissionRate: 5.0,
                gravity: 0.0,
                minimumParticleLife: 1.0,
                maximumParticleLife: 1.0,
                minimumSpeed: 1.0,
                maximumSpeed: 4.0,
                startScale: 1.0,
                endScale: 5.0,
                particleSize: 25.0,
                transX: 2.5,
                transY: 4.0,
                transZ: 1.0,
                heading: 0.0,
                pitch: 0.0,
                roll: 0.0,
                fly: true,
                spin: true,
                show: true
            };

            var emitterModelMatrix = new Cesium.Matrix4();
            var translation = new Cesium.Cartesian3();
            var rotation = new Cesium.Quaternion();
            var hpr = new Cesium.HeadingPitchRoll();
            var trs = new Cesium.TranslationRotationScale();
            function computeEmitterModelMatrix() {
                hpr = Cesium.HeadingPitchRoll.fromDegrees(viewModel.heading, viewModel.pitch, viewModel.roll, hpr);

                trs.translation = Cesium.Cartesian3.fromElements(viewModel.transX, viewModel.transY, viewModel.transZ, translation);
                trs.rotation = Cesium.Quaternion.fromHeadingPitchRoll(hpr, rotation);

                return Cesium.Matrix4.fromTranslationRotationScale(trs, emitterModelMatrix);
            }

            var particleSystem = this.viewer.scene.primitives.add(new Cesium.ParticleSystem({
                image: this.path + 'img/fire.png',
                startColor: Cesium.Color.RED.withAlpha(0.7),    //粒子出生时的颜色
                endColor: Cesium.Color.YELLOW.withAlpha(0.3),   //当粒子死亡时的颜色
                startScale: viewModel.startScale,   //粒子出生时的比例，相对于原始大小
                endScale: viewModel.endScale,       //粒子在死亡时的比例
                minimumParticleLife: viewModel.minimumParticleLife, //设置粒子寿命的可能持续时间的最小界限（以秒为单位），粒子的实际寿命将随机生成
                maximumParticleLife: viewModel.maximumParticleLife, //设置粒子寿命的可能持续时间的最大界限（以秒为单位），粒子的实际寿命将随机生成
                minimumSpeed: viewModel.minimumSpeed,  //设置以米/秒为单位的最小界限，超过该最小界限，随机选择粒子的实际速度。
                maximumSpeed: viewModel.maximumSpeed,  //设置以米/秒为单位的最大界限，超过该最大界限，随机选择粒子的实际速度。
                imageSize: new Cesium.Cartesian2(viewModel.particleSize, viewModel.particleSize), //如果设置该属性，将会覆盖 minimumImageSize和maximumImageSize属性，以像素为单位缩放image的大小
                emissionRate: viewModel.emissionRate, //每秒发射的粒子数。
                bursts: [
                    // time：在粒子系统生命周期开始之后的几秒钟内将发生突发事件。
                    // minimum：突发中发射的最小粒子数量
                    // maximum：突发中发射的最大粒子数量 
                    new Cesium.ParticleBurst({ time: 5.0, minimum: 10, maximum: 100 }),  // 当在5秒时，发射的数量为10-100
                    new Cesium.ParticleBurst({ time: 10.0, minimum: 50, maximum: 100 }), // 当在10秒时，发射的数量为50-100
                    new Cesium.ParticleBurst({ time: 15.0, minimum: 200, maximum: 300 })  // 当在15秒时，发射的数量为200-300
                ],
                lifetime: 16.0, //多长时间的粒子系统将以秒为单位发射粒子
                emitter: new Cesium.CircleEmitter(2.0),  //此系统的粒子发射器  共有 圆形、锥体、球体、长方体 ( BoxEmitter,CircleEmitter,ConeEmitter,SphereEmitter ) 几类
                modelMatrix: modelMatrix,  // 4x4转换矩阵，可将粒子系统从模型转换为世界坐标
                emitterModelMatrix: computeEmitterModelMatrix() // 4x4转换矩阵，用于在粒子系统本地坐标系中转换粒子系统发射器
            }));
            this.particles.push(particleSystem);

        }
        clear() {
            for (var i = 0; i < this.particles.length; i++) {
                this.viewer.scene.primitives.remove(this.particles[i]);
            }
            this.particles = [];

            this.removeRain();
            this.removeSnow();
        }
        //雪 
        removeSnow() {
            if (this.snowPrimitive) {
                this.viewer.scene.primitives.remove(this.snowPrimitive);
                this.snowPrimitive = null;
            }
        }
        addSnow() {
            this.removeRain();
            this.removeSnow();

            var scene = this.viewer.scene;
            var snowParticleSize = scene.drawingBufferWidth / 100.0;
            var snowRadius = 100000.0;
            var minimumSnowImageSize = new Cesium.Cartesian2(snowParticleSize, snowParticleSize);
            var maximumSnowImageSize = new Cesium.Cartesian2(snowParticleSize * 2.0, snowParticleSize * 2.0);
            var snowSystem;

            var snowGravityScratch = new Cesium.Cartesian3();
            var snowUpdate = function (particle, dt) {
                snowGravityScratch = Cesium.Cartesian3.normalize(particle.position, snowGravityScratch);
                Cesium.Cartesian3.multiplyByScalar(snowGravityScratch, Cesium.Math.randomBetween(-30.0, -300.0), snowGravityScratch);
                particle.velocity = Cesium.Cartesian3.add(particle.velocity, snowGravityScratch, particle.velocity);

                var distance = Cesium.Cartesian3.distance(scene.camera.position, particle.position);
                if (distance > snowRadius) {
                    particle.endColor.alpha = 0.0;
                } else {
                    particle.endColor.alpha = snowSystem.endColor.alpha / (distance / snowRadius + 0.1);
                }
            };

            snowSystem = new Cesium.ParticleSystem({
                image: this.path + 'img/snowflake_particle.png',
                modelMatrix: new Cesium.Matrix4.fromTranslation(scene.camera.position), //4x4变换矩阵，将粒子系统从模型转换为世界坐标。
                minimumSpeed: -1.0,  //设置以米/秒为单位的最小界限，超过该最小界限，随机选择粒子的实际速度。
                maximumSpeed: 0.0,   //设置以米/秒为单位的最大界限，超过该最大界限，随机选择粒子的实际速度。
                lifetime: 15.0,     //粒子系统会发射多久粒子，以秒为单位。默认为最大值
                emitter: new Cesium.SphereEmitter(snowRadius), //此系统的粒子发射器  共有 圆形、锥体、球体、长方体 ( BoxEmitter,CircleEmitter,ConeEmitter,SphereEmitter ) 几类
                startScale: 0.5,   //粒子出生时的比例，相对于原始大小
                endScale: 1.0,     //粒子在死亡时的比例
                emissionRate: 7000.0, //每秒发射的粒子数
                startColor: Cesium.Color.WHITE.withAlpha(0.0),  //粒子出生时的颜色，代替color使得粒子的颜色在粒子的生命过程中会在这两种颜色之间平滑地混合
                endColor: Cesium.Color.WHITE.withAlpha(1.0),    //粒子死亡时的颜色，代替color使得粒子的颜色在粒子的生命过程中会在这两种颜色之间平滑地混合
                minimumImageSize: minimumSnowImageSize,   //图像最小size大小
                maximumImageSize: maximumSnowImageSize,     //图像最大size大小
                updateCallback: snowUpdate   //每帧都要调用的回调函数来更新粒子。
            });
            this.snowPrimitive = scene.primitives.add(snowSystem);

            // 
            scene.skyAtmosphere.hueShift = -0.8;
            scene.skyAtmosphere.saturationShift = -0.7;
            scene.skyAtmosphere.brightnessShift = -0.33;

            scene.fog.density = 0.001;
            scene.fog.minimumBrightness = 0.8;

        }
        // 雨 
        removeRain() {
            if (this.rainPrimitive) {
                this.viewer.scene.primitives.remove(this.rainPrimitive);
                this.rainPrimitive = null;
            }
        }
        addRain() {
            this.removeRain();
            this.removeSnow();

            var scene = this.viewer.scene;
            var rainParticleSize = scene.drawingBufferWidth / 80.0;
            var rainRadius = 100000.0;
            var rainImageSize = new Cesium.Cartesian2(rainParticleSize, rainParticleSize * 2.0);

            var rainSystem;

            var rainGravityScratch = new Cesium.Cartesian3();
            var rainUpdate = function (particle, dt) {
                rainGravityScratch = Cesium.Cartesian3.normalize(particle.position, rainGravityScratch);
                rainGravityScratch = Cesium.Cartesian3.multiplyByScalar(rainGravityScratch, -1050.0, rainGravityScratch);

                particle.position = Cesium.Cartesian3.add(particle.position, rainGravityScratch, particle.position);

                var distance = Cesium.Cartesian3.distance(scene.camera.position, particle.position);
                if (distance > rainRadius) {
                    particle.endColor.alpha = 0.0;
                } else {
                    particle.endColor.alpha = rainSystem.endColor.alpha / (distance / rainRadius + 0.1);
                }
            };

            rainSystem = new Cesium.ParticleSystem({
                image: this.path + 'img/circular_particle.png',
                modelMatrix: new Cesium.Matrix4.fromTranslation(scene.camera.position), //4x4变换矩阵，将粒子系统从模型转换为世界坐标。
                speed: -1.0,    //设置以米/秒为单位的最小和最大速度
                lifetime: 15.0,  //粒子系统会发射多久粒子，以秒为单位。默认为最大值
                emitter: new Cesium.SphereEmitter(rainRadius), //此系统的粒子发射器  共有 圆形、锥体、球体、长方体 ( BoxEmitter,CircleEmitter,ConeEmitter,SphereEmitter ) 几类
                startScale: 1.0,     //粒子出生时的比例，相对于原始大小
                endScale: 0.0,      //粒子在死亡时的比例
                emissionRate: 9000.0,   //每秒发射的粒子数
                startColor: new Cesium.Color(0.27, 0.5, 0.70, 0.0),//粒子出生时的颜色，代替color使得粒子的颜色在粒子的生命过程中会在这两种颜色之间平滑地混合
                endColor: new Cesium.Color(0.27, 0.5, 0.70, 0.98), //粒子死亡时的颜色，代替color使得粒子的颜色在粒子的生命过程中会在这两种颜色之间平滑地混合
                imageSize: rainImageSize,   //如果设置该属性，将会覆盖 minimumImageSize和maximumImageSize属性，以像素为单位缩放image的大小
                updateCallback: rainUpdate  //每帧都要调用的回调函数来更新粒子。
            });
            this.rainPrimitive = scene.primitives.add(rainSystem);

            // 
            scene.skyAtmosphere.hueShift = -0.97;
            scene.skyAtmosphere.saturationShift = 0.25;
            scene.skyAtmosphere.brightnessShift = -0.4;

            scene.fog.density = 0.00025;
            scene.fog.minimumBrightness = 0.01;
        }




    }


    //注册到widget管理器中。
    mars3d.widget.bindClass(MyWidget);

    //每个widet之间都是直接引入到index.html中，会存在彼此命名冲突，所以闭包处理下。
})(window, mars3d) 