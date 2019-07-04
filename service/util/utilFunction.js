let util=function(viewer){
    let self=this;
    self.viewer=viewer;
    /* 获取camera高度  */
    self.getHeight=function() {
        if (self.viewer) {
            var scene = self.viewer.scene;
            var ellipsoid = scene.globe.ellipsoid;
            var height = ellipsoid.cartesianToCartographic(self.viewer.camera.position).height;
            return height;
        }
    }

    /* 获取camera中心点坐标 */
    self.getCenterPosition=function () {
        var result = self.viewer.camera.pickEllipsoid(new Cesium.Cartesian2(self.viewer.canvas.clientWidth / 2, self.viewer.canvas
            .clientHeight / 2));
        var curPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(result);
        var lon = curPosition.longitude * 180 / Math.PI;
        var lat = curPosition.latitude * 180 / Math.PI;
        var height = self.getHeight();
        return {
            lon: lon,
            lat: lat,
            height: height
        };
    }
    /* 移动视野 */
    self.setCameraView=function(centerLon,centerLat,height,headingNum,pitchNum,rollNum){
        self.viewer.camera.setView({
            // Cesium的坐标是以地心为原点，一向指向南美洲，一向指向亚洲，一向指向北极州
            // fromDegrees()方法，将经纬度和高程转换为世界坐标
            destination:Cesium.Cartesian3.fromDegrees(centerLon,centerLat,height),
            orientation:{
                // 指向
                heading:Cesium.Math.toRadians(headingNum),
                // 视角
                pitch:Cesium.Math.toRadians(pitchNum),
                roll:rollNum
            }
        });

    }
    /* 视角飞到某个位置    （经度、维度、高度） */
    self.gobackprojectcenter=function(centerLon,centerLat,height,headingNum,pitchNum,rollNum){
        if(headingNum==undefined){
            headingNum=20;
        }
        if(pitchNum==undefined){
            pitchNum=-90;
        }
        if(rollNum==undefined){
            rollNum=0;
        }
        //飞到某个角度
        self.viewer.camera.flyTo({
            destination :  Cesium.Cartesian3.fromDegrees(centerLon,centerLat,height), // 设置位置
            orientation: {
                heading : Cesium.Math.toRadians(headingNum), // 方向
                pitch : Cesium.Math.toRadians(pitchNum),// 倾斜角度
                roll : rollNum
            },
            duration:1, // 设置飞行持续时间，默认会根据距离来计算
            complete: function () {
                // 到达位置后执行的回调函数
                console.log('到达目的地');
            },
            cancle: function () {
                // 如果取消飞行则会调用此函数
                console.log('飞行取消')
            }
        });
    }
    //获取视野范围
    self.getCurrentExtent=function() {
        // 范围对象
        var extent = {};

        // 得到当前三维场景
        var scene = self.viewer.scene;

        // 得到当前三维场景的椭球体
        var ellipsoid = scene.globe.ellipsoid;
        var canvas = scene.canvas;

        // canvas左上角
        var car3_lt = self.viewer.camera.pickEllipsoid(new Cesium.Cartesian2(0, 0), ellipsoid);

        // canvas右下角
        var car3_rb = self.viewer.camera.pickEllipsoid(new Cesium.Cartesian2(canvas.width, canvas.height), ellipsoid);

        // 当canvas左上角和右下角全部在椭球体上
        if (car3_lt && car3_rb) {
            var carto_lt = ellipsoid.cartesianToCartographic(car3_lt);
            var carto_rb = ellipsoid.cartesianToCartographic(car3_rb);
            extent.xmin = Cesium.Math.toDegrees(carto_lt.longitude);
            extent.ymax = Cesium.Math.toDegrees(carto_lt.latitude);
            extent.xmax = Cesium.Math.toDegrees(carto_rb.longitude);
            extent.ymin = Cesium.Math.toDegrees(carto_rb.latitude);
        }

        // 当canvas左上角不在但右下角在椭球体上
        else if (!car3_lt && car3_rb) {
            var car3_lt2 = null;
            var yIndex = 0;
            do {
                // 这里每次10像素递加，一是10像素相差不大，二是为了提高程序运行效率
                yIndex <= canvas.height ? yIndex += 10 : canvas.height;
                car3_lt2 = self.viewer.camera.pickEllipsoid(new Cesium.Cartesian2(0, yIndex), ellipsoid);
            } while (!car3_lt2);
            var carto_lt2 = ellipsoid.cartesianToCartographic(car3_lt2);
            var carto_rb2 = ellipsoid.cartesianToCartographic(car3_rb);
            extent.xmin = Cesium.Math.toDegrees(carto_lt2.longitude);
            extent.ymax = Cesium.Math.toDegrees(carto_lt2.latitude);
            extent.xmax = Cesium.Math.toDegrees(carto_rb2.longitude);
            extent.ymin = Cesium.Math.toDegrees(carto_rb2.latitude);
        }

        // 获取高度
        extent.height = Math.ceil(self.viewer.camera.positionCartographic.height);
        return extent;
    }
    /**
     * 绘制点
     * @param param{location:位置，pngUrl:图片路径，widthHeight:宽高，offArrange：偏移量，name：名称，code:标识}
     */
    self.makePoint=function(param){
        let pointYs = self.viewer.entities.add( {
            id:param.id,
            name : param.name,
            code: param.code,
            position : Cesium.Cartesian3.fromDegrees(param.location[0],param.location[1]),
            point : { //点
                pixelSize : 25,
                color : "rgba(255,0,0,0)",
                outlineColor : Cesium.Color.ORANGE,
                outlineWidth : 3
            },
            // label : { //文字标签
            //     text : param.name,
            //     font : '14pt monospace',
            //     style : Cesium.LabelStyle.FILL,
            //     outlineWidth : 2,
            //     verticalOrigin : Cesium.VerticalOrigin.BOTTOM, //垂直方向以底部来计算标签的位置
            //     pixelOffset : new Cesium.Cartesian2( param.offArrange[0],param.offArrange[1]  )   //偏移量
            // },
            billboard : { //图标
                image  : param.pngUrl,
                width : param.widthHeight[0],
                height : param.widthHeight[1]
            }
        } );
    }
    /**
     * 绘制线
     * @param param{location:经纬度数组,color:颜色，code：唯一标识，name:名称}
     */
    self.makeLine=function(param){
        let lineYs = self.viewer.entities.add({
            id:param.id,
            name : param.name,
            code:param.code,
            polyline : {
                positions : Cesium.Cartesian3.fromDegreesArray(param.location),
                width : 8,
                material : new Cesium.PolylineGlowMaterialProperty({
                    glowPower : 0.6,
                    color : Cesium.Color.ORANGE
                })
            }
        });
    }
    /**
     * 绘制面
     * @param param{location:经纬度数组,material：材质，outlineColor:边界颜色，code：唯一标识，name:名称}
     */
    self.makePolygon=function(param){
        var polygonYs = viewer.entities.add({
            id:param.id,
            name : param.name,
            code:param.code,
            polygon : {
                hierarchy : Cesium.Cartesian3.fromDegreesArray(param.location),
                extrudedHeight: 0,
                perPositionHeight : true,
                material : Cesium.Color.ORANGE,
                outline : true,
                outlineColor : Cesium.Color.BLACK
            }
        });
    }
}