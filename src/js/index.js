import { ContextMenu } from './components/contextmenu.js'
import { Spread } from './components/spread.js'


console.time('页面加载');

let spread = new Spread();
let spreadEl = spread.render(document.body);

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
