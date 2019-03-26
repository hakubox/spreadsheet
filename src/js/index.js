import { ContextMenu } from './components/contextmenu.js'
import { ToolMenu } from './components/toolmenu.js'
import { Spread } from './components/spread.js'
import tool from './tools.js';


let fileSpreadSheet = document.querySelector('#fileSpreadSheet');

function fileImport() {
    //获取读取我文件的File对象
    var selectedFile = fileSpreadSheet.files[0];
    var name = selectedFile.name;//读取选中文件的文件名
    var size = selectedFile.size;//读取选中文件的大小
    console.log("文件名:"+name+"大小:"+size);

    var reader = new FileReader();//这是核心,读取操作就是由它完成.
    reader.readAsBinaryString(selectedFile);//读取文件的内容,也可以读取文件的URL
    reader.onload = ev => {
        let data = ev.target.result,
            workbook = XLSX.read(data, {
                type: 'binary',
                cellStyles: true,
                // bookProps: true,
                bookFiles: true,
                bookVBA: true
            }), // 以二进制流方式读取得到整份excel表格对象
            persons = []; // 存储获取到的数据
        // 遍历每张表读取
        let fromTo = '';
        for (let sheet in workbook.Sheets) {
            if (workbook.Sheets.hasOwnProperty(sheet)) {
                fromTo = workbook.Sheets[sheet]['!ref'];
                persons = persons.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]));
                console.log(workbook, persons, fromTo);

                //获取数据
                Object.entries(workbook.Sheets[sheet]).forEach(([key, value]) => {
                    if(key[0] !== '!') {
                        let colNo = key.match(/[A-Z]+/g)[0];
                        let rowNum = tool.stringToNum(colNo) - 1,
                            colNum = Number(key.substr(colNo.length)) - 1;
                        spread.setData(colNum, rowNum, value.w);
                        if(value._s && !isNaN(value._s)) {
                            let cellXf = workbook.Styles.CellXf[Number(value._s)];
                            let currentFill = workbook.Styles.Fills[cellXf.fillId];
                            let currentFont = workbook.Styles.Fonts[cellXf.fontId];
                            let fontColor = '#000000', backColor = '#FFFFFF';
                            if(currentFill.fgColor) {
                                if(currentFill.fgColor.rgb) {
                                    backColor = currentFill.fgColor.rgb;
                                } else if(currentFill.fgColor.theme !== undefined) {
                                    backColor = workbook.Themes.themeElements.clrScheme[currentFill.fgColor.theme].rgb;
                                }
                                if(backColor == 'FFFFFF') backColor = '000000';
                                else if(backColor == '000000') backColor = 'FFFFFF';
                                if(currentFill.fgColor.tint) {
                                    backColor = Math.floor(Number('0x' + backColor[0] + backColor[1]) * (1 + currentFill.fgColor.tint)).toString(16).padStart(2, '0') +
                                                Math.floor(Number('0x' + backColor[2] + backColor[3]) * (1 + currentFill.fgColor.tint)).toString(16).padStart(2, '0') +
                                                Math.floor(Number('0x' + backColor[4] + backColor[5]) * (1 + currentFill.fgColor.tint)).toString(16).padStart(2, '0');
                                }
                                backColor = '#' + backColor;
                            }
                            if(currentFont.color) {
                                if(currentFont.color.rgb) {
                                    fontColor = currentFont.color.rgb;
                                } else if(currentFont.color.theme !== undefined) {
                                    fontColor = workbook.Themes.themeElements.clrScheme[currentFont.color.theme].rgb;
                                }
                                if(fontColor == 'FFFFFF') fontColor = '000000';
                                else if(fontColor == '000000') fontColor = 'FFFFFF';
                                fontColor = '#' + fontColor;
                            }
                            spread.setStyle(colNum, rowNum, {
                                color: fontColor,
                                backgroundColor: backColor
                            })
                        }
                    }
                });


                fileSpreadSheet.value = '';
                break;
            }
        }

    }
}

fileSpreadSheet.addEventListener('change', fileImport);

//顶部工具栏
let toolmenu = new ToolMenu({
    menus: [
        /*

            function 函数
            info-square 信息
            lock-alt lock-open-alt 锁定/解锁
            paperclip unlink 超链接/删除链接
            plus-square 添加新文档
            share-alt 共享
            sign-in-alt sign-out-alt 登入/登出
            sliders-h 设置
            sort sort-down sort-up 排序
            spinner spinner-third 转动动画
            terminal 控制台
            trash-alt 垃圾桶
            layer-group layer-minus layer-plus 多层/减少层/增加层
            filter 筛选
        */
        {
            text: '打开',
            key: 'ctrl+c',
            icon: 'fal fa-fw fa-file-excel',
            get isDisabled() {

            },
            onClick(e) {
                document.querySelector('#fileSpreadSheet').click();
            }
        }, '|', {
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
            text: '字体颜色',
            icon: 'fal fa-fw fa-font',
            get isDisabled() {

            },
            onClick(e) {

            }
        }, {
            text: '填充颜色',
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
