#!/usr/bin/env node
import * as path from 'node:path'
import * as fs from 'node:fs'
import inquirer from 'inquirer'
import { program } from 'commander'
// import packageJson from '../package.json' assert { type: 'json' }
const deployPath = path.join(process.cwd(), './deploy')
const configPath = `${deployPath}/deploy.config.mjs`
import { checkNodeVersion, checkDeployConfig, underlineLog } from '../utils/index.js'

const jsonData = fs.readFileSync(path.join(import.meta.dirname, '../package.json'), 'utf8')
const packageJson = JSON.parse(jsonData)

const version = packageJson.version
const requiredNodeVersion = packageJson.engines.node
const packageName = packageJson.name

checkNodeVersion(requiredNodeVersion, packageName)

program
  .version(version)
  .command('init')
  .description('初始化部署相关配置')
  .action(async () => {
    ;(await import('../lib/init.js')).default()
  })

const agrs = process.argv.slice(2)

const firstArg = agrs[0]

// 无参数时默认输出help信息
if (!firstArg) {
  program.outputHelp()
  process.exit(1)
}

// 非部署选项且有配置文件时，读取配置文件
const cmds = ['-V', '--version', 'init']
if (!cmds.includes(firstArg) && agrs?.length == 1 && fs.existsSync(configPath)) {
  await deployCmd()
}

// 解析参数
program.parse(process.argv)

// 读取配置文件，注册部署命令
async function deployCmd() {
  // 检测部署配置是否合理
  const deployConfigs = await checkDeployConfig(configPath)

  if (!deployConfigs) {
    process.exit(1)
  }

  // 注册部署命令
  deployConfigs.forEach((config) => {
    const { command, projectName, name } = config
    program
      .command(`${command}`)
      .description(`${underlineLog(projectName)}项目${underlineLog(name)}部署`)
      .action(() => {
        inquirer
          .prompt([
            {
              type: 'confirm',
              message: `${underlineLog(projectName)}项目是否部署到${underlineLog(name)}？`,
              name: 'sure',
            },
          ])
          .then(async (answers) => {
            const { sure } = answers
            if (!sure) {
              process.exit(1)
            }
            if (sure) {
              const deploy = (await import('../lib/deploy.js')).deploy
              deploy(config)
            }
          })
      })
  })
}
