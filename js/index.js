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
        el.data = config;

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
        el.data = config;
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

function Input(config, pNode) {

    if(pNode) {
        this.el = this.render(pNode);
        if(config.onInit) {
            config.onInit.call(this.el);
        }
    }
}

function TextBox(config, pNode) {
    this.el = null;
    // this.call(new Input(config));

    this.isEdit = false;

    //按键事件
    this.onKeyPress = function(event) {
        config.spread.inputKeyPress(
            config.rowIndex,
            config.colIndex,
            event
        );
    }

    let _class = [];

    /**
     * 重绘合并状态
     */
    this.refreshMerge = function() {
        let _pnode = this.el.parentNode;
        let mergeinfo = config.spread.areaMerge.find(([x, y, rowspan, colspan]) => 
            x === config.rowIndex && 
            y === config.colIndex
        );
        if(mergeinfo) {
            this.el.style.width = mergeinfo[3] * 100 + 'px';
            this.el.style.height = mergeinfo[2] * 25 + 'px';
            _pnode.setAttribute('rowspan', mergeinfo[2]);
            _pnode.setAttribute('colspan', mergeinfo[3]);
        } else {
            this.el.style.width = '100px';
            this.el.style.height = '25px';
            _pnode.removeAttribute('rowspan');
            _pnode.removeAttribute('colspan');
        }

        let mergeheadinfo = config.spread.areaMerge.find(([x, y, rowspan, colspan]) => 
            x <= config.rowIndex && 
            x + rowspan > config.rowIndex && 
            y <= config.colIndex &&
            y + colspan > config.colIndex && 
            !(x === config.rowIndex && y === config.colIndex));
        if(mergeheadinfo) {
            //console.log(config.rowIndex, config.colIndex);
            _pnode.classList.add('hidden');
        }
    }

    /**
     * 重绘选中状态
     */
    this.refresh = function() {
        let colIndex = config.colIndex,
            rowIndex = config.rowIndex,
            _pnode = this.el.parentNode;
        _class = [];
        if(config.rowIndex >= config.spread.freezeArea.top) {
            rowIndex += config.spread.viewX;
        }
        if(config.colIndex >= config.spread.freezeArea.left) {
            colIndex += config.spread.viewY;
        }

        //活动单元格
        if(config.spread.active[0] === rowIndex && config.spread.active[1] === colIndex) {
            _class.push('focus');
            if(this.isEdit === false) {
                _pnode.removeChild(this.el);
                _pnode.appendChild(this.render(_pnode));
                this.el.value = config.spread.getData(rowIndex, colIndex);
                setTimeout(() => this.el.focus(), 1);
                this.isEdit = true;
            }
        } else {
            if(this.isEdit === true) {
                _pnode.removeChild(this.el);
                _pnode.appendChild(this.render(_pnode));
                this.el.innerHTML = config.spread.getData(rowIndex, colIndex);
                this.el.focus();
                this.isEdit = false;
            }
            //选中单元格
            let td = config.spread.selected.find(([x, y]) => x === rowIndex && y === colIndex);
            if(td) {
                _class.push('selected');
            }
        }

        if (config.spread.selectedArea.type === 'cell') {

            if (rowIndex == config.spread.selectedArea.x &&
                colIndex == config.spread.selectedArea.y) {
                _class.push('selected-area-init');
            }

            //设置当前范围
            if (rowIndex == config.spread.selectedArea.minx &&
                colIndex >= config.spread.selectedArea.miny &&
                colIndex <= config.spread.selectedArea.maxy) {
                _class.push('selected-area-top');
            }
            if (rowIndex == config.spread.selectedArea.maxx &&
                colIndex >= config.spread.selectedArea.miny &&
                colIndex <= config.spread.selectedArea.maxy) {
                _class.push('selected-area-bottom');
            }

            if (colIndex == config.spread.selectedArea.miny &&
                rowIndex >= config.spread.selectedArea.minx &&
                rowIndex <= config.spread.selectedArea.maxx) {
                _class.push('selected-area-left');
            }
            if (colIndex == config.spread.selectedArea.maxy &&
                rowIndex >= config.spread.selectedArea.minx &&
                rowIndex <= config.spread.selectedArea.maxx) {
                _class.push('selected-area-right');
            }

        } else if (config.spread.selectedArea.type === 'row') {

            if (rowIndex == config.spread.selectedArea.x - 1 && colIndex == 0) {
                _class.push('selected-area-init');
            }

            //设置当前范围
            if (rowIndex == config.spread.selectedArea.minx - 1) {
                _class.push('selected-area-top');
            }
            if (rowIndex == config.spread.selectedArea.maxx - 1) {
                _class.push('selected-area-bottom');
            }

        } else if (config.spread.selectedArea.type === 'col') {
            if (rowIndex == 0 && colIndex == config.spread.selectedArea.y - 1) {
                _class.push('selected-area-init');
            }

            //设置当前范围
            if (colIndex == config.spread.selectedArea.miny - 1) {
                _class.push('selected-area-left');
            }
            if (colIndex == config.spread.selectedArea.maxy - 1) {
                _class.push('selected-area-right');
            }
        }

        let _className = _class.join(' '),
            _oldClassName = _pnode.className;
        if(_className !== _oldClassName && (_className != '' || _oldClassName !== '')) {
            _pnode.className = _className;
        }
    }

    this.render = function(parentNode) {
        let el = null;

        if(config.spread.active[0] === config.rowIndex + config.spread.viewX && config.spread.active[1] === config.colIndex) {
            el = document.createElement("textarea");
            el.type = "text";
            el.classList.add("data-txt-input");
            el.onkeydown = this.onKeyPress;
        } else {
            el = document.createElement("span");
        }

        el.classList.add("data-txt");
        el.freeze = config.freeze;
        el.style.width = config.spread.getColWidth(config.colIndex) + 'px';
        el.style.height = config.spread.getRowHeight(config.rowIndex + config.spread.viewX) + 'px';
        el.data = config;
        config.spread.viewText[config.rowIndex][config.colIndex] = this;

        if(parentNode) {
            parentNode.appendChild(el);
        }
        this.el = el;
        return el;
    };

    if(pNode) {
        this.el = this.render(pNode);
        if(config.onInit) {
            config.onInit.call(this.el);
        }
    }
}

