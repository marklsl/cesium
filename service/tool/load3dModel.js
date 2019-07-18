let load3dModel=function(viewer){
    let self=this;
    self.viewer=viewer;
    self.initFun=function(){
        self.iniClick();
    }
    //获取偏航角
    self.pointerAngle=function(){
        let direction = self.viewer.camera._direction;
        let x = Cesium.Math.toDegrees(direction.x);
        let y = Cesium.Math.toDegrees(direction.y);
        let z = Cesium.Math.toDegrees(direction.z);
        return {
            x:x,
            y:y,
            z:z,
        }
    }
}