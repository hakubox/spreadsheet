import { ContextMenu } from './components/contextmenu.js'
import { ToolMenu } from './components/toolmenu.js'
import { Spread } from './components/spread.js'


console.time('页面加载');

//顶部工具栏
let toolmenu = new ToolMenu({
    menus: [
        {
            text: '撤销',
            key: 'ctrl+c',
            icon: 'fal fa-fw fa-reply',
            get isDisabled() {

            },
            onClick(e) {

            }
        }, {
            text: '重做',
            key: 'ctrl+m',
            icon: 'fal fa-fw fa-share',
            get isDisabled() {

            },
            onClick(e) {
            }
        }, '|', {
            text: '格式刷',
            icon: 'fal fa-fw fa-eraser',
            get isDisabled() {

            },
            onClick(e) {

            }
        }, '|', {
            text: '加粗',
            icon: 'fal fa-fw fa-bold',
            get isDisabled() {

            },
            onClick(e) {

            }
        }, {
            text: '倾斜',
            icon: 'fal fa-fw fa-italic',
            get isDisabled() {

            },
            onClick(e) {

            }
        }, {
            text: '下划线',
            icon: 'fal fa-fw fa-underline',
            get isDisabled() {

            },
            onClick(e) {

            }
        }, {
            text: '字体色',
            icon: 'fal fa-fw fa-font',
            get isDisabled() {

            },
            onClick(e) {

            }
        }, {
            text: '背景色',
            icon: 'fal fa-fw fa-fill-drip',
            get isDisabled() {

            },
            onClick(e) {

            }
        }, '|', {
            text: '左对齐',
            icon: 'fal fa-fw fa-align-left',
            children: [
                {
                    text: '居中对齐',
                    icon: 'fal fa-fw fa-align-center',
                    children: [

                    ],
                    get isDisabled() {

                    },
                    onClick(e) {

                    }
                }, {
                    text: '右对齐',
                    icon: 'fal fa-fw fa-align-right',
                    children: [

                    ],
                    get isDisabled() {

                    },
                    onClick(e) {

                    }
                }
            ],
            get isDisabled() {

            },
            onClick(e) {

            }
        }, {
            text: '上对齐',
            icon: 'fal fa-fw fa-grip-lines-top',
            children: [
                {
                    text: '居中对齐',
                    icon: 'fal fa-fw fa-align-center',
                    children: [

                    ],
                    get isDisabled() {

                    },
                    onClick(e) {

                    }
                }, {
                    text: '右对齐',
                    icon: 'fal fa-fw fa-align-right',
                    children: [

                    ],
                    get isDisabled() {

                    },
                    onClick(e) {

                    }
                }
            ],
            get isDisabled() {

            },
            onClick(e) {

            }
        }


    ]
}, document.body);

let spread = new Spread();
let spreadEl = spread.render(document.body);

//右键菜单列表
let contextmenu = new ContextMenu({
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
