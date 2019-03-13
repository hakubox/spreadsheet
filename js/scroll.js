
function ScrollBar(config, pNode) {
    this.el = null;
    this.txtEl = null;

    this.render = function(parentNode) {
        let el = document.createElement("div");
        el.classList.add('scroll-bar');
        el.data = config;

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

    this.data = [];

    this.refresh = function() {
    }

    this.render = function(parentNode) {
        let el = document.createElement("div");
        el.classList.add('scroll', 'scroll-' + config.type);
        el.data = config;
        let scrollBar = new ScrollBar({
            ...config
        }, el);
        if(parentNode) {
            parentNode.appendChild(el);
        }
        return el;
    }

    if(pNode) {
        this.el = this.render(pNode);
        if(config.onInit) {
            config.onInit.call(this.el);
        }
    }
}