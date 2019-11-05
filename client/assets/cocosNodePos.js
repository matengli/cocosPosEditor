
var script = document.createElement('script')
script.src = 'https://cdn.bootcss.com/jquery/3.4.1/jquery.min.js'
document.head.appendChild(script)

cc.Class({
    extends: cc.Component,

    properties: {
        girdPrefab:cc.Prefab,
        MENU:cc.Node,
        scrollContent:cc.Node,
        logLabel:cc.Label,
        selectedNode:cc.Node,
        arrorImg:cc.SpriteFrame,
        severIP:"127.0.0.1"
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        self = this
        this.severIP = window.location.hostname;

        $.post(`http://${this.severIP}:5000/get`, {}, (data,status)=>{
            self.logLabel.string = '初始化数据\n'+status;
            if (status!='success'){
                return
            }
            for(var item of Object.entries(data)) {
                var element = this.node.getChildByName(item[0]+'')
                if (element)
                    element.setPosition(item[1].x,item[1].y)
            }
            this.initData();

        },'json')

        this.ignoreNameList = ['Main Camera']
        
        var  arrow = this.selectedNode;
        this.drawArrowGraphic(arrow,0)
        arrow.on(cc.Node.EventType.TOUCH_MOVE,(event)=>{
            var pos = new cc.Vec2(event.getLocationX(),event.getLocationY());
            arrow.position = pos
            
            var withTarget = arrow.withTarget
            if(withTarget){
                var localPos = this.node.convertToNodeSpaceAR(pos)
                withTarget.setPosition(localPos)
                withTarget.editX.getComponent(cc.EditBox).string = localPos.x
                withTarget.editY.getComponent(cc.EditBox).string = localPos.y
            }
        },this)

        this.registKeyBoard();
    },

    registKeyBoard(){
        var camera = cc.Camera.main;
        var self = this;
        var handleMove = function(_x,_y,speed=100){
            // var p = camera.node.getPosition()
            // camera.node.setPosition(p.x+_x*speed,p.y+_y*speed)
            var p = self.node.getPosition()
            self.node.setPosition(p.x+_x*speed,p.y+_y*speed)            
        }

        var handleCameraScale = function(rex,speed=0.1){
            // camera.zoomRatio+=speed*rex
            self.node.setScale(self.node.scaleX+1*speed*rex,self.node.scaleY+1*speed*rex)
            self.drawFrameImg(self.selectedNode.getChildByName('frameImg'),self.selectedNode.withTarget)
        }
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN,(event)=>{
            cc.log(event)
            switch(event.keyCode) {

                case cc.macro.KEY.w:
                    handleMove(0,1)
                    cc.log(111)
                    break;
                case cc.macro.KEY.a:
                    handleMove(-1,0)
                    break;
                case cc.macro.KEY.s:
                    handleMove(0,-1)
                    break;
                case cc.macro.KEY.d:
                    handleMove(1,0)
                    break;
                case cc.macro.KEY["]"]:
                    handleCameraScale(1)
                    break;
                case cc.macro.KEY["["]:
                    handleCameraScale(-1)
                    break;
            }
        },camera)
    },

    drawArrowGraphic(arrow,opacityType){
        var g = arrow.getComponent(cc.Graphics);
        var opacityConfig = [255,50,0]
        cc.log(opacityConfig[opacityType])
        g.clear()

        var drawArror = function(_w,_l,_color,rotation){
            g.moveTo(0, 0);
            if (_color){
                g.fillColor = _color
            }else{
                g.fillColor = cc.color(0,255,0,255)
            }

            var rex = (Math.sqrt(5)-1)/2
            var dots = [[_w*rex,0],[_w*rex,_l*rex],[_w,_l*rex],
                        [0,_l],
                        [-_w,_l*rex],[-_w*rex,_l*rex],[-_w*rex,0]]
            var rotate = [1,1]
            
            if(rotation){
                rotation = rotation/180*Math.PI
                rotate = [Math.sin(rotation).toFixed(2),Math.cos(rotation).toFixed(2)]
            }

            dots.forEach((pos)=>{
                if (rotation){
                    g.lineTo(pos[0]*rotate[1]-pos[1]*rotate[0],pos[0]*rotate[0]+pos[1]*rotate[1])
                }else{
                    g.lineTo(pos[0],pos[1])
                }
            })
            g.close();
            g.stroke();
            g.fill();
        }

        var _randC = function(i){
            return 255*Math.random()
        }

        for (let index = 0; index < 10; index++) {
            drawArror(5,30,cc.color(_randC(index),_randC(index),_randC(index),opacityConfig[opacityType]),360/10*index)
        }
    },
    
    drawFrameImg(frame,element){
        var g = frame.getComponent(cc.Graphics);
        g.clear()
        if(this.isHideFrame){
            return;
        }
        var ar = element.getAnchorPoint()
        var cs = element.getContentSize()
        var scaleX = this.node.scaleX;
        var scaleY = this.node.scaleY;
        g.rect(-ar.x*cs.width*scaleX,-ar.y*cs.height*scaleY,cs.width*scaleX,cs.height*scaleY)
        g.close()
        g.stroke();
        g.fill();
    },

    start () {

    },

    initData(){
        this.node.children.forEach(element => {
            if (this.ignoreNameList.indexOf(element.name)!=-1){
                
            }else{
                this.addElement2ScrollContent(this.scrollContent,this.girdPrefab,element,element.name,element.getPosition(),element.active)
            }
        });
    },

    addElement2ScrollContent(content,prefab,element,name,pos,active){
        var node = cc.instantiate(prefab)
        content.addChild(node,0)
        // 注册文本框的更新事件
        var watchers= this.updateElement(node,name,pos,active)
        watchers.editX.on('text-changed',(event)=>{
            var y =  element.getPosition().y;
            var x = event.string;
            if (x == '')
                return
            
            element.setPosition(parseInt(x),y)
        })

        watchers.editY.on('text-changed',(event)=>{
            var x =  element.getPosition().x;
            var y = event.string;
            if (y == '')
                return
            
            element.setPosition(x,parseInt(y))

        })

        watchers.active.on('toggle',(event)=>{
            element.active = event.isChecked;
            
        })

        element.editX = watchers.editX
        element.editY = watchers.editY


        self = this
        //注册点击的事件
        node.on('click',(event)=>{
            self.selectedNode.setPosition(self.node.convertToWorldSpaceAR(element.getPosition()))
            if (self.selectedNode.withTarget == element){
                element.runAction(cc.sequence(cc.scaleTo(0.2,2),cc.scaleTo(0.1,1)))
            }
            self.selectedNode.withTarget = element
            self.drawFrameImg(self.selectedNode.getChildByName('frameImg'),element)
        })

    },

    updateElement(node,name,pos,active){
        var _name =  node.getChildByName('Name');
        _name.getComponent(cc.Label).string = name;
        var _editX = node.getChildByName('X').getChildByName('edit');
        _editX.getComponent(cc.EditBox).string = pos.x
        var _editY = node.getChildByName('Y').getChildByName('edit');
        _editY.getComponent(cc.EditBox).string = pos.y
        var _active = node.getChildByName('isActive');
        _active.getComponent(cc.Toggle).isChecked = active;

        return {'name':_name,'editX':_editX,'editY':_editY,'active':_active}
    },

    onClickConfirmBtn(){
        var data = {}
        self = this

        this.node.children.forEach(element => {
            if (this.ignoreNameList.indexOf(element.name)!=-1){
                
            }else{
                data[element.name]={x:element.getPosition().x,y:element.getPosition().y,}
            }
            
        });
        
        $.post(`http://${this.severIP}:5000/set`,{data:JSON.stringify(data)} , (response)=>{
            if(response.status){
                self.logLabel.string = "成功提交数据"
            }else{
                self.logLabel.string = '提交数据失败'
            }
        },'json')


        return;
    
    },

    OnClickArrowConfig(event,data){
        this.drawArrowGraphic(this.selectedNode,data)
    },
    OnClickFrameConfig(event,data){
        cc.log(data)
        this.isHideFrame = data=='false'?false:true
        this.drawFrameImg(this.selectedNode.getChildByName("frameImg"),this.selectedNode.withTarget)
    },

    update (dt) {

    },
});
