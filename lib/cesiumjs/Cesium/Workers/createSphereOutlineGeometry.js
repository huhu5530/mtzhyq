define(["./when-ca071c93","./Check-802a3f11","./Math-59a6c1e7","./Cartesian2-5bd3176a","./Transforms-2310f912","./RuntimeError-d605d773","./WebGLConstants-95ceb4e9","./ComponentDatatype-e3c36b9a","./GeometryAttribute-aeca8222","./GeometryAttributes-3b5bdbdf","./IndexDatatype-5c71cf94","./GeometryOffsetAttribute-6b3def1e","./EllipsoidOutlineGeometry-7c54cbde"],function(r,e,i,n,t,s,o,a,d,l,c,u,m){"use strict";function p(e){var i=r.defaultValue(e.radius,1),e={radii:new n.Cartesian3(i,i,i),stackPartitions:e.stackPartitions,slicePartitions:e.slicePartitions,subdivisions:e.subdivisions};this._ellipsoidGeometry=new m.EllipsoidOutlineGeometry(e),this._workerName="createSphereOutlineGeometry"}p.packedLength=m.EllipsoidOutlineGeometry.packedLength,p.pack=function(e,i,t){return m.EllipsoidOutlineGeometry.pack(e._ellipsoidGeometry,i,t)};var y=new m.EllipsoidOutlineGeometry,G={radius:void 0,radii:new n.Cartesian3,stackPartitions:void 0,slicePartitions:void 0,subdivisions:void 0};return p.unpack=function(e,i,t){i=m.EllipsoidOutlineGeometry.unpack(e,i,y);return G.stackPartitions=i._stackPartitions,G.slicePartitions=i._slicePartitions,G.subdivisions=i._subdivisions,r.defined(t)?(n.Cartesian3.clone(i._radii,G.radii),t._ellipsoidGeometry=new m.EllipsoidOutlineGeometry(G),t):(G.radius=i._radii.x,new p(G))},p.createGeometry=function(e){return m.EllipsoidOutlineGeometry.createGeometry(e._ellipsoidGeometry)},function(e,i){return r.defined(i)&&(e=p.unpack(e,i)),p.createGeometry(e)}});