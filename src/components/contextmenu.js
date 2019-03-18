
/**
 * 右键菜单项
 */
function ContextMenuItem(config, pNode) {
    this.el = null;
    this.txtEl = null;
    this.data = config;
    this.onInit = config.menu.onInit;

    this.render = function(parentNode) {
        let el = document.createElement("li");
        this.txtEl = document.createElement("span");
        this.txtEl.innerHTML = config.menu.text;
        el.appendChild(this.txtEl);
        this.keyEl = document.createElement("key");
        this.keyEl.innerHTML = config.menu.key;
        el.appendChild(this.keyEl);
        // this.split = document.createElement("div");
        // this.split.classList.add("header-split");
        // el.appendChild(this.split);
        el.data = config;

        if(parentNode) {
            parentNode.appendChild(el);
            config.menu.onClick && el.addEventListener('mousedown', e => {
                if(e.buttons === 1) {
                    config.menu.onClick.call(this, e);
                    this.data.hide();
                }
            });
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
 * 右键菜单
 */
function ContextMenu(config, pNode) {
    this.el = null;
    this.data = {
        ...config, 
        menuEls: []
    };

    let el = null;

    this.refresh = function() {
        this.data.forEach((i, index) => {
            i.refresh();
        });
    }

    this.hide = function() {
        el.style.left = '-999px';
        el.style.top = '-999px';
        el.classList.remove('context-menu-show');
    }

    this.show = function(x, y) {
        this.data.menuEls.forEach(i => {
            if(i.onInit) {
                let state = i.onInit(i);
                if(state) {
                    if(state.hidden) {
                        i.el.classList.add('hidden');
                    } else {
                        i.el.classList.remove('hidden');
                    }
                }
            }
        });

        this.el.style.left = x + 'px';
        this.el.style.top = y + 'px';
        this.el.classList.add('context-menu-show');
    }

    this.render = function(parentNode) {
        el = document.createElement("ul");
        el.classList.add('context-menu');
        //el.data = {...config, menuEls: []};
        config.menus.map((i, index) => {
            let item = new ContextMenuItem({
                ...config,
                menu: i,
                hide: this.hide
            }, el);
            this.data.menuEls.push(item);
            //el.data.menuEls.push(item);
        });
        document.body.appendChild(el);
        if(parentNode) {
            parentNode.addEventListener('mousedown', e => {
                if(e.buttons === 1) {
                    this.hide();
                } else if(e.buttons === 2) {
                    this.show(e.pageX, e.pageY);
                    //console.log(e.pageX, e.pageY, e.target.tagName, e);
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
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