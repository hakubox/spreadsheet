function numToString(numm) {
    var stringArray = [];
    var numToStringAction = function (nnum) {
        var num = nnum - 1;
        var a = parseInt(num / 26);
        var b = num % 26;
        stringArray.push(String.fromCharCode(64 + parseInt(b + 1)));
        if (a > 0) {
            numToStringAction(a);
        }
    }
    numToStringAction(numm);
    return stringArray.reverse().join("");
}

/**
 * 表格表头单元格
 */
function HeaderCell(config, pNode) {
    this.el = null;
    this.txtEl = null;

    this.render = function(parentNode) {
        let el = document.createElement("li");
        this.txtEl = document.createElement("span");
        el.appendChild(this.txtEl);
        this.split = document.createElement("div");
        this.split.classList.add("header-split");
        el.appendChild(this.split);
        this.setIndex.call(this.txtEl, config.index);
        el.data = {
            ...config,
            component: 'HeaderCell'
        };

        if(parentNode) {
            parentNode.appendChild(el);
        }

        return el;
    }

    //设置展示下标
    this.setIndex = function(index) {
        (this.txtEl || this).innerHTML = config.headertype === 'top' ? numToString(index) : index;
    }

    //更新状态
    this.refresh = function() {
        let index = 0;
        if(config.headertype === 'left') {
            if(config.spread.freezeArea.top < config.index) {
                index = config.index + config.spread.viewX - 1;
            } else {
                index = config.index - 1;
            }
        } else {
            if(config.spread.freezeArea.left < config.index) {
                index = config.index + config.spread.viewY - 1;
            } else {
                index = config.index - 1;
            }
        }

        let headIndex = config.spread.selected.findIndex(([x, y]) =>
            config.headertype === 'left' ? index === x : index === y
        );

        if(headIndex >= 0) {
            this.el.classList.add('active');
        } else {
            this.el.classList.remove('active');
        }
    }

    if(pNode) {
        this.el = this.render(pNode);
        if(config.onInit) {
            config.onInit.call(this.el);
        }
    }
}

/**
 * 表格表头
 */
function HeaderList(config, pNode) {

    this.data = [];

    this.setStartIndex = function(startIndex) {
        this.data.forEach((i, index) => {
            if(config.headertype === 'top') {
                if(index < config.spread.freezeArea.left) {
                    i.setIndex(index + 1);
                } else {
                    i.setIndex(startIndex + index + 1);
                }
            } else if(config.headertype === 'left') {
                if(index < config.spread.freezeArea.top) {
                    i.setIndex(index + 1);
                } else {
                    i.setIndex(startIndex + index + 1);
                }
            }
        });
    }

    this.refresh = function() {
        this.data.forEach((i, index) => {
            i.refresh();
        });
    }

    this.render = function(parentNode) {
        let el = document.createElement("ul");
        el.classList.add('header-list');
        el.setAttribute('type', config.headertype);
        el.data = {
            ...config,
            component: 'HeaderList'
        };
        Array(config.count).fill('').map((i, index) => {
            let item = new HeaderCell({
                ...config,
                index: config.spread.viewX + index + 1
            }, el);
            this.data.push(item);
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
