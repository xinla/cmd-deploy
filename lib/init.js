#!/usr/bin/env node
import * as fs from 'node:fs'
import * as path from 'node:path'
// const download = require('download-git-repo')
import ora from 'ora'
import { successLog, infoLog, errorLog, underlineLog } from '../utils/index.js'
let templatePath = path.join(import.meta.dirname, './template.config.js')
const deployPath = path.join(process.cwd(), './deploy')
const configPath = `${deployPath}/deploy.config.mjs`

// 创建配置文件模板
export default () => {
  if (fs.existsSync(configPath)) {
    infoLog('deploy 目录下的 deploy.config.mjs 配置文件已经存在，请勿重复操作')
    process.exit(1)
    return
  }
  const spinner = ora('开始创建配置文件模板')
  spinner.start()
  try {
    fs.mkdirSync(deployPath, { recursive: true })
    fs.copyFileSync(templatePath, configPath)
    spinner.stop()
    successLog('模板创建成功，文件位置：deploy/deploy.config.mjs')
    infoLog('请配置 deploy 目录下的 deploy.config.mjs 配置文件')
    process.exit(0)
  } catch (err) {
    errorLog(err)
    process.exit(1)
  }
}
