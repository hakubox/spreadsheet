import tool from '../tools.js';

/**
 * @class 工具按钮
 */
export function ToolMenuItem(config, pNode) {
    this.el = null;

    this.render = function(parentNode) {
        let el = document.createElement("li");

        if(config.menu == '|') {
            el.className = 'tool-menu-split';
        } else {
            if(config.menu.icon) {
                this.iconEl = document.createElement("i");
                this.iconEl.className = config.menu.icon;
                el.appendChild(this.iconEl);
            } else {
                this.txtEl = document.createElement("span");
                this.txtEl.innerHTML = config.menu.text;
                el.appendChild(this.txtEl);
            }

            this.tooltipEl = document.createElement("span");
            this.tooltipEl.className = 'tool-menu-tooltip';
            this.tooltipEl.innerHTML = config.menu.text;
            el.appendChild(this.tooltipEl);

            if(config.menu.key) {
                this.keyEl = document.createElement("key");
                this.keyEl.innerHTML = config.menu.key;
                el.appendChild(this.keyEl);
            }
        }
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
 * @class 工具列表
 */
export function ToolMenu(config, pNode) {
    this.el = null;
    this.data = {
        ...config,
        menuEls: []
    };

    this.refresh = function() {
        this.data.forEach((i, index) => {
            i.refresh();
        });
    }

    this.render = function(parentNode) {
        let el = tool.createDom("ul", {
            className: 'tool-menu'
        });
        el.data = {
            ...config,
            component: 'HeaderList'
        };
        config.menus.map((i, index) => {
            let item = new ToolMenuItem({
                ...config,
                menu: i
            }, el);
            this.data.menuEls.push(item);
            //el.data.menuEls.push(item);
        });
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
