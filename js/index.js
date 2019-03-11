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

    this.render = function(parentNode) {
        let el = document.createElement("li");
        this.setIndex.call(el, config.index);
        if(parentNode) {
            parentNode.appendChild(el);
        }
        return el;
    }

    //设置展示下标
    this.setIndex = function(index) {
        (this.el || this).innerHTML = config.type === 'top' ? numToString(index) : index;
    }

    //更新状态
    this.refresh = function() {
        let headIndex = config.spread.selected.findIndex(([x, y]) => config.type === 'left' ? x === config.index - 1 : y === config.index - 1);
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
            if(config.type === 'top') {
                if(index < config.spread.freezeArea.left) {
                    i.setIndex(index + 1);
                } else {
                    i.setIndex(startIndex + index + 1);
                }
            } else if(config.type === 'left') {
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
        el.setAttribute('type', config.type);
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

    //输入事件
    // this.onInput = function(event) {
    //     config.spread.setData(
    //         config.rowIndex,
    //         config.colIndex,
    //         event.target.value
    //     );
    // };

    this.isEdit = false;

    //按键事件
    this.onKeyPress = function(event) {
        config.spread.inputKeyPress(
            config.rowIndex,
            config.colIndex,
            event
        );
    }

    this.onFocus = function() {
        // if(config.spread.active[0] !== config.rowIndex || config.spread.active[1] !== config.colIndex) {
        //     // this.isEdit = true;
        //     let _pnode = this.el.parentNode;
        //     _pnode.classList.add('focus');
        //     _pnode.removeChild(this.el);
        //     _pnode.appendChild(this.render(_pnode));
        //     this.el.value = config.spread.viewData[config.rowIndex][config.colIndex];
        //     this.el.focus();
        // }
    }

    this.onBlur = function() {
        // if(config.spread.active[0] === config.rowIndex && config.spread.active[1] === config.colIndex) {
        //     this.isEdit = false;
        //     let _pnode = this.el.parentNode;
        //     _pnode.classList.remove('focus');
        //     _pnode.removeChild(this.el);
        //     _pnode.appendChild(this.render(_pnode));
        //     this.el.innerHTML = config.spread.viewData[config.rowIndex][config.colIndex].replace(/\n/g, '<br />');
        // }
    }

    /**
     * 鼠标按下选中单元格
     */
    // this.onMouseDown = function(e) {
    //     let tdIndex = config.spread.selected.findIndex(([x, y]) => x === config.rowIndex && y === config.colIndex);
    //     if(tdIndex >= 0) {
    //         config.spread.active = [config.rowIndex, config.colIndex];
    //     } else {
    //         config.spread.selected = [[config.rowIndex, config.colIndex]];
    //         config.spread.active = [];
    //     }
    //     config.spread.refreshSelected();
    //     config.spread.header.top.refresh();
    //     config.spread.header.left.refresh();
    // }

    /**
     * 鼠标松开单元格
     */
    this.onMouseUp = function() {
    }

    this.refresh = function() {
        //活动单元格
        if(config.spread.active[0] === config.rowIndex && config.spread.active[1] === config.colIndex) {
            this.el.parentNode.classList.add('focus');
            if(this.isEdit === false) {
                let _pnode = this.el.parentNode;
                _pnode.removeChild(this.el);
                _pnode.appendChild(this.render(_pnode));
                this.el.value = config.spread.viewData[config.rowIndex][config.colIndex];
                setTimeout(() => this.el.focus(), 1);
                this.isEdit = true;
            }
        } else {
            this.el.parentNode.classList.remove('focus');
            if(this.isEdit === true) {
                let _pnode = this.el.parentNode;
                _pnode.removeChild(this.el);
                _pnode.appendChild(this.render(_pnode));
                this.el.innerHTML = config.spread.viewData[config.rowIndex][config.colIndex];
                this.el.focus();
                this.isEdit = false;
            }
            //选中单元格
            let td = config.spread.selected.find(([x, y]) => x === config.rowIndex && y === config.colIndex);
            if(td) {
                this.el.parentNode.classList.add('selected');
            } else {
                this.el.parentNode.classList.remove('selected');
            }
        }
        
        //设置当前范围
        if (config.rowIndex == config.spread.selectedArea.minx && 
            config.colIndex >= config.spread.selectedArea.miny && 
            config.colIndex <= config.spread.selectedArea.maxy) {
            this.el.parentNode.classList.add('selected-area-top');
        } else this.el.parentNode.classList.remove('selected-area-top');
        if (config.rowIndex == config.spread.selectedArea.maxx && 
            config.colIndex >= config.spread.selectedArea.miny && 
            config.colIndex <= config.spread.selectedArea.maxy) {
            this.el.parentNode.classList.add('selected-area-bottom');
        } else this.el.parentNode.classList.remove('selected-area-bottom');
        
        if (config.colIndex == config.spread.selectedArea.miny && 
            config.rowIndex >= config.spread.selectedArea.minx && 
            config.rowIndex <= config.spread.selectedArea.maxx) {
            this.el.parentNode.classList.add('selected-area-left');
        } else this.el.parentNode.classList.remove('selected-area-left');
        if (config.colIndex == config.spread.selectedArea.maxy && 
            config.rowIndex >= config.spread.selectedArea.minx && 
            config.rowIndex <= config.spread.selectedArea.maxx) {
            this.el.parentNode.classList.add('selected-area-right');
        } else this.el.parentNode.classList.remove('selected-area-right');
    }

    this.render = function(parentNode) {
        let el = null;

        if(config.spread.active[0] === config.rowIndex && config.spread.active[1] === config.colIndex) {
            el = document.createElement("textarea");
            el.type = "text";
            el.classList.add("data-txt-input");
        } else {
            el = document.createElement("span");
            // el.onmousedown = this.onMouseDown.bind(this);
            el.onmouseup = this.onMouseUp.bind(this);
            // el.setAttribute('tabindex', '-1');
        }

        el.classList.add("data-txt");
        el.freeze = config.freeze;
        el.style.width = config.spread.getColWidth(config.colIndex) + 'px';
        el.style.height = config.spread.getRowHeight(config.rowIndex) + 'px';
        el.data = config;
        // el.onfocus = this.onFocus.bind(this);
        // el.onblur = this.onBlur.bind(this);
        // el.oninput = this.onInput;
        el.onkeydown = this.onKeyPress;
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

    this.onClick = function() {
        let td = config.spread.selected.find(([x, y]) => x === config.rowIndex && y === config.colIndex);
        if(td) {
            this.el.classList.add('focus');
        } else {
            this.el.classList.remove('focus');
        }
    }

    this.render = function(parentNode) {
        let el = document.createElement("td");
        el.data = config;
        //el.onclick = this.onClick;
        if(config.colIndex === config.spread.freezeArea.left) {
            el.classList.add('cell-freeze-left');
        }
        if(config.rowIndex === config.spread.freezeArea.top) {
            el.classList.add('cell-freeze-top');
        }
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
            set(value) {
                if(value < 0) value = 0;
                this.header.left.setStartIndex(value);
                _viewX = value;
            },
            get() {
                return _viewX;
            }
        },
        viewY: {
            set(value) {
                if(value < 0) value = 0;
                this.header.top.setStartIndex(value);
                _viewY = value;
            },
            get() {
                return _viewY;
            }
        }
    })
    /**
     * 行数
     */
    this.rowNum = 38;
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
    this.viewData = [];
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
        minx: 0,
        miny: 0,
        maxx: 0,
        maxy: 0,
        isStart: false,
        isActive: false
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
     * 顶部与左侧头部区域
     */
    this.header = {
        top: null,
        left: null
    }

    //设置值
    this.setData = function(x, y, value) {
        this.viewData[x][y] = value;
        this.viewText[x][y].el.value = value;
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
        this.selected = [[x, y]];
        this.selectedArea.x = x;
        this.selectedArea.y = y;
        this.selectedArea.x2 = x;
        this.selectedArea.y2 = y;
        this.selectedArea.minx = x;
        this.selectedArea.miny = y;
        this.selectedArea.maxx = x;
        this.selectedArea.maxy = y;
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

    //区域滚动
    this.scroll = function(e) {
        // this.panels.left.scrollTop = e.target.scrollTop;
        // this.header.el.parentNode.left.scrollTop = e.target.scrollTop;
        // // this.panels.right.scrollTop = e.target.scrollTop;
        // this.panels.top.scrollLeft = e.target.scrollLeft;
        // this.header.el.parentNode.top.scrollLeft = e.target.scrollLeft;
    }

    this.render = function(parentNode) {
        let el = document.createElement("div");
        el.classList.add('haku-spreadsheet');
        el.data = config;

        //构造左侧头部
        let headerbodyleft = document.createElement("div");
        headerbodyleft.classList.add('header-body-left');
        let leftHeader = new HeaderList({
            ...config,
            spread: this,
            type: 'left',
            count: this.rowNum,
            onInit() {
                this.classList.add('header-list-left');
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
            type: 'top',
            count: this.colNum,
            onInit() {
                this.classList.add('header-list-top');
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
        fixedMain.onscroll = this.scroll.bind(this);

        //表格：上
        // let fixedTop = document.createElement("div");
        // this.panels.top = fixedTop;
        // fixedTop.classList.add('haku-spreadsheet-fixed-top');
        // let tableTop = new Table({
        //     ...config,
        //     spread: this,
        //     freeze: 'top',
        //     rowNum: this.rowNum,
        //     colNum: this.colNum,
        //     onInit() {
        //         this.classList.add('haku-table', 'haku-table-fixed-top');
        //     }
        // }, fixedTop);
        // el.appendChild(fixedTop);

        //表格：左
        // let fixedLeft = document.createElement("div");
        // this.panels.left = fixedLeft;
        // fixedLeft.classList.add('haku-spreadsheet-fixed-left');
        // let tableLeft = new Table({
        //     ...config,
        //     spread: this,
        //     freeze: 'left',
        //     rowNum: this.rowNum,
        //     colNum: this.colNum,
        //     onInit() {
        //         this.classList.add('haku-table', 'haku-table-fixed-left');
        //     }
        // }, fixedLeft);
        // el.appendChild(fixedLeft);

        // let fixedBottom = document.createElement("div");
        // this.panels.bottom = fixedBottom;
        // fixedBottom.classList.add('haku-spreadsheet-fixed-bottom');
        // let tableBottom = new Table({
        //     ...config,
        //     spread: this,
        //     rowNum: this.rowNum,
        //     colNum: this.colNum
        // }).render();
        // tableBottom.classList.add('haku-table', 'haku-table-fixed-bottom');
        // fixedBottom.appendChild(tableBottom);
        // el.appendChild(fixedBottom);

        //表格：右
        // let fixedRight = document.createElement("div");
        // this.panels.right = fixedRight;
        // fixedRight.classList.add('haku-spreadsheet-fixed-right');
        // let tableRight = new Table({
        //     ...config,
        //     spread: this,
        //     rowNum: this.rowNum,
        //     colNum: this.colNum
        // }).render();
        // tableRight.classList.add('haku-table', 'haku-table-fixed-right');
        // fixedRight.appendChild(tableRight);

        // // let fixedRightBody = document.createElement("div");
        // // fixedRightBody.classList.add('haku-spreadsheet-fixed-right-body');
        // // fixedRightBody.appendChild(tableRight);
        // fixedRight.appendChild(tableRight);
        // el.appendChild(fixedRight);

        //表格：左上
        // let fixedTopLeft = document.createElement("div");
        // this.panels.topleft = fixedTopLeft;
        // fixedTopLeft.classList.add('haku-spreadsheet-fixed-top-left');
        // let tableTopLeft = new Table({
        //     ...config,
        //     spread: this,
        //     freeze: 'topleft',
        //     rowNum: this.rowNum,
        //     colNum: this.colNum,
        //     onInit() {
        //         this.classList.add('haku-table', 'haku-table-fixed-top-left');
        //     }
        // }, fixedTopLeft);
        // el.appendChild(fixedTopLeft);

        //表格：右上
        // let fixedTopRight = document.createElement("div");
        // this.panels.topright = fixedTopRight;
        // fixedTopRight.classList.add('haku-spreadsheet-fixed-top-right');
        // let tableTopRight = new Table({
        //     ...config,
        //     spread: this,
        //     freeze: 'topright',
        //     rowNum: this.rowNum,
        //     colNum: this.colNum
        // }).render();
        // tableTopRight.classList.add('haku-table', 'haku-table-fixed-top-right');
        // fixedTopRight.appendChild(tableTopRight);
        // el.appendChild(fixedTopRight);

        // //左侧头部
        // let elHeadLeft = document.createElement("div");
        // elHeadLeft.classList.add('haku-header', 'haku-header-left');
        // let elHeaderBodyLeft = document.createElement("div");
        // elHeaderBodyLeft.classList.add('haku-header-body');
        // //elHeaderBodyLeft
        // elHeadLeft.appendChild(elHeaderBodyLeft);
        // el.appendChild(elHeadLeft);

        // //顶部头部
        // let elHeadTop = document.createElement("div");
        // elHeadTop.classList.add('haku-header', 'haku-header-top');
        // let elHeaderBodyTop = document.createElement("div");
        // elHeaderBodyTop.classList.add('haku-header-body');
        // elHeadTop.appendChild(elHeaderBodyTop);
        // el.appendChild(elHeadTop);


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
                    e.target.data.rowIndex,
                    e.target.data.colIndex,
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
            this.selectedArea.isStart = true;
            this.selectedArea.x = e.target.data.rowIndex;
            this.selectedArea.y = e.target.data.colIndex;
            this.selectedArea.x2 = e.target.data.rowIndex;
            this.selectedArea.y2 = e.target.data.colIndex;
            this.selectedArea.minx = e.target.data.rowIndex,
            this.selectedArea.miny = e.target.data.colIndex,
            this.selectedArea.maxx = e.target.data.rowIndex,
            this.selectedArea.maxy = e.target.data.colIndex;
            
            let tdIndex = this.selected.findIndex(([x, y]) => x === e.target.data.rowIndex && y === e.target.data.colIndex);
            if(tdIndex >= 0) {
                this.selected = [[e.target.data.rowIndex, e.target.data.colIndex]];
                this.active = [e.target.data.rowIndex, e.target.data.colIndex];
                this.selectedArea.isStart = false;
            } else {
                this.selected = [[e.target.data.rowIndex, e.target.data.colIndex]];
                this.active = [];
            }
            this.refreshSelected();
            this.header.top.refresh();
            this.header.left.refresh();
        });
        el.addEventListener('mousemove', e => {
            if(this.selectedArea.isStart === true) {
                this.selectedArea.x2 = e.target.data.rowIndex;
                this.selectedArea.y2 = e.target.data.colIndex;

                this.selectedArea.minx = Math.min(this.selectedArea.x, this.selectedArea.x2),
                this.selectedArea.miny = Math.min(this.selectedArea.y, this.selectedArea.y2),
                this.selectedArea.maxx = Math.max(this.selectedArea.x, this.selectedArea.x2),
                this.selectedArea.maxy = Math.max(this.selectedArea.y, this.selectedArea.y2);
                this.selected = [];
                for (let x = this.selectedArea.minx; x <= this.selectedArea.maxx; x++) {
                    for (let y = this.selectedArea.miny; y <= this.selectedArea.maxy; y++) {
                        this.selected.push([x, y]);
                    }
                }
                this.refreshSelected();
                this.header.top.refresh();
                this.header.left.refresh();
            }
        });
        el.addEventListener('mouseup', e => {
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
        });

        return el;
    };

    /**
     * 初始化
     */
    (() => {
        _colWidth = new Array(this.rowNum).fill(_cellDefaultWidth);
        _rowHeight = new Array(this.colNum).fill(_cellDefaultHeight);
        this.viewData = new Array(this.rowNum).fill(null).map(i => new Array(this.colNum).fill(''));
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

window.spread = spread;
spreadEl.classList.add('init');
setTimeout(() => {
    spreadEl.classList.add('animeinit');
}, 200);

console.timeEnd('页面加载');