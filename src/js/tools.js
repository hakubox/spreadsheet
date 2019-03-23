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

export default { numToString, createDom };
