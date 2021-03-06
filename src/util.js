import fs from 'fs';
import symbol from 'log-symbols';
import chalk from 'chalk';
import inquirer from 'inquirer';
import downloadGit from 'download-git-repo';

// 文件是否存在
let notExistFold = async (name) => {
    return new Promise((resolve) => {
        if (fs.existsSync(name)) {
            console.log(symbol.error, chalk.red('文件夹名已被占用，请更换名字重新创建'));
        } else {
            resolve();
        }
    });
}

// 询问用户
let promptList = [
    {
        type: 'list',
        name: 'client',
        message: 'please choose this project Mobile or PC',
        choices: ['PC', 'Mobile']
    },
    {
        type: 'list',
        name: 'frame',
        message: 'please choose this project template',
        choices: ['vue', 'react', 'typeScript'],
        when: function(answers) {
            return answers.client == 'PC'
        }
    },
    {
        type: 'list',
        name: 'frame',
        message: 'please choose this project template',
        choices: ['vue', 'react'],
        when: function(answers) {
            return answers.client == 'Mobile'
        }
    },
    {
        type: 'list',
        name: 'single',
        message: 'project is a single page application',
        choices: ['yes', 'no'],
        when: function(answers) {
            return answers.frame =='vue'
        }
    },
    {
        type: 'list',
        name: 'library',
        message: 'Please choose the UI library name: ',
        choices: ['ElementUI', 'iView'],
        when: function(answers) {
            return answers.client == 'PC' && answers.frame =='vue'
        }
    },
    {
        type: 'list',
        name: 'library',
        message: 'Please choose the UI library name: ',
        choices: ['Vant', 'Minui'],
        when: function(answers) {
            return answers.client == 'Mobile' && answers.frame =='vue'
        }
    },
    {
        type: 'list',
        name: 'library',
        message: 'Please choose the UI library name: ',
        choices: ['amaze-ui', 'ant-design'],
        when: function(answers) {
            return answers.client == 'PC' && answers.frame =='react'
        }
    },
    {
        type: 'list',
        name: 'library',
        message: 'Please choose the UI library name: ',
        choices: ['amaze-ui-touch', 'ant-design-mobile'],
        when: function(answers) {
            return answers.client == 'Mobile' && answers.frame =='react'
        }
    },
    {
        type: 'list',
        name: 'request',
        message: 'Please choose the request method name: ',
        choices: ['axios', 'fetch'],
        when: function(answers) {
            return answers.frame == 'vue' || answers.frame =='react'
        }
    },
    {
        type: 'input',
        name: 'description',
        message: 'Please enter the project description: '
    },
    {
        type: 'input',
        name: 'author',
        message: 'Please enter the author name: '
    },
    {
        type: 'input',
        name: 'createtime',
        message: 'Please enter the create time: '
    }
];

let prompt = () => {
    return new Promise(resolve => {
        inquirer
            .prompt(promptList)
            .then(answer => {
                resolve(answer);
            })
    });
}

// 项目模板远程下载
let  downloadTemplate = async (ProjectName, api) => {
    return new Promise((resolve, reject) => {
        downloadGit(api, ProjectName, {clone: true}, (err) => {
            if(err){
                reject(err);
            }else{
                resolve();
            }
        })
    });
};

// 更新json配置文件
let updateJsonFile = (fileName, obj) => {

    return new Promise(resolve => {
        if(fs.existsSync(fileName)){
            const data = fs.readFileSync(fileName).toString();
            let json = JSON.parse(data);
            Object.keys(obj).forEach(key => {
                if(key == 'dependencies'){
                    let olddependencies = JSON.parse(JSON.stringify(json[key]))
                    json[key] = Object.assign(olddependencies, obj[key])
                }else{
                    json[key] = obj[key];
                } 
            });
            fs.writeFileSync(fileName, JSON.stringify(json, null, '\t'), 'utf-8');
            resolve();
        }
    });
}

module.exports = {
    notExistFold,
    prompt,
    downloadTemplate,
    updateJsonFile
}