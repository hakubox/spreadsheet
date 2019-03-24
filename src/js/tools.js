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

export default { numToString, createDom, stringToNum, stringToNum };
