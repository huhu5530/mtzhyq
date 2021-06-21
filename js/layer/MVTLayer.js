//如果需要在config.json中type定义非类库内置瓦片图层类型时，可以按下面示例进行扩展，主要是重写createImageryProvider方法。
//该类内部主要使用的的2个属性：this.config是config.json中配置的对应节点参数，this.viewer是地球对象

// mvt矢量瓦片(MapBox Vector Tile)地图加载, 依赖lib\cesiumjs\plugins\pbf\mvt.js 和 ol.js 
class MVTLayer extends mars3d.layer.TileLayer { 
    createImageryProvider(config) {
        var mvtProvider = new mars3d.MvtImageryProvider({
            url: config.url,
            // style: new mars3d.MvtStyle.Sld({
            //     ol: ol,
            //     json: config.json
            // })
        });
        return mvtProvider;
    }
}

//注册到mars3d内部图层管理中：type为mvt时，实例化MVTLayer
mars3d.layer.regLayerForConfig("mvt", MVTLayer);
