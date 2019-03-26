/**
 * @method 数字列序号转字母列序号
 * @param {Number} numm 数字序号
 * @return {String} 字母序号
 */
function numToString(numm) {
    let stringArray = [];
    const numToStringAction = function (nnum) {
        let num = nnum - 1;
        let a = parseInt(num / 26);
        let b = num % 26;
        stringArray.push(String.fromCharCode(64 + parseInt(b + 1)));
        if (a > 0) {
            numToStringAction(a);
        }
    }
    numToStringAction(numm);
    return stringArray.reverse().join("");
}

/**
 * @method 字母列序号转数字列序号
 * @param {Number} no 数字序号
 * @return {String} 字母序号
 */
function stringToNum(no) {
    var str = no.toLowerCase().split("");
    var num = 0;
    var al = str.length;
    var getCharNumber = function (charx) {
        return charx.charCodeAt() - 96;
    };
    var numout = 0;
    var charnum = 0;
    for (var i = 0; i < al; i++) {
        charnum = getCharNumber(str[i]);
        numout += charnum * Math.pow(26, al - i - 1);
    };
    return numout;
}

/**
 * @method 创建dom节点
 * @param {String} [type='div'] 节点类型
 * @param {Object} [property={}] 节点属性
 * @param {Element} parentNode 父节点
 * @return {Element} 创建完成的节点
 */
function createDom(type = 'div', property, parentNode) {
    let el = document.createElement(type);
    parentNode && parentNode.createElement(el);
    property && Object.entries(property).forEach(([key,  value]) => {
        if(key.startsWith('on')) {
            el.addEventListener(key.substr(2), value);
            if(!el.events) el.events = {};
            el.events[key] = value;
        } else if(key == 'children') {
            if(value.length) {
                value.forEach(i => el.appendChild(i));
            } else {
                el.appendChild(value);
            }
        } else {
            el[key] = value;
        }
    });
    return el;
}


/**
 * @method UTF-8转汉字
 * @param {Array} arr Number数组
 */
function readUTF(arr) {
    if (typeof arr === 'string') {
        return arr;
    }
    var UTF = '', _arr = arr;
    for (var i = 0; i < _arr.length; i++) {
        var one = _arr[i].toString(2),
                v = one.match(/^1+?(?=0)/);
        if (v && one.length == 8) {
            var bytesLength = v[0].length;
            var store = _arr[i].toString(2).slice(7 - bytesLength);
            for (var st = 1; st < bytesLength; st++) {
                store += _arr[st + i].toString(2).slice(2)
            }
            UTF += String.fromCharCode(parseInt(store, 2));
            i += bytesLength - 1
        } else {
            UTF += String.fromCharCode(_arr[i])
        }
    }
    return UTF
}

/**
 * Cell解析
 */
export function workbookResolve(workbook, sheet) {
    //获取数据
    Object.entries(workbook.Sheets[sheet]).forEach(([key, cell]) => {
        if(key[0] !== '!') {
            let colNo = key.match(/[A-Z]+/g)[0];
            let rowNum = stringToNum(colNo) - 1,
                colNum = Number(key.substr(colNo.length)) - 1;
            spread.setData(colNum, rowNum, cell.w.replace(/\r/g, '<br />'));
            // if(value._s && !isNaN(value._s)) {
                let fontStyle = getFontStyle(workbook, cell);
                let backColor = getBackColor(workbook, cell);
                let borderStyle = getBorder(workbook, cell);
                // let cellXf = workbook.Styles.CellXf[Number(value._s)];
                // let currentFill = workbook.Styles.Fills[cellXf.fillId];
                // let fontColor = getFontColor(), backColor = '#FFFFFF';

                spread.setStyle(colNum, rowNum, {
                    ...fontStyle,
                    ...borderStyle,
                    backgroundColor: backColor
                })
            // }
        }
    });
}

/**
 * 获取文字颜色
 */