/**
 * @class 单元格
 */
function Cell(config, pNode) {
    this.el = null;

    this.render = function(parentNode) {
        let el = document.createElement("td");
        el.data = config;
        // if(config.colIndex === config.spread.freezeArea.left) {
        //     el.classList.add('cell-freeze-left');
        // }
        // if(config.rowIndex === config.spread.freezeArea.top) {
        //     el.classList.add('cell-freeze-top');
        // }
        // el.style.width = "100px";
        el.appendChild(new TextBox(config).render());

        if(parentNode) {
            parentNode.appendChild(el);
        }
        return el;
    };

    if(pNode) {
        this.el = this.render(pNode);
        if(config.onInit) {
            config.onInit.call(this.el);
        }
    }
}

/**
 * @class 行
 */
function Row(config, pNode) {

    this.render = function(parentNode) {
        let el = document.createElement("tr");
        el.data = config;
        Array(config.colNum).fill('').map((i, colIndex) => {
            el.appendChild(new Cell({
                ...config,
                colIndex: colIndex
            }).render());
        });

        if(parentNode) {
            parentNode.appendChild(el);
        }
        return el;
    };

    if(pNode) {
        this.el = this.render(pNode);
        if(config.onInit) {
            config.onInit.call(this.el);
        }
    }
}

/**
 * @class 表格
 */
function Table(config, pNode) {
    this.el = null;

    this.render = function(parentNode) {
        let el = document.createElement("table");
        el.data = config;
        el.appendChild(document.createElement("tbody"));

        Array(config.rowNum).fill('').map((i, rowIndex) => {
            el.childNodes[0].appendChild(
                new Row({
                    ...config,
                    rowIndex
                }).render()
            )
        });

        if(parentNode) {
            parentNode.appendChild(el);
        }
        return el;
    };

    if(pNode) {
        this.el = this.render(pNode);
        if(config.onInit) {
            config.onInit.call(this.el);
        }
    }
}

/**
 * @class 表格页
 */
