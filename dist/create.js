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

                // 目前只建了一个vue的模板，所以只能先跳过react🌶 
                if (answer.frame === 'react') {
                    console.log(_logSymbols2.default.warning, _chalk2.default.yellow('react模板还在路上，莫急莫急~'));
                    process.exit(1);
                }

                /**
                 * 根据用户输入的配置信息下载模版&更新模版配置
                 * 下载模版比较耗时,这里通过ora插入下载loading, 提示用户正在下载模版
                 */
                let loading = (0, _ora2.default)('模板下载中...');
                loading.start('模板下载中...');

                let Api = '';
                switch (answer.frame) {
                    case 'vue':
                        Api = 'direct:https://github.com/bobqd/vue-temlate.git';
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
                            break;
                        case 'Minui':
                            answer.dependencies['mint-ui'] = "^7.0.0";
                            answer.dependencies['lib-flexible'] = "^0.3.0";
                            break;
                        default:
                            break;
                    }
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
                    (0, _util.updateJsonFile)(fileName, answer).then(() => {
                        console.log(_logSymbols2.default.success, _chalk2.default.green('配置已完成，cd到项目目录，执行npm install'));
                    });

                    //如果选择移动端，需要修改main.js中引入lib-flexible
                    if (answer.client == 'Mobile') {
                        _fs2.default.open(`${ProjectName}/src/main.js`, 'a', function (err, fd) {
                            if (err) {
                                console.log('读取文件main.JS失败');
                            } else {
                                var buffer = Buffer.from("import 'lib-flexible/flexible.js'");
                                _fs2.default.write(fd, buffer, function (err, written, buffer) {
                                    if (err) {
                                        console.log('写入文件失败');
                                    } else {}
                                });
                            }
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