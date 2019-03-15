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
            el.type = "text";
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
function Cell(config, pNode) {
    this.el = null;

    this.isEdit = false;

    /**
     * 重绘合并状态
     */
    this.refreshMerge = function() {
        let mergeinfo = config.spread.areaMerge.find(([x, y, rowspan, colspan]) =>
            x === config.rowIndex + config.spread.viewX &&
            y === config.colIndex + config.spread.viewY
        );

        if(config.colIndex === 0) {
            this.el.parentNode.style.height = config.spread.getRowHeight(config.rowIndex) + 'px';
        }
        if(config.rowIndex === 0) {
            this.el.parentNode.style.width = config.spread.getColWidth(config.colIndex) + 'px';
        }

        if(mergeinfo) {
            // console.log(config.rowIndex, config.colIndex);
            if(config.rowIndex - config.spread.freezeArea.top > 0) {
                this.el.setAttribute('rowspan', mergeinfo[2]);
            } else {
                // this.el.setAttribute('rowspan', mergeinfo[2] + config.rowIndex - config.spread.freezeArea.top);
                this.el.setAttribute('rowspan', 1);
            }

            this.el.setAttribute('colspan', mergeinfo[3]);
        } else {
            this.el.removeAttribute('rowspan');
            this.el.removeAttribute('colspan');
        }

        let mergeheadinfo = config.spread.areaMerge.find(([x, y, rowspan, colspan]) =>
            x <= config.rowIndex + config.spread.viewX &&
            x + rowspan > config.rowIndex + config.spread.viewX &&
            y <= config.colIndex + config.spread.viewY &&
            y + colspan > config.colIndex + config.spread.viewY &&
            !(x === config.rowIndex + config.spread.viewX && y === config.colIndex + config.spread.viewY));
        if(mergeheadinfo) {
            //console.log(config.rowIndex, config.colIndex);
            this.el.classList.add('hidden');
        } else {
            this.el.classList.remove('hidden');
        }
    }

    /**
     * 重绘选中状态
     */
    this.refresh = function() {
        let colIndex = config.colIndex,
            rowIndex = config.rowIndex,
            _class = [];
        if(this.el.classList.contains('hidden')) {
            _class.push('hidden');
        }
        if(config.rowIndex >= config.spread.freezeArea.top) {
            rowIndex += config.spread.viewX;
        }
        if(config.colIndex >= config.spread.freezeArea.left) {
            colIndex += config.spread.viewY;
        }

        if(config.colIndex === config.spread.freezeArea.left) {
            _class.push('cell-freeze-left');
        }
        if(config.rowIndex === config.spread.freezeArea.top) {
            _class.push('cell-freeze-top');
        }

        //活动单元格
        if(config.spread.active[0] === rowIndex && config.spread.active[1] === colIndex) {
            _class.push('focus');
            if(this.isEdit === false) {
                this.el.removeChild(this.Content.el);
                this.el.appendChild(this.Content.render(this.Content.el));
                this.Content.el.value = config.spread.getData(rowIndex, colIndex);
                setTimeout(() => this.Content.el.focus(), 1);
                this.isEdit = true;
            }
        } else {
            if(this.isEdit === true) {
                this.el.removeChild(this.Content.el);
                this.el.appendChild(this.Content.render(this.Content.el));
                this.Content.el.innerHTML = config.spread.getData(rowIndex, colIndex);
                this.Content.el.focus();
                this.isEdit = false;
            }
            //选中单元格
            let td = config.spread.selected.find(([x, y]) => x === rowIndex && y === colIndex);
            if(td) {
                _class.push('selected');
            }
        }

        if (config.spread.selectedArea.type === 'cell') {

            let mergeinfo = config.spread.areaMerge.find(([x, y, rowspan, colspan]) =>
                rowIndex > x && rowIndex < x + rowspan &&
                colIndex > y && colIndex < y + colspan
            );
            if(mergeinfo) {
                //console.log(mergeinfo);
            }

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
            // if (rowIndex == config.spread.selectedArea.minx - 1) {
            //     _class.push('selected-area-top');
            // }
            // if (rowIndex == config.spread.selectedArea.maxx - 1) {
            //     _class.push('selected-area-bottom');
            // }

        } else if (config.spread.selectedArea.type === 'col') {
            if (rowIndex == 0 && colIndex == config.spread.selectedArea.y - 1) {
                _class.push('selected-area-init');
            }

            //设置当前范围
            // if (colIndex == config.spread.selectedArea.miny - 1) {
            //     _class.push('selected-area-left');
            // }
            // if (colIndex == config.spread.selectedArea.maxy - 1) {
            //     _class.push('selected-area-right');
            // }
        }

        let _className = _class.join(' '),
            _oldClassName = this.el.className;
        if(_className !== _oldClassName && (_className != '' || _oldClassName !== '')) {
            this.el.className = _className;
        }
    }

    this.render = function(parentNode) {
        let el = document.createElement("td");
        el.data = {
            ...config,
            component: 'Cell'
        };
        this.Content = new TextBox({
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
 * @class 行
 */
function Row(config, pNode) {

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
function Table(config, pNode) {
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