function Spread(config, pNode) {
    this.el = null;

    /**
     * 默认单元格宽度
     */
    let _cellDefaultWidth = 100;
    let _cellDefaultHeight = 25;
    /**
     * 是否为编辑状态
     */
    let _isEdit = true;
    /**
     * 单元格宽度
     */
    let _colWidth = [];
    /**
     * 单元格高度
     */
    let _rowHeight = [];

    /**
     * 显示横坐标
     */
    let _viewX = 0;
    /**
     * 显示纵坐标
     */
    let _viewY = 0;
    Object.defineProperties(this, {
        viewX: {
            get() {
                return _viewX;
            },
            set(value) {
                if(value < 0) value = 0;
                this.header.left.setStartIndex(value);
                _viewX = value;
            }
        },
        viewY: {
            get() {
                return _viewY;
            },
            set(value) {
                if(value < 0) value = 0;
                this.header.top.setStartIndex(value);
                _viewY = value;
            }
        }
    })
    /**
     * 行数
     */
    this.rowNum = 40;
    /**
     * 列数
     */
    this.colNum = 20;
    /**
     * 所有数据
     */
    this.data = [];
    /**
     * 当前显示数据
     */
    this.viewData = [[]];
    /**
     * 当前显示文本框
     */
    this.viewText = [];
    /**
     * 已选中区域
     */
    this.selected = [];
    /**
     * 已框选区域
     */
    this.selectedArea = {
        x: 0,
        y: 0,
        x2: 0,
        y2: 0,
        get minx() {
            return Math.min(this.x, this.x2)
        },
        get miny() {
            return Math.min(this.y, this.y2)
        },
        get maxx() {
            return Math.max(this.x, this.x2)
        },
        get maxy() {
            return Math.max(this.y, this.y2)
        },
        isStart: false,
        isActive: false,
        type: 'cell'
    };
    /**
     * 当前活动单元格
     */
    this.active = [];
    /**
     * 当前绑定表格区域（边缘冻结表格）
     */
    this.panels = {
        main: null,
        top: null,
        right: null,
        bottom: null,
        left: null,
        topleft: null,
        topright: null,
    };
    /**
     * 冻结区域
     */
    this.freezeArea = {
        top: 2,
        left: 1,
        right: 1,
        bottom: 0
    };
    /**
     * 单元格合并区域
     */
    this.areaMerge = [
        [3, 3, 2, 2]
    ];
    /**
     * 合并后隐藏区域（在合并区域调整后初始化
     */
    this.areaMergeHideCell = [];
    /**
     * 顶部与左侧头部区域
     */
    this.header = {
        top: null,
        left: null
    }

    //设置值
    this.setData = function(x, y, value = '') {
        if(!this.viewData[x]) {
            this.viewData[x] = [];
        }
        this.viewData[x][y] = value;
        this.viewText[x - this.viewX][y - this.viewY].el.value = value;
    }

    //获取值
    this.getData = function(x, y) {
        if(!this.viewData[x] || this.viewData[x][y] === undefined) {
            return '';
        }
        return this.viewData[x][y];
    }

    /**
     * 获取列宽度
     */
    this.getColWidth = function(x) {
        return _colWidth[x] || _cellDefaultWidth;
    }

    /**
     * 获取行高度
     */
    this.getRowHeight = function(y) {
        return _rowHeight[y] || _cellDefaultHeight;
    }

    /**
     * 设置列宽度
     */
    this.setColWidth = function(colIndex, width) {
        _colWidth[colIndex] = width;
        spread.viewText.map((i, index) => i[colIndex]).forEach(i => i.el.style.width = width + 'px');
    }

    this.setRowHeight = function(rowIndex, height) {
        _rowHeight[rowIndex] = height;
        spread.viewText[rowIndex].forEach(i => i.forEach(item => item.el.style.height = height + 'px'));
    }

    //设置当前焦点单元格
    this.setFocus = function(x, y) {
        this.active = [];
        this.selected = [[x, y]];
        this.selectedArea.x = x;
        this.selectedArea.y = y;
        this.selectedArea.x2 = x;
        this.selectedArea.y2 = y;
        //spread.viewText[x][y].el.click();

        this.refreshSelected();
        this.header.top.refresh();
        this.header.left.refresh();
    }

    /**
     * 设置冻结区域（参数格式：{[top:],[left:],[right:],[bottom:]}）
     */
    this.setFreezeArea = function(config) {
        if(config.x) {

        }
    }

    //按键事件
    this.inputKeyPress = function(x, y, e) {
        switch (e.keyCode) {
            case 38:
                if(x > 0) {
                    this.setFocus(x - 1, y);
                }
                break;
            case 13:
            case 40:
                if(x < this.viewData.length - 1) {
                    this.setFocus(x + 1, y);
                }
                break;
            case 37:
                if(y > 0) {
                    this.setFocus(x, y - 1);
                }
                break;
            case 39:
                if(y < this.viewData[0].length - 1) {
                    this.setFocus(x, y + 1);
                }
                break;
            default:
                break;
        }
        if(e.keyCode === 13) {
            if(x < this.viewData.length - 1) {
                this.setFocus(x + 1, y);
            }
        }
        if([13, 37, 38, 39, 40].includes(e.keyCode)) {
            e.stopPropagation();
            e.preventDefault();
        }
    }

    /**
     * 重绘选中状态
     */
    this.refreshSelected = function() {
        this.viewText.forEach(row => row.forEach(cell => cell.refresh()));
    }

    /**
     * 重绘合并状态
     */
    this.refreshMerge = function() {
        this.viewText.forEach(row => row.forEach(cell => cell.refreshMerge()));
    }

    /**
     * 设置合并单元格
     */
    this.setMerge = function(x, y, rowspan, colspan) {
        let mergeIndex = this.areaMerge.findIndex(([x1, y1, rowspan, colspan]) => x1 === x && y1 === y);
        if(mergeIndex >= 0) {
            if(rowspan > 1 || colspan > 1) {
                this.areaMerge[mergeIndex][2] = rowspan;
                this.areaMerge[mergeIndex][3] = colspan;
            } else {
                this.areaMerge.splice(mergeIndex, 1);
            }
        } else {
            this.areaMerge.push([x, y, rowspan, colspan]);
        }
        this.refreshMerge();
        this.selectedArea.x = x;
        this.selectedArea.x2 = x;
        this.selectedArea.y = y;
        this.selectedArea.y2 = y;
        this.refreshSelected();
    }

    this.render = function(parentNode) {
        let el = document.createElement("div");
        el.classList.add('haku-spreadsheet');
        //el.data = config;

        //构造左侧头部
        let headerbodyleft = document.createElement("div");
        headerbodyleft.classList.add('header-body-left');
        let leftHeader = new HeaderList({
            ...config,
            spread: this,
            headertype: 'left',
            count: this.rowNum,
            onInit() {
                //this.classList.add('header-list-left');
            }
        }, headerbodyleft);
        this.header.left = leftHeader;
        el.appendChild(headerbodyleft);

        //构造顶部头部
        let headerbodytop = document.createElement("div");
        headerbodytop.classList.add('header-body-top');
        let topHeader = new HeaderList({
            ...config,
            spread: this,
            headertype: 'top',
            count: this.colNum,
            onInit() {
                //this.classList.add('header-list-top');
            }
        }, headerbodytop);
        this.header.top = topHeader;
        el.appendChild(headerbodytop);

        //构造表格
        let fixedMain = document.createElement("div");
        this.panels.main = fixedMain;
        fixedMain.classList.add('haku-spreadsheet-main');


        let fixedMainBody = document.createElement("div");
        fixedMainBody.classList.add('haku-spreadsheet-main-body');

        let tableMain = new Table({
            ...config,
            freeze: '',
            spread: this,
            rowNum: this.rowNum,
            colNum: this.colNum,
            onInit() {
                this.classList.add('haku-table', 'haku-table-main');
            }
        }, fixedMainBody);

        fixedMain.appendChild(fixedMainBody);
        el.appendChild(fixedMain);

        let elScrollX = document.createElement("div");
        elScrollX.classList.add('haku-scroll', 'haku-scroll-x');
        let elScrollBodyX = document.createElement("div");
        elScrollBodyX.classList.add('haku-scroll-body');
        elScrollX.appendChild(elScrollBodyX);
        el.appendChild(elScrollX);

        let elScrollY = document.createElement("div");
        elScrollY.classList.add('haku-scroll', 'haku-scroll-y');
        let elScrollBodyY = document.createElement("div");
        elScrollBodyY.classList.add('haku-scroll-body');
        elScrollY.appendChild(elScrollBodyY);
        el.appendChild(elScrollY);

        if(parentNode) {
            parentNode.appendChild(el);
        }
        this.el = el;

        //绑定一些基础事件
        el.addEventListener('input', e => {
            //data-txt
            if(e.target.classList.contains('data-txt')) {
                this.setData(
                    e.target.data.rowIndex + this.viewX,
                    e.target.data.colIndex + this.viewY,
                    e.target.value
                );
            }
        });
        document.body.addEventListener('keydown', e => {
            if([13, 37, 38, 39, 40].includes(e.keyCode)) {
                if(this.selected.length == 1) {
                    let x = this.selected[0][0],
                        y = this.selected[0][1];
                    switch (e.keyCode) {
                        case 38:
                            if(x > 0) {
                                this.setFocus(x - 1, y);
                            }
                            break;
                        case 13:
                        case 40:
                            if(x < this.viewData.length - 1) {
                                this.setFocus(x + 1, y);
                            }
                            break;
                        case 37:
                            if(y > 0) {
                                this.setFocus(x, y - 1);
                            }
                            break;
                        case 39:
                            if(y < this.viewData[0].length - 1) {
                                this.setFocus(x, y + 1);
                            }
                            break;
                        default:
                            break;
                    }
                }
            } else if(this.selected.length > 0) {
                this.active = this.selected[0];
                this.refreshSelected();
                //this.setData(this.selected[0][0], this.selected[0][1], this.viewData[this.selected[0][0]][this.selected[0][1]] + e.key);
                // this.viewText[this.selected[0][0]][this.selected[0][1]].el.onkeypress(e);
            }
        })
        //鼠标拖拽框选
        el.addEventListener('mousedown', e => {
            if(!e.target || !e.target.data) {
                return;
            }
            if(e.target.data.headertype) {
                if(e.target.data.headertype === 'left') {
                    //行状态下判断取消
                    if(e.buttons !== 1 && (e.target.data.index > this.selectedArea.maxx || e.target.data.index < this.selectedArea.minx)) {
                        return;
                    }
                    this.selectedArea.type = 'row';
                    this.selectedArea.x = e.target.data.index;
                    this.selectedArea.x2 = e.target.data.index;
                    this.selected = Array(this.viewText[0].length).fill(null).map((i, index) => ([e.target.data.index - 1, index]));
                } else if(e.target.data.headertype === 'top') {
                    //列状态下判断取消
                    if(e.buttons !== 1 && (e.target.data.index > this.selectedArea.maxy || e.target.data.index < this.selectedArea.miny)) {
                        return;
                    }
                    this.selectedArea.type = 'col';
                    this.selectedArea.y = e.target.data.index;
                    this.selectedArea.y2 = e.target.data.index;
                    this.selected = Array(this.viewText.length).fill(null).map((i, index) => ([index, e.target.data.index - 1]));
                }
            } else {
                let colIndex = e.target.data.colIndex,
                    rowIndex = e.target.data.rowIndex;
                //单元格状态下判断取消
                if(e.buttons !== 1 && this.selected.filter(([x, y]) => x === rowIndex && y === colIndex).length > 0) {
                    return;
                }
                this.selectedArea.type = 'cell';
                if(e.target.data.rowIndex >= this.freezeArea.top) {
                    rowIndex += this.viewX;
                }
                if(e.target.data.colIndex >= this.freezeArea.left) {
                    colIndex += this.viewY;
                }
                this.selectedArea.x = rowIndex;
                this.selectedArea.y = colIndex;
                this.selectedArea.x2 = rowIndex;
                this.selectedArea.y2 = colIndex;

                let tdIndex = this.selected.findIndex(([x, y]) => x === rowIndex && y === colIndex);
                if(tdIndex >= 0 && this.selected.length === 1) {
                    this.selected = [[rowIndex, colIndex]];
                    this.active = [rowIndex, colIndex];
                    this.selectedArea.isStart = false;
                } else {
                    this.selected = [[rowIndex, e.target.data.colIndex]];
                    this.active = [];
                }
            }
            this.selectedArea.isStart = true;
            this.refreshSelected();
            this.header.top.refresh();
            this.header.left.refresh();
        });

        //节流参数
        el.addEventListener('mousemove', e => {
            if(this.selectedArea.isStart === true) {
                if(!e.target || !e.target.data) {
                    return;
                }
                //验证和点击的选择类型是否相同
                if(e.target.data.headertype) {
                    if(e.target.data.headertype === 'left') if(this.selectedArea.type !== 'row') return;
                    else if(e.target.data.headertype === 'top') if(this.selectedArea.type !== 'col') return;
                } else if(this.selectedArea.type !== 'cell') return;

                if(e.target.data.headertype) {
                    if(e.target.data.headertype === 'left') {
                        this.selectedArea.x2 = e.target.data.index;
                        this.selected = [].concat.apply([], Array(this.viewText[0].length).fill(null).map((i, index) => {
                            return (Array(this.selectedArea.maxx - this.selectedArea.minx + 1).fill(null).map((o, oIndex) => ([oIndex + this.selectedArea.minx - 1, index])))
                        }))
                    } else if(e.target.data.headertype === 'top') {
                        this.selectedArea.y2 = e.target.data.index;
                        this.selected = [].concat.apply([], Array(this.viewText.length).fill(null).map((i, index) => {
                            return (Array(this.selectedArea.maxy - this.selectedArea.miny + 1).fill(null).map((o, oIndex) => ([index, oIndex + this.selectedArea.miny - 1])))
                        }))
                    }
                } else {
                    let colIndex = e.target.data.colIndex,
                        rowIndex = e.target.data.rowIndex;
                    if(e.target.data.rowIndex >= this.freezeArea.top) {
                        rowIndex += this.viewX;
                    }
                    if(e.target.data.colIndex >= this.freezeArea.left) {
                        colIndex += this.viewY;
                    }

                    if(e.target.data && e.target.data.rowIndex != undefined) {
                        this.selectedArea.x2 = rowIndex;
                        this.selectedArea.y2 = colIndex;
                        this.selected = [];
                        for (let x = this.selectedArea.minx; x <= this.selectedArea.maxx; x++) {
                            for (let y = this.selectedArea.miny; y <= this.selectedArea.maxy; y++) {
                                this.selected.push([x, y]);
                            }
                        }
                    } else {
                    }
                }

                this.refreshSelected();
                this.header.top.refresh();
                this.header.left.refresh();
            }
        });
        document.body.addEventListener('mouseup', e => {
            this.selectedArea.isStart = false;
        });
        //滚轮滚动
        el.addEventListener('wheel', e => {
            if(e.deltaY > 0) {
                this.viewX += 3;
            } else if(e.deltaY < 0) {
                this.viewX -= 3;
            } else if(e.deltaX > 0) {
                this.viewY += 3;
            } else if(e.deltaX < 0) {
                this.viewY -= 3;
            }
            for (let x = 0; x < this.viewText.length; x++) {
                for (let y = 0; y < this.viewText[x].length; y++) {
                    let _x = x, _y = y;
                    if(x < this.freezeArea.top) {

                    } else {
                        _x += this.viewX;
                    }
                    if(y < this.freezeArea.left) {

                    } else {
                        _y += this.viewY;
                    }
                    if(this.viewData[_x] && this.viewData[_x][_y]) {
                        this.viewText[x][y].el.innerHTML = this.viewData[_x][_y];
                    } else {
                        this.viewText[x][y].el.innerHTML = "";
                    }
                }
            }
            this.refreshSelected();
            this.refreshMerge();
            this.header.top.refresh();
            this.header.left.refresh();
        });

        this.refreshMerge();
        return el;
    };

    /**
     * 初始化
     */
    (() => {
        _colWidth = new Array(this.rowNum).fill(_cellDefaultWidth);
        _rowHeight = new Array(this.colNum).fill(_cellDefaultHeight);
        this.viewText = new Array(this.rowNum).fill(null).map(i => []).map(i => new Array(this.colNum).fill('').map(i => []));
    })();

    if(pNode) {
        this.el = this.render(pNode);
        if(config.onInit) {
            config.onInit.call(this.el);
        }
    }
}

