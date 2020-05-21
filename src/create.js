
import symbol from 'log-symbols';
import chalk from 'chalk';
import fs from 'fs';
import ora from 'ora';

import {
    notExistFold,
    prompt,
    downloadTemplate,
    updateJsonFile
} from './util';

let create = async (ProjectName) => {

    // 项目名不能为空
    if (ProjectName === undefined) {
        console.log(symbol.error, chalk.red('创建项目的时候，请输入项目名'));
    } else {
        // 如果文件名不存在则继续执行,否则退出
        notExistFold(ProjectName).then(() => {

            // 用户询问交互
            prompt().then((answer) => {

                // 目前只建了一个vue的模板，所以只能先跳过react🌶 
                if (answer.frame === 'react') {
                    console.log(symbol.warning, chalk.yellow('react模板还在路上，莫急莫急~'));
                    process.exit(1);
                }

                /**
                 * 根据用户输入的配置信息下载模版&更新模版配置
                 * 下载模版比较耗时,这里通过ora插入下载loading, 提示用户正在下载模版
                 */
                let loading = ora('模板下载中...');
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

                downloadTemplate(ProjectName, Api)
                .then(async () => {

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
                    updateJsonFile(fileName, answer)
                    .then(() => {
                        console.log(symbol.success, chalk.green('配置已完成，cd到项目目录，执行npm install'));
                    })

                    //如果选择移动端，需要修改main.js中引入lib-flexible,添加px2rem配置
                    if(answer.client == 'Mobile'){
                        if(fs.existsSync(`${ProjectName}/src/main.js`)){
                            const data = fs.readFileSync(`${ProjectName}/src/main.js`, 'utf8').split('\n')
                            data.splice(0, 0, "import 'lib-flexible/flexible.js'")
                            fs.writeFileSync(`${ProjectName}/src/main.js`, data.join('\n'), 'utf8')
                        }
                        if(fs.existsSync(`${ProjectName}/vue.config.js`)){
                            const vueConfig = fs.readFileSync(`${ProjectName}/vue.config.js`, 'utf8').split('\n'),
                                  px2rem='  css: {\n'
                                        +'    loaderOptions: {\n'
                                        +'      postcss: {\n'
                                        +'        plugins: [\n'
                                        +'          require("postcss-px2rem")({\n'
                                        +'            remUnit: 75\n'
                                        +'          })\n'
                                        +'        ]\n'
                                        +'      }\n'
                                        +'    }\n'
                                        +'  },';
                            vueConfig.splice(1, 0, px2rem)
                            fs.writeFileSync(`${ProjectName}/vue.config.js`, vueConfig.join('\n'), 'utf8')
                        }
                    }

                }, () => {
                    loading.fail('模板下载失败');
                });
            })
        });
    }
};

module.exports = create;

