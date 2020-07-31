#!/usr/bin/env node
const fs = require('fs');
const program = require('commander');
const download = require('download-git-repo');
const handlebars = require('handlebars');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const symbols = require('log-symbols');
program.version('2.0.4', '-v, --version')
    .command('init [name]')
    .action((name) => {
        name = name || "quant-project"
        if (!fs.existsSync(name)) {
            inquirer.prompt([
                {
                    name: 'title',
                    message: '请输入项目标题',
                    default: "量投",
                }, {
                    name: 'description',
                    message: '请输入项目描述',
                    default: "description"
                },
                {
                    name: 'author',
                    message: '请输入作者名称',
                    default: "author"
                }, {
                    type: "confirm",
                    name: 'isTop',
                    message: '导航栏是在顶部Y|| 侧边N',
                    default: true,
                }, {
                    name: 'version',
                    message: '请输入项目版本',
                    default: "1.0.0",
                }
            ]).then((answers) => {
                const spinner = ora('正在生成模板...');
                spinner.start();
                let url = "direct:http://192.168.106.113/Architecture/QuantdoTemplate.git#2.0.0";
                download(url, name, { clone: true }, (err) => {
                    if (err) {
                        spinner.fail();
                        console.log(symbols.error, chalk.red(err), err);
                    } else {
                        spinner.succeed();
                        const fileName = `${name}/package.json`;
                        const configName = `${name}/src/common/config.js`;
                        const meta = {
                            name,
                            description: answers.description,
                            author: answers.author,
                            version: answers.version
                        }
                        const config = {
                            isTop: answers.isTop,
                            title: answers.title,
                        }
                        if (fs.existsSync(fileName)) {
                            const content = fs.readFileSync(fileName).toString();
                            const result = handlebars.compile(content)(meta);
                            fs.writeFileSync(fileName, result);
                        }
                        if (fs.existsSync(configName)) {
                            const content = fs.readFileSync(configName).toString();
                            const result = handlebars.compile(content)(config);
                            fs.writeFileSync(configName, result);
                        }
                        console.log(symbols.success, chalk.green('项目初始化完成'));
                    }
                })
            })
        } else {
            // 错误提示项目已存在，避免覆盖原有项目
            console.log(symbols.error, chalk.red('项目已存在'));
        }
    })
program.parse(process.argv);