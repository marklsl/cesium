let measurement=function(viewer){
    let self=this;
    self.viewer=viewer;
    self.handler="";
    let drawEntityNum=0;//记录绘制的次数
    /***********************测量空间直线距离******************** */
    self.measureLineSpace=function() {
        // 取消双击事件-追踪该位置
        self.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        self.handler = new Cesium.ScreenSpaceEventHandler(self.viewer.scene._imageryLayerCollection);
        let positions = [];
        let poly = null;
        let distance = 0;
        let cartesian = null;
        let floatingPoint;
        //鼠标移动
        self.handler.setInputAction(function (movement) {
            let ray = self.viewer.camera.getPickRay(movement.endPosition);
            cartesian = self.viewer.scene.globe.pick(ray, self.viewer.scene);
            if (positions.length >= 2) {
                if (!Cesium.defined(poly)) {
                    poly = new PolyLinePrimitive(positions);
                } else {
                    positions.pop();
                    positions.push(cartesian);
                }
                distance = getSpaceDistance(positions);
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        //鼠标左键
        self.handler.setInputAction(function (movement) {
            let ray = self.viewer.camera.getPickRay(movement.position);
            cartesian = self.viewer.scene.globe.pick(ray, self.viewer.scene);
            if (positions.length == 0) {
                positions.push(cartesian.clone());
            }
            positions.push(cartesian);
            //在三维场景中添加Label
            let textDisance = distance + "米";
            floatingPoint = self.viewer.entities.add({
                id:'drawLayer'+(drawEntityNum++),
                name: '空间直线距离',
                position: positions[positions.length - 1],
                point: {
                    pixelSize: 5,
                    color: Cesium.Color.RED,
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 2,
                },
                label: {
                    text: textDisance,
                    font: '18px sans-serif',
                    fillColor: Cesium.Color.GOLD,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth: 2,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(20, -20),
                }
            });
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        //鼠标右键
        self.handler.setInputAction(function (movement) {
            self.handler.destroy(); //关闭事件句柄
            positions.pop(); //最后一个点无效

        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        //绘制连接线
        let PolyLinePrimitive = (function () {
            function _(positions) {
                this.options = {
                    id:'drawLayer'+(drawEntityNum++),
                    name: '直线',
                    polyline: {
                        show: true,
                        positions: [],
                        material: Cesium.Color.CHARTREUSE,
                        width: 10,
                        clampToGround: true
                    }
                };
                this.positions = positions;
                this._init();
            }

            _.prototype._init = function () {
                let _self = this;
                let _update = function () {
                    return _self.positions;
                };
                //实时更新polyline.positions
                this.options.polyline.positions = new Cesium.CallbackProperty(_update, false);
                self.viewer.entities.add(this.options);
            };

            return _;
        })();

        //空间两点距离计算函数
        function getSpaceDistance(positions) {
            let distance = 0;
            for (let i = 0; i < positions.length - 1; i++) {

                let point1cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
                let point2cartographic = Cesium.Cartographic.fromCartesian(positions[i + 1]);
                /**根据经纬度计算出距离**/
                let geodesic = new Cesium.EllipsoidGeodesic();
                geodesic.setEndPoints(point1cartographic, point2cartographic);
                let s = geodesic.surfaceDistance;
                //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
                //返回两点之间的距离
                s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
                distance = distance + s;
            }
            return distance.toFixed(2);
        }
    }
    /****************************测量空间周长************************************************/
    self.measurePerimeterSpace=function(){
        // 取消双击事件-追踪该位置
        self.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        // 鼠标事件
        self.handler = new Cesium.ScreenSpaceEventHandler(self.viewer.scene._imageryLayerCollection);
        let positions = [];
        let tempPoints = [];
        let distance = 0;
        let poly = null;
        let cartesian = null;
        let floatingPoint;//浮动点
        //鼠标移动
        self.handler.setInputAction(function (movement) {
            let ray = self.viewer.camera.getPickRay(movement.endPosition);
            cartesian = self.viewer.scene.globe.pick(ray, self.viewer.scene);
            if (positions.length >= 2) {
                if (!Cesium.defined(poly)) {
                    poly = new PolyLinePrimitive(positions);
                } else {
                    positions.pop();
                    positions.push(cartesian);
                }
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        //鼠标左键
        self.handler.setInputAction(function (movement) {
            let ray = self.viewer.camera.getPickRay(movement.position);
            cartesian = self.viewer.scene.globe.pick(ray, self.viewer.scene);
            if (positions.length == 0) {
                positions.push(cartesian.clone());
            }
            positions.push(cartesian);
            floatingPoint = self.viewer.entities.add({
                id:'drawLayer'+(drawEntityNum++),
                name: '空间直线距离',
                position: positions[positions.length - 1],
                point: {
                    pixelSize: 5,
                    color: Cesium.Color.RED,
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 2,
                }
            });
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        //鼠标右键
        self.handler.setInputAction(function (movement) {
            self.handler.destroy();
            positions.pop();
            //在三维场景中添加Label
            let lastPoi=[];
            for(let i=0;i<positions.length;i++){
                lastPoi.push(positions[i]);
            }
            lastPoi.push(positions[0]);
            distance = getSpaceDistance(lastPoi);
            let textDisance = "周长"+distance + "米";
            self.viewer.entities.add({
                id:'drawLayer'+(drawEntityNum++),
                name: '多边形周长',
                position: positions[positions.length - 1],
                label: {
                    text: textDisance,
                    font: '18px sans-serif',
                    fillColor: Cesium.Color.GOLD,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth: 2,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(20, -20),
                }
            });
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        //绘制连接线
        let PolyLinePrimitive = (function () {
            function _(positions) {
                this.options = {
                    id:'drawLayer'+(drawEntityNum++),
                    name: '直线',
                    polyline: {
                        show: true,
                        positions: [],
                        material: Cesium.Color.CHARTREUSE,
                        width: 10,
                        clampToGround: true
                    }
                };
                this.positions = positions;
                this._init();
            }

            _.prototype._init = function () {
                let _self = this;
                let _update = function () {
                    let lastPoi=[];
                    for(let i=0;i<_self.positions.length;i++){
                        lastPoi.push(_self.positions[i]);
                    }
                    lastPoi.push(_self.positions[0]);
                    return lastPoi;
                };
                //实时更新polyline.positions
                this.options.polyline.positions = new Cesium.CallbackProperty(_update, false);
                self.viewer.entities.add(this.options);
            };
            return _;
        })();

        //空间两点距离计算函数
        function getSpaceDistance(positions) {
            let allDistance = 0;
            for (let i = 0; i < positions.length - 1; i++) {
                let point1cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
                let point2cartographic = Cesium.Cartographic.fromCartesian(positions[i + 1]);
                /**根据经纬度计算出距离**/
                let geodesic = new Cesium.EllipsoidGeodesic();
                geodesic.setEndPoints(point1cartographic, point2cartographic);
                let s = geodesic.surfaceDistance;
                //返回两点之间的距离
                s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
                allDistance = allDistance + s;
            }
            return allDistance.toFixed(2);
        }
    }
    /****************************测量空间面积************************************************/
    self.measureAreaSpace=function(){
        // 取消双击事件-追踪该位置
        self.viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
        // 鼠标事件
        self.handler = new Cesium.ScreenSpaceEventHandler(self.viewer.scene._imageryLayerCollection);
        let positions = [];
        let tempPoints = [];
        let polygon = null;
        // let tooltip = document.getElementById("toolTip");
        let cartesian = null;
        let floatingPoint;//浮动点
        //鼠标移动
        self.handler.setInputAction(function (movement) {
            let ray = self.viewer.camera.getPickRay(movement.endPosition);
            cartesian = self.viewer.scene.globe.pick(ray, self.viewer.scene);
            if (positions.length >= 2) {
                if (!Cesium.defined(polygon)) {
                    polygon = new PolygonPrimitive(positions);
                } else {
                    positions.pop();
                    // cartesian.y += (1 + Math.random());
                    positions.push(cartesian);
                }
                // tooltip.innerHTML='<p>'+distance+'米</p>';
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        //鼠标左键
        self.handler.setInputAction(function (movement) {
            let ray = self.viewer.camera.getPickRay(movement.position);
            cartesian = self.viewer.scene.globe.pick(ray, self.viewer.scene);
            if (positions.length == 0) {
                positions.push(cartesian.clone());
            }
            positions.push(cartesian);
            //在三维场景中添加点
            let cartographic = Cesium.Cartographic.fromCartesian(positions[positions.length - 1]);
            let longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
            let latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
            let heightString = cartographic.height;
            tempPoints.push({lon: longitudeString, lat: latitudeString, hei: heightString});
            floatingPoint = self.viewer.entities.add({
                id:'drawLayer'+(drawEntityNum++),
                name: '多边形面积',
                position: positions[positions.length - 1],
                point: {
                    pixelSize: 5,
                    color: Cesium.Color.RED,
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 2,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                }
            });
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        //鼠标右键
        self.handler.setInputAction(function (movement) {
            self.handler.destroy();
            positions.pop();
            let textArea = getArea(tempPoints) + "平方公里";
            self.viewer.entities.add({
                id:'drawLayer'+(drawEntityNum++),
                name: '多边形面积',
                position: positions[positions.length - 1],
                label: {
                    text: textArea,
                    font: '18px sans-serif',
                    fillColor: Cesium.Color.GOLD,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth: 2,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(20, -40),
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                }
            });
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        let radiansPerDegree = Math.PI / 180.0;//角度转化为弧度(rad)
        let degreesPerRadian = 180.0 / Math.PI;//弧度转化为角度

        //计算多边形面积
        function getArea(points) {
            let res = 0;
            //拆分三角曲面
            for (let i = 0; i < points.length - 2; i++) {
                let j = (i + 1) % points.length;
                let k = (i + 2) % points.length;
                let totalAngle = Angle(points[i], points[j], points[k]);


                let dis_temp1 = distance(positions[i], positions[j]);
                let dis_temp2 = distance(positions[j], positions[k]);
                res += dis_temp1 * dis_temp2 * Math.abs(Math.sin(totalAngle));
                console.log(res);
            }
            return (res / 1000000.0).toFixed(4);
        }

        /*角度*/
        function Angle(p1, p2, p3) {
            let bearing21 = Bearing(p2, p1);
            let bearing23 = Bearing(p2, p3);
            let angle = bearing21 - bearing23;
            if (angle < 0) {
                angle += 360;
            }
            return angle;
        }

        /*方向*/
        function Bearing(from, to) {
            let lat1 = from.lat * radiansPerDegree;
            let lon1 = from.lon * radiansPerDegree;
            let lat2 = to.lat * radiansPerDegree;
            let lon2 = to.lon * radiansPerDegree;
            let angle = -Math.atan2(Math.sin(lon1 - lon2) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2));
            if (angle < 0) {
                angle += Math.PI * 2.0;
            }
            angle = angle * degreesPerRadian;//角度
            return angle;
        }

        let PolygonPrimitive = (function () {
            function _(positions) {
                this.options = {
                    id:'drawLayer'+(drawEntityNum++),
                    name: '多边形',
                    polygon: {
                        hierarchy: [],
                        // perPositionHeight : true,
                        material: Cesium.Color.GREEN.withAlpha(0.5),
                        // heightReference:20000
                    }
                };

                this.hierarchy = positions;
                this._init();
            }

            _.prototype._init = function () {
                let _self = this;
                let _update = function () {
                    return _self.hierarchy;
                };
                //实时更新polygon.hierarchy
                this.options.polygon.hierarchy = new Cesium.CallbackProperty(_update, false);
                self.viewer.entities.add(this.options);
            };

            return _;
        })();

        function distance(point1, point2) {
            let point1cartographic = Cesium.Cartographic.fromCartesian(point1);
            let point2cartographic = Cesium.Cartographic.fromCartesian(point2);
            /**根据经纬度计算出距离**/
            let geodesic = new Cesium.EllipsoidGeodesic();
            geodesic.setEndPoints(point1cartographic, point2cartographic);
            let s = geodesic.surfaceDistance;
            //返回两点之间的距离
            s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
            return s;
        }
    }
    /****************************判断绘制点是否与之前的点重合********************************/
    self.judgePoint=function(arr,point){
        let isCh=false;
        for(let i=0;i<arr.length;i++){
            let eleArr=arr[i];
            let bl=true
            for(let j=0;j<eleArr.length;j++){
                if(eleArr[j]!=point[j]){
                    bl=false;
                }
            }
            if(bl){
                isCh=bl;
                break;
            }
        }
        return isCh;
    }
    /****************************清除鼠标事件************************************************/
    self.clear=function(){
        if(self.handler){
            self.handler.destroy(); //关闭事件句柄
        }
        if(self.viewer){
            for(let i=0;i<drawEntityNum;i++){
                self.viewer.entities.removeById("drawLayer"+i);
            }
            drawEntityNum=0;
        }
    }
}
