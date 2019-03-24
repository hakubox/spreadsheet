import tool from '../tools.js';

export function Input(config, pNode) {

    if(pNode) {
        this.el = this.render(pNode);
        if(config.onInit) {
            config.onInit.call(this.el);
        }
    }
}

export function TextBox(config, pNode) {
    this.el = null;
    // this.call(new Input(config));

    //按键事件
    this.onKeyPress = function(event) {
        config.spread.inputKeyPress(
            config.rowIndex,
            config.colIndex,
            event
        );
    }

    this.render = function(parentNode) {
        let el = null;

        if(config.spread.active[0] === config.rowIndex + config.spread.viewX && config.spread.active[1] === config.colIndex) {
            el = document.createElement("textarea");
            el.classList.add("data-txt-input");
            el.onkeydown = this.onKeyPress;
        } else {
            el = document.createElement("span");
        }

        el.classList.add("data-txt");
        el.freeze = config.freeze;
        // el.parentNode.style.width = config.spread.getColWidth(config.colIndex) + 'px';
        // el.parentNode.style.height = config.spread.getRowHeight(config.rowIndex + config.spread.viewX) + 'px';
        el.data = {
            ...config,
            component: 'TextBox'
        };

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
export function Cell(config, pNode) {
    this.el = null;
    this.data = config;
    this.isEdit = false;
    this.content = null;
    this.selected = {
        top: false,
        botom: false,
        left: false,
        right: false
    };

    this.render = function(parentNode) {
        let el = document.createElement("td");
        el.data = {
            ...config,
            component: 'Cell'
        };
        el.addEventListener('mousedown', this.onMouseDown.bind(this));
        el.addEventListener('mousemove', this.onMouseMove.bind(this));
        el.addEventListener('mouseout', this.onMouseOut.bind(this));

        if(this.data.colIndex === 0) {
            el.style.height = this.data.spread.getRowHeight(this.data.rowIndex) + 'px';
        }
        if(this.data.rowIndex === 0) {
            el.style.width = this.data.spread.getColWidth(this.data.colIndex) + 'px';
        }

        // let
        this.content = new TextBox({
            ...config,
            component: 'TextBox'
        }, el);
        config.spread.viewCell[config.rowIndex][config.colIndex] = this;

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
 * 单元格:重绘合并状态
 */
Cell.prototype.refreshMerge = function() {
    let mergeinfo = this.data.spread.areaMerge.find(([x, y, rowspan, colspan]) =>
        x === this.data.rowIndex + this.data.spread.viewX &&
        y === this.data.colIndex + this.data.spread.viewY
    );

    if(this.data.colIndex === 0) {
        this.el.style.height = this.data.spread.getRowHeight(this.data.rowIndex) + 'px';
    }
    if(this.data.rowIndex === 0) {
        this.el.style.width = this.data.spread.getColWidth(this.data.colIndex) + 'px';
    }

    if(mergeinfo) {
        // console.log(this.data.rowIndex, this.data.colIndex);
        if(this.data.rowIndex - this.data.spread.freezeArea.top > 0) {
            this.el.setAttribute('rowspan', mergeinfo[2]);
        } else {
            // this.el.setAttribute('rowspan', mergeinfo[2] + this.data.rowIndex - this.data.spread.freezeArea.top);
            this.el.setAttribute('rowspan', 1);
        }

        this.el.setAttribute('colspan', mergeinfo[3]);
    } else {
        this.el.removeAttribute('rowspan');
        this.el.removeAttribute('colspan');
    }

    let mergeheadinfo = this.data.spread.areaMerge.find(([x, y, rowspan, colspan]) =>
        x <= this.data.rowIndex + this.data.spread.viewX &&
        x + rowspan > this.data.rowIndex + this.data.spread.viewX &&
        y <= this.data.colIndex + this.data.spread.viewY &&
        y + colspan > this.data.colIndex + this.data.spread.viewY &&
        !(x === this.data.rowIndex + this.data.spread.viewX && y === this.data.colIndex + this.data.spread.viewY));
    if(mergeheadinfo) {
        //console.log(this.data.rowIndex, this.data.colIndex);
        this.el.classList.add('hidden');
    } else {
        this.el.classList.remove('hidden');
    }
}

/**
 * 单元格:重绘选中状态
 */
Cell.prototype.refresh = function() {
    let colIndex = this.data.colIndex,
        rowIndex = this.data.rowIndex,
        _class = [];
    if(this.el.classList.contains('hidden')) {
        _class.push('hidden');
    }
    if(this.data.rowIndex >= this.data.spread.freezeArea.top) {
        rowIndex += this.data.spread.viewX;
    }
    if(this.data.colIndex >= this.data.spread.freezeArea.left) {
        colIndex += this.data.spread.viewY;
    }

    if(this.data.colIndex === this.data.spread.freezeArea.left) {
        _class.push('cell-freeze-left');
    }
    if(this.data.rowIndex === this.data.spread.freezeArea.top) {
        _class.push('cell-freeze-top');
    }

    //活动单元格
    if(this.data.spread.active[0] === rowIndex && this.data.spread.active[1] === colIndex) {
        _class.push('focus');
        if(this.isEdit === false) {
            this.el.removeChild(this.content.el);
            this.el.appendChild(this.content.render(this.content.el));
            this.content.el.value = this.data.spread.getData(rowIndex, colIndex);
            setTimeout(() => this.content.el.focus(), 1);
            this.isEdit = true;
        }
    } else {
        if(this.isEdit === true) {
            this.el.removeChild(this.content.el);
            this.el.appendChild(this.content.render(this.content.el));
            this.content.el.innerHTML = this.data.spread.getData(rowIndex, colIndex);
            this.content.el.focus();
            this.isEdit = false;
        }
        //选中单元格
        let td = this.data.spread.selected.find(([x, y]) => x === rowIndex && y === colIndex);
        if(td) {
            _class.push('selected');
        }
    }

    if (this.data.spread.selectedArea.type === 'cell') {

        let mergeinfo = this.data.spread.areaMerge.find(([x, y, rowspan, colspan]) =>
            rowIndex > x && rowIndex < x + rowspan &&
            colIndex > y && colIndex < y + colspan
        );
        if(mergeinfo) {
            //console.log(mergeinfo);
        }

        if (rowIndex == this.data.spread.selectedArea.x &&
            colIndex == this.data.spread.selectedArea.y) {
            _class.push('selected-area-init');
        }

        if(this.data.spread.dragger.isStart) {
            let _topIndex = this.data.spread.dragger.x2 - this.data.spread.dragger.x + this.data.spread.selectedArea.minx,
                _leftIndex = this.data.spread.dragger.y2 - this.data.spread.dragger.y + this.data.spread.selectedArea.miny;
            // console.log(_topIndex,this.data.spread.selectedArea.rowIndex );
            if(_topIndex >= 0 && _leftIndex >= 0 &&
                !(_topIndex == this.data.spread.selectedArea.rowIndex &&
                _leftIndex == this.data.spread.selectedArea.colIndex)
            ) {
                let _top = Array(_topIndex).fill('').map((i, index) => this.data.spread.getRowHeight(index + _topIndex)).concat([0, 0]).reduce((a, b) => a + b),
                    _height = Array(this.data.spread.selectedArea.maxx + 1).slice(this.data.spread.selectedArea.minx).fill('').map((i, index) => this.data.spread.getRowHeight(index + this.data.spread.selectedArea.minx)).concat([0, 0]).reduce((a, b) => a + b),
                    _left = Array(_leftIndex).fill('').map((i, index) => this.data.spread.getColWidth(index + _leftIndex)).concat([0, 0]).reduce((a, b) => a + b),
                    _width = Array(this.data.spread.selectedArea.maxy + 1).slice(this.data.spread.selectedArea.miny).fill('').map((i, index) => this.data.spread.getColWidth(index + this.data.spread.selectedArea.miny)).concat([0, 0]).reduce((a, b) => a + b);
                // console.log(_top, _height, _left, _width);
                this.data.spread.setDraggerArea({
                    top: _top,
                    left: _left,
                    width: _width,
                    height: _height,
                    rowIndex: _topIndex,
                    colIndex: _leftIndex
                });
            }
        }

        //设置当前范围
        if (rowIndex == this.data.spread.selectedArea.minx &&
            colIndex >= this.data.spread.selectedArea.miny &&
            colIndex <= this.data.spread.selectedArea.maxy) {
            _class.push('selected-area-top');
            this.selected.top = true;
        } else {
            this.selected.top = false;
        }
        if (rowIndex == this.data.spread.selectedArea.maxx &&
            colIndex >= this.data.spread.selectedArea.miny &&
            colIndex <= this.data.spread.selectedArea.maxy) {
            _class.push('selected-area-bottom');
            this.selected.bottom = true;
        } else {
            this.selected.bottom = false;
        }
        if (colIndex == this.data.spread.selectedArea.miny &&
            rowIndex >= this.data.spread.selectedArea.minx &&
            rowIndex <= this.data.spread.selectedArea.maxx) {
            _class.push('selected-area-left');
            this.selected.left = true;
        } else {
            this.selected.left = false;
        }
        if (colIndex == this.data.spread.selectedArea.maxy &&
            rowIndex >= this.data.spread.selectedArea.minx &&
            rowIndex <= this.data.spread.selectedArea.maxx) {
            _class.push('selected-area-right');
            this.selected.right = true;
        } else {
            this.selected.right = false;
        }

    } else if (this.data.spread.selectedArea.type === 'row') {

        if (rowIndex == this.data.spread.selectedArea.x - 1 && colIndex == 0) {
            _class.push('selected-area-init');
        }

        //设置当前范围
        // if (rowIndex == this.data.spread.selectedArea.minx - 1) {
        //     _class.push('selected-area-top');
        // }
        // if (rowIndex == this.data.spread.selectedArea.maxx - 1) {
        //     _class.push('selected-area-bottom');
        // }

    } else if (this.data.spread.selectedArea.type === 'col') {
        if (rowIndex == 0 && colIndex == this.data.spread.selectedArea.y - 1) {
            _class.push('selected-area-init');
        }

        //设置当前范围
        // if (colIndex == this.data.spread.selectedArea.miny - 1) {
        //     _class.push('selected-area-left');
        // }
        // if (colIndex == this.data.spread.selectedArea.maxy - 1) {
        //     _class.push('selected-area-right');
        // }
    }

    let _className = _class.join(' '),
        _oldClassName = this.el.className;
    if(_className !== _oldClassName && (_className != '' || _oldClassName !== '')) {
        this.el.className = _className;
    }
}

Cell.prototype.onMouseDown = function(e) {
    if ((e.offsetY < 5 && this.selected.top) ||
        (e.offsetY > e.target.offsetHeight - 5 && this.data.spread.viewCell[this.data.rowIndex + 1][this.data.colIndex].selected.top) ||
        (e.offsetY > e.target.offsetHeight - 5 && this.selected.bottom) ||
        (e.offsetY < 5 && this.data.spread.viewCell[this.data.rowIndex - 1][this.data.colIndex].selected.bottom) ||
        (e.offsetX < 5 && this.selected.left) ||
        (e.offsetX > e.target.offsetWidth - 5 && this.data.spread.viewCell[this.data.rowIndex][this.data.colIndex + 1].selected.left) ||
        (e.offsetX > e.target.offsetWidth - 5 && this.selected.right) ||
        (e.offsetX < 5 && this.data.spread.viewCell[this.data.rowIndex][this.data.colIndex - 1].selected.right)
    ) {
        this.data.spread.dragger.isStart = true;
        this.data.spread.dragger.x = e.target.data.rowIndex;
        this.data.spread.dragger.y = e.target.data.colIndex;
        this.data.spread.dragger.x2 = this.data.spread.dragger.x;
        this.data.spread.dragger.y2 = this.data.spread.dragger.y;
        this.data.spread.dragger.rowIndex = e.target.data.rowIndex;
        this.data.spread.dragger.colIndex = e.target.data.colIndex;
    } else {
        this.data.spread.dragger.isStart = false;
    }
}

Cell.prototype.onMouseMove = function(e) {
    try {
        if ((e.offsetY < 5 && this.selected.top) ||
            (e.offsetY > e.target.offsetHeight - 5 && this.data.spread.viewCell[this.data.rowIndex + 1][this.data.colIndex].selected.top)
        ) {
            this.el.classList.add('cursor-grab');
        } else if(
            (e.offsetY > e.target.offsetHeight - 5 && this.selected.bottom) ||
            (e.offsetY < 5 && this.data.rowIndex > 0 && this.data.spread.viewCell[this.data.rowIndex - 1][this.data.colIndex].selected.bottom)
        ) {
            this.el.classList.add('cursor-grab');
        } else if(
            (e.offsetX < 5 && this.selected.left) ||
            (e.offsetX > e.target.offsetWidth - 5 && this.data.spread.viewCell[this.data.rowIndex][this.data.colIndex + 1].selected.left)
        ) {
            this.el.classList.add('cursor-grab');
        } else if(
            (e.offsetX > e.target.offsetWidth - 5 && this.selected.right) ||
            (e.offsetX < 5 && this.data.colIndex > 0 && this.data.spread.viewCell[this.data.rowIndex][this.data.colIndex - 1].selected.right)
        ) {
            this.el.classList.add('cursor-grab');
        } else {
            this.el.classList.remove('cursor-grab');
        }
    } catch (error) {
        console.log(error);
    }
}

Cell.prototype.onMouseOut = function() {
    if(this.el.classList.contains('cursor-grab')) {
        this.el.classList.remove('cursor-grab');
    }
}

/**
 * @class 行
 */
export function Row(config, pNode) {

    this.render = function(parentNode) {
        let el = document.createElement("tr");
        el.data = {
            ...config,
            component: 'Row'
        };
        Array(config.colNum).fill('').map((i, colIndex) => {
            new Cell({
                ...config,
                colIndex: colIndex
            }, el);
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
export function Table(config, pNode) {
    this.el = null;

    this.refresh = function() {
        let _width = Array(config.spread.colNum).fill(null).map((i, index) => config.spread.getColWidth(index)).reduce((a, b) => a + b);
        let _height = Array(config.spread.rowNum).fill(null).map((i, index) => config.spread.getRowHeight(index)).reduce((a, b) => a + b);
        this.el.style.width = _width + 'px';
        this.el.style.height = _height + 'px';
    };

    this.render = function(parentNode) {
        let el = document.createElement("table");
        el.data = {
            ...config,
            component: 'Table'
        };
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