function getFontStyle(workbook, cell) {
    let fontStyle = {};
    let cellXf = workbook.Styles.CellXf[Number(cell._s)];
    let currentFont = workbook.Styles.Fonts[cellXf.fontId];
    if(currentFont.color) {
        if(currentFont.color.rgb) {
            fontStyle.color = currentFont.color.rgb;
        } else if(currentFont.color.theme !== undefined) {
            fontStyle.color = workbook.Themes.themeElements.clrScheme[currentFont.color.theme].rgb;
        }
        if(fontStyle.color == 'FFFFFF') fontStyle.color = '000000';
        else if(fontStyle.color == '000000') fontStyle.color = 'FFFFFF';
        fontStyle.color = '#' + fontStyle.color;
    }
    if (currentFont.sz) {
        fontStyle.fontSize = currentFont.sz + 'pt';
    }
    if (currentFont.name) {
        fontStyle.fontFamily = currentFont.name;
    }
    if (currentFont.bold == 1) {
        fontStyle.fontWeight = 'bold';
    }
    if (currentFont.italic == 1) {
        fontStyle.fontStyle = 'italic';
    }
    if (currentFont.strike == 1) {
        fontStyle.textDecoration = 'line-through';
    }
    if (currentFont.alignment) {
        
    }
    return fontStyle;
}

/**
 * 获取边框 borderId
 */
function getBorder(workbook, cell) {
    let border = {};
    let cellXf = workbook.Styles.CellXf[Number(cell._s)];
    let borderStyle = workbook.Styles.Borders[cellXf.borderId];
    const getBorderStyle = border => {
        let color = '', width = 1, type = '';
        if(border.color) {
            color = border.color;
            if(border.color.length == 8 && border.color.startsWith('FF')) {
                color = border.color.substr(2);
            }
        } else if (border.auto) {
            color = '000000';
        }
        console.log(border.style);
        [ type, width ] = ({
            mediumdashed: ['dashed', 2],
            mediumdashed: ['dashed', 2],
            hair: ['dotted', 1],
            thin: ['solid', 1],
            thick: ['solid', 3],
            slantdashdot: ['dashed', 1],
            mediumdashdotdot: ['dashed', 2],
            mediumdashdot: ['dashed', 2],
            dashdotdot: ['dashed', 1],
            dotted: ['dashed', 1],
            double: ['double', 3],
            dashdot: ['dashed', 1],
            '': ['none', 0]
        })[border.style ? border.style.toLowerCase() : ''];

        if(!color) {
            debugger;
        }
        return [width + 'px', type, '#' + color].join(' ');
    };
    if(borderStyle) {
        if(borderStyle.top) {
            border.borderTop = getBorderStyle(borderStyle.top);
        }
        if(borderStyle.left) {
            border.borderLeft = getBorderStyle(borderStyle.left);
        }
        if(borderStyle.bottom) {
            border.borderBottom = getBorderStyle(borderStyle.bottom);
        }
        if(borderStyle.right) {
            border.borderRight = getBorderStyle(borderStyle.right);
        }
        console.log(cell, border);
    }
    return border;
}

/**
 * 获取背景颜色
 */
function getBackColor(workbook, cell) {
    let backColor = '';
    let cellXf = workbook.Styles.CellXf[Number(cell._s)];
    let currentFill = workbook.Styles.Fills[cellXf.fillId];
    if(currentFill.fgColor) {
        if(currentFill.fgColor.rgb) {
            backColor = currentFill.fgColor.rgb;
        } else if(currentFill.fgColor.theme !== undefined) {
            backColor = workbook.Themes.themeElements.clrScheme[currentFill.fgColor.theme].rgb;
        }
        if(backColor == 'FFFFFF') backColor = '000000';
        else if(backColor == '000000') backColor = 'FFFFFF';
        // if(currentFill.fgColor.tint) {
        //     backColor = Math.floor(Number('0x' + backColor[0] + backColor[1]) * (1 + currentFill.fgColor.tint)).toString(16).padStart(2, '0') +
        //                 Math.floor(Number('0x' + backColor[2] + backColor[3]) * (1 + currentFill.fgColor.tint)).toString(16).padStart(2, '0') +
        //                 Math.floor(Number('0x' + backColor[4] + backColor[5]) * (1 + currentFill.fgColor.tint)).toString(16).padStart(2, '0');
        // }
        backColor = '#' + backColor;
    }
    return backColor;
}

export default {
    numToString,
    createDom,
    stringToNum,
    stringToNum,
    workbookResolve
};
