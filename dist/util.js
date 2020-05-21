'use strict';

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _logSymbols = require('log-symbols');

var _logSymbols2 = _interopRequireDefault(_logSymbols);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _inquirer = require('inquirer');

var _inquirer2 = _interopRequireDefault(_inquirer);

var _downloadGitRepo = require('download-git-repo');

var _downloadGitRepo2 = _interopRequireDefault(_downloadGitRepo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// 文件是否存在
let notExistFold = async name => {
    return new Promise(resolve => {
        if (_fs2.default.existsSync(name)) {
            console.log(_logSymbols2.default.error, _chalk2.default.red('文件夹名已被占用，请更换名字重新创建'));
        } else {
            resolve();
        }
    });
};

// 询问用户
let promptList = [{
    type: 'list',
    name: 'client',
    message: 'please choose this project Mobile or PC',
    choices: ['PC', 'Mobile']
}, {
    type: 'list',
    name: 'frame',
    message: 'please choose this project template',
    choices: ['vue', 'react']
}, {
    type: 'list',
    name: 'library',
    message: 'Please choose the UI library name: ',
    choices: ['ElementUI', 'iView'],
    when: function (answers) {
        return answers.client == 'PC';
    }
}, {
    type: 'list',
    name: 'library',
    message: 'Please choose the UI library name: ',
    choices: ['Vant', 'Minui'],
    when: function (answers) {
        return answers.client == 'Mobile';
    }
}, {
    type: 'list',
    name: 'request',
    message: 'Please choose the request method name: ',
    choices: ['axios', 'fetch']
}, {
    type: 'input',
    name: 'description',
    message: 'Please enter the project description: '
}, {
    type: 'input',
    name: 'author',
    message: 'Please enter the author name: '
}, {
    type: 'input',
    name: 'createtime',
    message: 'Please enter the create time: '
}];

let prompt = () => {
    return new Promise(resolve => {
        _inquirer2.default.prompt(promptList).then(answer => {
            resolve(answer);
        });
    });
};

// 项目模板远程下载
let downloadTemplate = async (ProjectName, api) => {
    return new Promise((resolve, reject) => {
        (0, _downloadGitRepo2.default)(api, ProjectName, { clone: true }, err => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

// 更新json配置文件
let updateJsonFile = (fileName, obj) => {

    return new Promise(resolve => {
        if (_fs2.default.existsSync(fileName)) {
            const data = _fs2.default.readFileSync(fileName).toString();
            let json = JSON.parse(data);
            Object.keys(obj).forEach(key => {
                if (key == 'dependencies') {
                    let olddependencies = JSON.parse(JSON.stringify(json[key]));
                    json[key] = Object.assign(olddependencies, obj[key]);
                } else {
                    json[key] = obj[key];
                }
            });
            _fs2.default.writeFileSync(fileName, JSON.stringify(json, null, '\t'), 'utf-8');
            resolve();
        }
    });
};

module.exports = {
    notExistFold,
    prompt,
    downloadTemplate,
    updateJsonFile
};