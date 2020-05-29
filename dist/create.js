'use strict';

var _logSymbols = require('log-symbols');

var _logSymbols2 = _interopRequireDefault(_logSymbols);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _ora = require('ora');

var _ora2 = _interopRequireDefault(_ora);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let create = async ProjectName => {

    // 项目名不能为空
    if (ProjectName === undefined) {
        console.log(_logSymbols2.default.error, _chalk2.default.red('创建项目的时候，请输入项目名'));
    } else {
        // 如果文件名不存在则继续执行,否则退出
        (0, _util.notExistFold)(ProjectName).then(() => {
            // 用户询问交互
            (0, _util.prompt)().then(answer => {
                /**
                 * 根据用户输入的配置信息下载模版&更新模版配置
                 * 下载模版比较耗时,这里通过ora插入下载loading, 提示用户正在下载模版
                 */
                let loading = (0, _ora2.default)('模板下载中...');
                loading.start('模板下载中...');

                let Api = '';
                switch (answer.frame) {
                    case 'vue':
                        if (answer.single == 'yes') {
                            Api = 'direct:https://github.com/bobqd/vue-temlate.git';
                        } else {
                            Api = 'direct:https://github.com/bobqd/vue-multiple-temlate.git';
                        }
                        break;
                    case 'react':
                        Api = 'direct:https://github.com/bobqd/react-template.git';
                        break;
                    default:
                        break;
                }

                (0, _util.downloadTemplate)(ProjectName, Api).then(async () => {
                    loading.succeed('模板下载完成');
                    // 下载完成后,根据用户输入更新配置文件
                    const fileName = `${ProjectName}/package.json`;
                    answer.name = ProjectName;
                    answer.dependencies = {};

                    switch (answer.request) {
                        case 'axios':
                            answer.dependencies['axios'] = "^0.19.0";
                            break;
                        case 'fetch':
                            answer.dependencies['fetch'] = "^1.0.0";
                            break;
                        default:
                            break;
                    }

                    if (answer.frame === 'vue') {
                        switch (answer.library) {
                            case 'ElementUI':
                                answer.dependencies['element-ui'] = "^2.13.0";
                                break;
                            case 'iView':
                                answer.dependencies['iview'] = "^3.5.0";
                                break;
                            case 'Vant':
                                answer.dependencies['vant'] = "^2.8.0";
                                answer.dependencies['lib-flexible'] = "^0.3.0";
                                answer.dependencies['postcss-px2rem'] = "^0.3.0";
                                break;
                            case 'Minui':
                                answer.dependencies['mint-ui'] = "^7.0.0";
                                answer.dependencies['lib-flexible'] = "^0.3.0";
                                answer.dependencies['postcss-px2rem'] = "^0.3.0";
                                break;
                            default:
                                break;
                        }
                        (0, _util.updateJsonFile)(fileName, answer).then(() => {
                            console.log(_logSymbols2.default.success, _chalk2.default.green(`配置已完成，cd ${ProjectName}，执行npm install`));
                        });
                        //如果选择移动端，需要修改main.js中引入lib-flexible,添加px2rem配置
                        if (answer.client == 'Mobile') {
                            if (_fs2.default.existsSync(`${ProjectName}/src/main.js`)) {
                                const data = _fs2.default.readFileSync(`${ProjectName}/src/main.js`, 'utf8').split('\n');
                                data.splice(0, 0, "import 'lib-flexible/flexible.js'");
                                _fs2.default.writeFileSync(`${ProjectName}/src/main.js`, data.join('\n'), 'utf8');
                            } else {
                                const files = _fs2.default.readdirSync(`${ProjectName}/src/pages`);
                                files.forEach(function (item, index) {
                                    let stat = _fs2.default.lstatSync(`${ProjectName}/src/pages/` + item);
                                    if (stat.isDirectory() === true) {
                                        const data = _fs2.default.readFileSync(`${ProjectName}/src/pages/${item}/index.js`, 'utf8').split('\n');
                                        data.splice(0, 0, "import 'lib-flexible/flexible.js'");
                                        _fs2.default.writeFileSync(`${ProjectName}/src/pages/${item}/index.js`, data.join('\n'), 'utf8');
                                    }
                                });
                            }
                            if (_fs2.default.existsSync(`${ProjectName}/vue.config.js`)) {
                                const vueConfig = _fs2.default.readFileSync(`${ProjectName}/vue.config.js`, 'utf8').split('\n'),
                                      px2rem = '  css: {\n' + '    loaderOptions: {\n' + '      postcss: {\n' + '        plugins: [\n' + '          require("postcss-px2rem")({\n' + '            remUnit: 75\n' + '          })\n' + '        ]\n' + '      }\n' + '    }\n' + '  },';
                                vueConfig.splice(answer.single == 'yes' ? 1 : 26, 0, px2rem);
                                _fs2.default.writeFileSync(`${ProjectName}/vue.config.js`, vueConfig.join('\n'), 'utf8');
                            }
                        }
                    } else if (answer.frame === 'react') {
                        switch (answer.library) {
                            case 'amaze-ui':
                                answer.dependencies['amazeui'] = "^2.7.0";
                                break;
                            case 'ant-design':
                                answer.dependencies['antd'] = "^4.2.0";
                                break;
                            case 'amaze-ui-touch':
                                answer.dependencies['amazeui-touch'] = "^2.0.0";
                                answer.dependencies['lib-flexible'] = "^0.3.0";
                                answer.dependencies['postcss-px2rem'] = "^0.3.0";
                                break;
                            case 'ant-design-mobile':
                                answer.dependencies['antd-mobile'] = "^2.3.0";
                                answer.dependencies['lib-flexible'] = "^0.3.0";
                                answer.dependencies['postcss-px2rem'] = "^0.3.0";
                                break;
                            default:
                                break;
                        }

                        (0, _util.updateJsonFile)(fileName, answer).then(() => {
                            console.log(_logSymbols2.default.success, _chalk2.default.green(`配置已完成，cd ${ProjectName}，执行npm install`));
                        });
                    }
                }, () => {
                    loading.fail('模板下载失败');
                });
            });
        });
    }
};

module.exports = create;