//兼容老版本Mars3d用户的，升级用户可以按需修改本js，非升级用户可以不引入本js 

mars3d.latlng = mars3d.point;  //1.6
function createModel(cfg, viewer) {
  cfg = viewer.mars.point2map(cfg); //转换坐标系

  var position = Cesium.Cartesian3.fromDegrees(cfg.x, cfg.y, cfg.z || 0);

  var heading = Cesium.Math.toRadians(cfg.heading || 0);
  var pitch = Cesium.Math.toRadians(cfg.pitch || 0);
  var roll = Cesium.Math.toRadians(cfg.roll || 0);
  var hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);

  var converter = cfg.converter || Cesium.Transforms.eastNorthUpToFixedFrame;
  var orientation = Cesium.Transforms.headingPitchRollQuaternion(
    position,
    hpr,
    viewer.scene.globe.ellipsoid,
    converter
  );

  var model = viewer.entities.add({
    name: cfg.name || "",
    position: position,
    orientation: orientation,
    model: cfg,
    tooltip: cfg.tooltip,
    popup: cfg.popup
  });
  return model;
}
mars3d.util.createModel = createModel;   //1.8.3
mars3d.model.createModel = createModel //2.2.0删除

mars3d.AnimationLineMaterialProperty = mars3d.material.LineFlowMaterialProperty  //1.8.5
mars3d.ElliposidFadeMaterialProperty = mars3d.material.CircleWaveMaterialProperty //1.8.5


mars3d.analysi.TerrainExcavate = mars3d.analysi.TerrainClip; //1.9.0
mars3d.analysi.TerrainFlood = mars3d.analysi.FloodByTerrain; //1.9.0
mars3d.analysi.VideoShed3D = mars3d.video.Video3D; //1.9.0
mars3d.VideoShed3D = mars3d.video.Video3D; //1.9.0

mars3d.util.terrainPolyline = mars3d.polyline.computeSurfaceLine; //1.9.1
mars3d.point.formatPositon = mars3d.point.formatPosition; //1.9.1  单词错误改正

mars3d.util.hasTerrain = mars3d.layer.hasTerrain; //1.9.3
mars3d.util.getEllipsoidTerrain = mars3d.layer.getEllipsoidTerrain; //1.9.3
mars3d.util.getTerrainProvider = mars3d.layer.getTerrainProvider; //1.9.3

//移动了方法
mars3d.point.computePolygonHeightRange = mars3d.polygon.getHeightRange; //2.0.2
mars3d.point.updateHeightForClampToGround = mars3d.point.setPositionSurfaceHeight; //2.0.2
mars3d.point.terrainPolyline = mars3d.polyline.computeSurfaceLine; //2.0.2
mars3d.util.getLinkedPointList = mars3d.polyline.getLinkedPointList; //2.0.2

mars3d.util.getLength = mars3d.measure.getLength; //2.1.0
mars3d.util.getArea = mars3d.measure.getArea; //2.1.0
mars3d.util.getAreaOfTriangle = mars3d.measure.getAreaOfTriangle; //2.1.0
mars3d.util.getAngle = mars3d.measure.getAngle; //2.1.0

mars3d.scene.RainFS = mars3d.shader.rain; //2.2.0
mars3d.scene.SnowFS = mars3d.shader.snow; //2.2.0
mars3d.draw.util = mars3d.draw.attr; //2.2.0
mars3d.draw.event = {
  DrawStart: mars3d.event.drawStart,
  DrawAddPoint: mars3d.event.drawAddPoint,
  DrawRemovePoint: mars3d.event.drawRemovePoint,
  DrawMouseMove: mars3d.event.drawMouseMove,
  DrawCreated: mars3d.event.drawCreated,
  EditStart: mars3d.event.editStart,
  EditMouseMoveStart: mars3d.event.editMouseDown,
  EditMouseMove: mars3d.event.editMouseMove,
  EditMovePoint: mars3d.event.editMovePoint,
  EditRemovePoint: mars3d.event.editRemovePoint,
  EditStop: mars3d.event.editStop,
  Delete: mars3d.event.delete,
  LoadEnd: mars3d.event.load
}; //2.2.0
mars3d.analysi.HeightCounterByTerrain = mars3d.analysi.ContourLine; //2.2.0
mars3d.CircleFadeMaterial = mars3d.material.CircleWaveMaterialProperty; //2.2.0
mars3d.CircleWaveMaterial = mars3d.material.CircleWaveMaterialProperty; //2.2.0
mars3d.CircleScanMaterial = mars3d.material.CircleScanMaterialProperty; //2.2.0
mars3d.LineFlowMaterial = mars3d.material.LineFlowMaterialProperty; //2.2.0
mars3d.TextMaterial = mars3d.material.TextMaterialProperty; //2.2.0
mars3d.GroundLineFlowMaterial = function (options) {
  return Cesium.Material.fromType(mars3d.material.LineFlowMaterial, options);
}; //2.2.0
