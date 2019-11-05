// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        gridImg:cc.Prefab,
        gridText:cc.Prefab,
        gridBg:cc.Prefab,
    },

    start () {
        

        for(let i=0;i<5;i++){
            for(let j=0;j<5;j++){
                let bg = cc.instantiate(this.gridImg)
                let text = cc.instantiate(this.gridText)
                let bg2 = cc.instantiate(this.gridBg)
                let size = bg.getContentSize()
                let _x = (i-2)*size.width
                let _y = (j-2)*size.height
                if (i==2&&j==2){
                    continue
                }
                bg.setPosition(_x,_y)
                text.setPosition(_x,_y)
                bg2.setPosition(_x,_y)

                this.node.addChild(bg2)
                this.node.addChild(bg,1)
                this.node.addChild(text,2)

                bg.addComponent(cc.Button)
                bg.on('click',()=>{
                    bg.runAction(cc.fadeOut(1.0))
                    text.runAction(cc.fadeOut(1.0))
                })
            }
        }
    },
});
