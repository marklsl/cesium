let pointer=function(viewer){
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
    //将右下角的图标方位变化
    self.turnCompass=function(deg) {
        deg = (deg ? deg : 0)
        $('.pointer').css('transform', 'rotate(' + deg + 'deg)');
    }
    self.iniClick=function(){
        //三维球转动监听
        self.viewer.camera.changed.addEventListener(function (percentage){
            let angleObj=self.pointerAngle();
            self.turnCompass(angleObj.x);
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        //右下角的图标双击回归正北
        // $(".compass").unbind("dblclick").dblclick(function(){
        //     let centerPoint=window.util.getCenterPosition();
        //     let angleObj=self.pointerAngle();
        //     debugger
        //     // window.util.gobackprojectcenter(centerPoint.lon,centerPoint.lat,centerPoint.height,"0",angleObj.y,angleObj.z);
        //     window.util.setCameraView(116.53200992,39.96773193,135970.38753016366,0,angleObj.y,angleObj.z);
        // })
    }

}