console.time('页面加载');

let spread = new Spread();
spreadEl = spread.render(document.body);

let menu = new ContextMenu({
    menus: [
        {
            text: '复制',
            key: 'ctrl+c',
            onInit(e) {

            },
            onClick(e) {

            }
        }, {
            text: '合并单元格',
            key: 'ctrl+m',
            onInit(e) {
                return {
                    hidden: spread.selected.length <= 1 || spread.selectedArea.type !== 'cell'
                }
            },
            onClick(e) { 
                console.log('当前合并的单元格', 
                    spread.selectedArea.minx,
                    spread.selectedArea.miny,
                    spread.selectedArea.maxx - spread.selectedArea.minx + 1,
                    spread.selectedArea.maxy - spread.selectedArea.miny + 1
                );
                spread.setMerge(
                    spread.selectedArea.minx,
                    spread.selectedArea.miny,
                    spread.selectedArea.maxx - spread.selectedArea.minx + 1,
                    spread.selectedArea.maxy - spread.selectedArea.miny + 1
                );
            }
        }, {
            text: '拆分单元格',
            key: 'ctrl+m',
            onInit(e) {
                return {
                    hidden: true
                }
            },
            onClick(e) { 
                if(e && e.data) {
                    console.log(e);
                }
            }
        }
    ]
}, spreadEl);

window.spread = spread;
spreadEl.classList.add('init');
setTimeout(() => {
    spreadEl.classList.add('animeinit');
}, 200);

document.oncontextmenu = function(ev) {
    return false;    //屏蔽右键菜单
}

console.timeEnd('页面加载');