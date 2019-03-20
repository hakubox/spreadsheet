import { HeaderList } from './header.js'
import { Table } from './table.js'
import { Scroll } from './scroll.js'
import { global_config } from './../config.js'

/**
 * @class 表格页
 */
export function Spread(config, pNode) {
    this.el = null;
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

    /**
     * 获取列宽度
     */
    this.getColWidth = function(x) {
        return _colWidth[x] || global_config.cell_default_width;
    }

    /**
     * 获取行高度
     */
    this.getRowHeight = function(y) {
        return _rowHeight[y] || global_config.cell_default_height;
    }

    Object.defineProperties(this, {
        /**
         * 当前头部的X坐标
         */
        viewX: {
            get() {
                return _viewX;
            },
            set(value) {
                if(value < 0) value = 0;
                else if(value > this.maxRowCount - this.minRowCount) {
                    value = this.maxRowCount - this.minRowCount;
                }
                this.header.left.setStartIndex(value);
                _viewX = value;
            }
        },
        /**
         * 当前左侧头部的Y坐标
         */
        viewY: {
            get() {
                return _viewY;
            },
            set(value) {
                if(value < 0) value = 0;
                else if(value > this.maxColCount - this.minColCount) {
                    value = this.maxColCount - this.minColCount;
                }
                this.header.top.setStartIndex(value);
                _viewY = value;
            }
        },
        /**
         * 最小行数（根据页面大小判断）
         */
        minRowCount: {
            get() {
                let _count = 0, _height = 0;
                while(_height <= window.innerHeight) {
                    _height += this.getRowHeight(_count);
                    _count++;
                }
                return _count;
            }
        },
        /**
         * 最大行数
         */
        maxRowCount: {
            get() {
                return Math.max(this.viewData.length, 40);
            }
        },
        /**
         * 最小列数（根据页面大小判断）
         */
        minColCount: {
            get() {
                let _count = 0, _width = 0;
                while(_width <= window.innerWidth) {
                    _width += this.getColWidth(_count);
                    _count++;
                }
                return _count;
            }
        },
        /**
         * 最大列数
         */
        maxColCount: {
            get() {
                return Math.max(Math.max.apply(0, this.viewData.filter(i => i).map(i => i.length)), 20);
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
    this.viewCell = [];
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
        set minx(value) {
            if(this.x <= this.x2) {
                this.x2 = value;
            } else {
                this.x = value;
            }
        },
        get miny() {
            return Math.min(this.y, this.y2)
        },
        set miny(value) {
            if(this.y <= this.y2) {
                this.y2 = value;
            } else {
                this.y = value;
            }
        },
        get maxx() {
            return Math.max(this.x, this.x2)
        },
        set maxx(value) {
            if(this.x <= this.x2) {
                this.x = value;
            } else {
                this.x2 = value;
            }
        },
        get maxy() {
            return Math.max(this.y, this.y2)
        },
        set maxy(value) {
            if(this.y <= this.y2) {
                this.y = value;
            } else {
                this.y2 = value;
            }
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
        [3, 3, 2, 4]
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
    };
    /**
     * 滚动条
     */
    this.scroll = {
        /**
         * 纵向滚动条
         */
        vertical: null,
        /**
         * 横向滚动条
         */
        horizontal: null,
        location: 0,
        location2: 0,
        isStart: false,
    };
    /**
     * 拖拽
     */
    this.dragger = {
        el: null,
        isStart: false,
        x: 0,
        y: 0,
        x2: 0,
        y2: 0
    };
    this.setDraggerArea = function({top, left, width, height}) {
        if(this.dragger.isStart) {
            this.dragger.el.style.display = 'block';
            if(width) this.dragger.el.style.width = width + 'px';
            if(height) this.dragger.el.style.height = height + 'px';

            if(left && top) this.dragger.el.style.transform = 'translate(' + left + 'px,' + top + 'px)';
        } else {
            this.dragger.el.style.display = 'none';
        }
    };
    this.table = null;

    //设置值
    this.setData = function(x, y, value = '') {
        if(!this.viewData[x]) {
            this.viewData[x] = [];
        }
        this.viewData[x][y] = value;
        this.viewCell[x - this.viewX][y - this.viewY].el.value = value;
    }

    //获取值
    this.getData = function(x, y) {
        if(!this.viewData[x] || this.viewData[x][y] === undefined) {
            return '';
        }
        return this.viewData[x][y];
    }

    /**
     * 设置列宽度
     */
    this.setColWidth = function(colIndex, width) {
        _colWidth[colIndex] = width;
        spread.viewCell.map((i, index) => i[colIndex]).forEach(i => i.el.style.width = width + 'px');
    }

    this.setRowHeight = function(rowIndex, height) {
        _rowHeight[rowIndex] = height;
        spread.viewCell[rowIndex].forEach(i => i.forEach(item => item.el.style.height = height + 'px'));
    }

    //设置当前焦点单元格
    this.setFocus = function(x, y) {
        this.active = [];
        this.selected = [[x, y]];
        this.selectedArea.x = x;
        this.selectedArea.y = y;
        this.selectedArea.x2 = x;
        this.selectedArea.y2 = y;
        //spread.viewCell[x][y].el.click();

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
        this.viewCell.forEach(row => row.forEach(cell => cell.refresh()));
    }

    /**
     * 重绘合并状态
     */
    this.refreshMerge = function() {
        this.viewCell.forEach(row => row.forEach(cell => cell.refreshMerge()));
    }

    /**
     * 根据坐标点获取真实坐标
     */
    this.getCellPoint = function(x, y) {

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

        //拖拽区域框
        let dragArea = document.createElement("div");
        dragArea.classList.add("dragarea");
        fixedMain.appendChild(dragArea);
        this.dragger.el = dragArea;


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
        this.table = tableMain;

        fixedMain.appendChild(fixedMainBody);
        el.appendChild(fixedMain);

        let scrollVertical = new Scroll({
            type: 'vertical',
            spread: this
        }, el);
        this.scroll.vertical = scrollVertical;

        let scrollHorizontal = new Scroll({
            type: 'horizontal',
            spread: this
        }, el);
        this.scroll.horizontal = scrollHorizontal;

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
                // this.viewCell[this.selected[0][0]][this.selected[0][1]].el.onkeypress(e);
            }
        })
        //鼠标拖拽框选
        el.addEventListener('mousedown', e => {
            if(!e.target || !e.target.data) {
                return;
            }
            if(this.dragger.isStart) {
                /**
                 * 拖拽在单元格内事件处理
                 */
            } else {
                let _refreshSelect = () => {
                    this.selectedArea.isStart = true;
                    this.refreshSelected();
                    this.header.top.refresh();
                    this.header.left.refresh();
                };
                switch(e.target.data.component) {
                    case 'Cell':
                    case 'TextBox':
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
                        _refreshSelect();
                        break;

                    case 'HeaderCell':
                        if(e.target.data.headertype === 'left') {
                            //行状态下判断取消
                            if(e.buttons !== 1 && (e.target.data.index > this.selectedArea.maxx || e.target.data.index < this.selectedArea.minx)) {
                                return;
                            }
                            this.selectedArea.type = 'row';
                            this.selectedArea.x = e.target.data.index;
                            this.selectedArea.x2 = e.target.data.index;
                            this.selected = Array(this.viewCell[0].length).fill(null).map((i, index) => ([e.target.data.index - 1, index]));
                        } else if(e.target.data.headertype === 'top') {
                            //列状态下判断取消
                            if(e.buttons !== 1 && (e.target.data.index > this.selectedArea.maxy || e.target.data.index < this.selectedArea.miny)) {
                                return;
                            }
                            this.selectedArea.type = 'col';
                            this.selectedArea.y = e.target.data.index;
                            this.selectedArea.y2 = e.target.data.index;
                            this.selected = Array(this.viewCell.length).fill(null).map((i, index) => ([index, e.target.data.index - 1]));
                        }
                        _refreshSelect();
                        break;

                    case 'ScrollBar':
                        if(e.target.data.type == 'vertical') {
                            this.scroll.location = e.clientY - this.scroll.vertical.el.offsetTop - this.scroll.vertical.value;
                            this.scroll.type = 'vertical';
                        } else if (e.target.data.type == 'horizontal') {
                            this.scroll.location = e.clientX - this.scroll.horizontal.el.offsetLeft - this.scroll.horizontal.value;
                            this.scroll.type = 'horizontal';
                        }
                        // console.log(e);
                        this.scroll.isStart = true;
                        break;
                }
            }

            // console.log(e.target.data.component);
        });

        document.body.addEventListener('mousemove', e => {
            //开始选择区域
            if(this.selectedArea.isStart === true) {
                if(!e.target || !e.target.data) {
                    return;
                }
                //验证和鼠标按下的选择类型是否相同
                if(e.target.data.headertype) {
                    if(e.target.data.headertype === 'left') if(this.selectedArea.type !== 'row') return;
                    else if(e.target.data.headertype === 'top') if(this.selectedArea.type !== 'col') return;
                } else if(this.selectedArea.type !== 'cell') return;

                if(e.target.data.headertype) {
                    if(e.target.data.headertype === 'left') {
                        this.selectedArea.x2 = e.target.data.index;
                        this.selected = [].concat.apply([], Array(this.viewCell[0].length).fill(null).map((i, index) => {
                            return (Array(this.selectedArea.maxx - this.selectedArea.minx + 1).fill(null).map((o, oIndex) => ([oIndex + this.selectedArea.minx - 1, index])))
                        }))
                    } else if(e.target.data.headertype === 'top') {
                        this.selectedArea.y2 = e.target.data.index;
                        this.selected = [].concat.apply([], Array(this.viewCell.length).fill(null).map((i, index) => {
                            return (Array(this.selectedArea.maxy - this.selectedArea.miny + 1).fill(null).map((o, oIndex) => ([index, oIndex + this.selectedArea.miny - 1])))
                        }))
                    }
                } else {
                    let colIndex = e.target.data.colIndex,
                        rowIndex = e.target.data.rowIndex;

                    /**
                     * 判断是否在冻结区域内
                     */
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
                                //if(!spread.areaMerge.find(([x1, y1, rowspan, colspan]) => x > x1 + rowspan && y > y1 + colspan)) {
                                    this.selected.push([x, y]);
                                //} else {
                                //}
                            }
                        }
                    } else {
                    }
                }

                //使用递归完善选择范围（针对合并单元格
                let _fn = (minx, miny, maxx, maxy) => {
                    let _minx = minx, _miny = miny, _maxx = maxx, _maxy = maxy;
                    for (let x = minx; x <= maxx; x++) {
                        for (let y = miny; y <= maxy; y++) {
                            let mergecell = spread.areaMerge.find(([x1, y1, rowspan, colspan]) =>
                                x >= x1 &&
                                x < x1 + rowspan &&
                                y >= y1 &&
                                y < y1 + colspan);
                            if(mergecell) {
                                _minx = Math.min(_minx, mergecell[0]);
                                _miny = Math.min(_miny, mergecell[1]);
                                _maxx = Math.max(_maxx, mergecell[0] + mergecell[2] - 1);
                                _maxy = Math.max(_maxy, mergecell[1] + mergecell[3] - 1);
                            }
                        }
                    }
                    if(_minx !== minx || _maxx !== maxx || _miny !== miny || _maxy !== maxy) {
                        _fn(_minx, _miny, _maxx, _maxy);
                    } else {
                        if(this.selectedArea.x <= this.selectedArea.x2) {
                            this.selectedArea.x = _minx;
                            this.selectedArea.x2 = _maxx;
                        } else {
                            this.selectedArea.x = _maxx;
                            this.selectedArea.x2 = _minx;
                        }
                        if(this.selectedArea.y <= this.selectedArea.y2) {
                            this.selectedArea.y = _miny;
                            this.selectedArea.y2 = _maxy;
                        } else {
                            this.selectedArea.y = _maxy;
                            this.selectedArea.y2 = _miny;
                        }
                    }
                };
                _fn(this.selectedArea.minx,
                    this.selectedArea.miny,
                    this.selectedArea.maxx,
                    this.selectedArea.maxy);

                this.refreshSelected();
                this.header.top.refresh();
                this.header.left.refresh();
            }
            //开始拖拽区域
            else if(this.dragger.isStart === true) {
                if(!e.target || !e.target.data) {
                    return;
                }
                let colIndex = e.target.data.colIndex,
                    rowIndex = e.target.data.rowIndex;

                this.dragger.x2 = rowIndex;
                this.dragger.y2 = colIndex;

                this.refreshSelected();
                this.header.top.refresh();
                this.header.left.refresh();
            }
            //开始滚动滚动条
            else if(this.scroll.isStart) {
                if(this.scroll.type == 'vertical') {
                    this.viewX = parseInt((e.pageY - this.scroll.vertical.el.offsetTop - this.scroll.location) / this.scroll.vertical.el.offsetHeight * this.maxRowCount);// - this.minRowCount
                    this.scroll.vertical.refreshLocation();
                } else if (this.scroll.type == 'horizontal') {
                    this.viewY = parseInt((e.pageX - this.scroll.horizontal.el.offsetLeft - this.scroll.location) / this.scroll.horizontal.el.offsetWidth * this.maxColCount);// - this.minRowCount
                    this.scroll.horizontal.refreshLocation();
                }
            }
        });
        document.body.addEventListener('mouseup', e => {
            this.selectedArea.isStart = false;
            this.dragger.isStart = false;
            this.scroll.isStart = false;
            this.setDraggerArea({});
        });
        //滚轮滚动
        el.addEventListener('wheel', e => {
            if(e.deltaY != 0) {
                if(e.deltaY > 0) {
                    this.viewX += 3;
                } else if(e.deltaY < 0) {
                    this.viewX -= 3;
                }
                this.scroll.vertical.refreshLocation();
            }
            if(e.deltaX != 0) {
                if(e.deltaX > 0) {
                    this.viewY += 3;
                } else if(e.deltaX < 0) {
                    this.viewY -= 3;
                }
                this.scroll.horizontal.refreshLocation();
            }

            for (let x = 0; x < this.viewCell.length; x++) {
                for (let y = 0; y < this.viewCell[x].length; y++) {
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
                        this.viewCell[x][y].Content.el.innerHTML = this.viewData[_x][_y];
                    } else {
                        this.viewCell[x][y].Content.el.innerHTML = "";
                    }
                }
            }

            this.refreshSelected();
            this.refreshMerge();
            this.header.top.refresh();
            this.header.left.refresh();
        });

        window.addEventListener('resize', e => {
            this.scroll.vertical.refresh();
            this.scroll.horizontal.refresh();
            this.scroll.vertical.refreshLocation();
            this.scroll.horizontal.refreshLocation();
        })

        this.refreshSelected();
        this.refreshMerge();
        this.table.refresh();
        setTimeout(() => {
            this.scroll.vertical.refresh();
            this.scroll.horizontal.refresh();
        }, 10);
        return el;
    };

    /**
     * 初始化
     */
    (() => {
        _colWidth = new Array(this.rowNum).fill(global_config.cell_default_width);
        _rowHeight = new Array(this.colNum).fill(global_config.cell_default_height);
        this.viewCell = new Array(this.rowNum).fill(null).map(i => []).map(i => new Array(this.colNum).fill('').map(i => []));
    })();

    if(pNode) {
        this.el = this.render(pNode);
        if(config.onInit) {
            config.onInit.call(this.el);
        }
    }
}
