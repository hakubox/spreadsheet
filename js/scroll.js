
function ScrollBar(config, pNode) {
    this.el = null;
    this.txtEl = null;

    this.render = function(parentNode) {
        let el = document.createElement("div");
        el.classList.add('scroll-bar');
        el.data = {
            ...config,
            component: 'ScrollBar'
        };

        if(parentNode) {
            parentNode.appendChild(el);
        }

        return el;
    }

    //更新状态
    this.refresh = function() {
    }

    if(pNode) {
        this.el = this.render(pNode);
        if(config.onInit) {
            config.onInit.call(this.el);
        }
    }
}

/**
 * 滚动条
 */
function Scroll(config, pNode) {
    this.el = null;
    this.data = [];
    this.scrollBar = null;
    this.isStart = false;
    this.initLocation = null;
    this.value = 0;

    /**
     * 设置滚动条滑块长度
     */
    this.refresh = function() {
        if(config.type == 'vertical') {
            let _scrollHeight = this.el.offsetHeight,
                _pageHeight = window.innerHeight,
                _pageScrollHeight = Array(config.spread.maxRowCount).fill('').map((i, index) => config.spread.getRowHeight(index)).reduce((a, b) => a + b);
            this.scrollBar.el.style.height = (_scrollHeight * _pageHeight / _pageScrollHeight) + 'px';
        } else if (config.type == 'horizontal') {
            let _scrollWidth = this.el.offsetWidth,
                _pageWidth = window.innerWidth,
                _pageScrollWidth = Array(config.spread.maxColCount).fill('').map((i, index) => config.spread.getColWidth(index)).reduce((a, b) => a + b);
            this.scrollBar.el.style.width = (_scrollWidth * _pageWidth / _pageScrollWidth) + 'px';
        }
    }

    /**
     * 设置滚动条滑块位置
     */
    this.refreshLocation = function() {
        if(config.type == 'vertical') {
            let _scrollHeight = this.el.offsetHeight;
            this.value = _scrollHeight * config.spread.viewX / config.spread.maxRowCount;
            this.scrollBar.el.style.transform = 'translateY(' + this.value + 'px)';
        } else if (config.type == 'horizontal') {
            let _scrollWidth = this.el.offsetWidth;
            this.value = _scrollWidth * config.spread.viewY / config.spread.maxColCount;
            this.scrollBar.el.style.transform = 'translateX(' + this.value + 'px)';
        }
    }

    this.render = function(parentNode) {
        this.el = document.createElement("div");
        this.el.classList.add('scroll', 'scroll-' + config.type);
        this.el.data = {
            ...config,
            component: 'Scroll'
        };
        // this.el.addEventListener('mousedown', e => {
        //     switch (e.target.data.component) {
        //         case 'Scroll':
                    
        //             break;
        //         case 'ScrollBar':
        //             this.isStart = true;
        //             // console.log(e.offsetX);
        //             if(config.type == 'vertical') {
        //                 let _scrollHeight = this.el.offsetHeight;
        //             } else if (config.type == 'horizontal') {
        //                 let _scrollWidth = this.el.offsetWidth;
        //             }
        //             break;
        //     }
        // });
        // this.el.addEventListener('mousemove', e => {
        //     if(this.isStart) {

        //     }
        // });
        // document.body.addEventListener('mouseup', e => {
        //     this.isStart = false;
        // });
        this.scrollBar = new ScrollBar({
            ...config
        }, this.el);
        if(parentNode) {
            parentNode.appendChild(this.el);
        }
        return this.el;
    }

    if(pNode) {
        this.render(pNode);
        if(config.onInit) {
            config.onInit.call(this.el);
        }
    }
}