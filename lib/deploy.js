import * as path from 'node:path'
import * as fs from 'node:fs'

import * as childProcess from 'node:child_process'
// const childProcess = require('child_process')
import ora from 'ora'
import { NodeSSH } from 'node-ssh'
import archiver from 'archiver'
// const archiver = require('archiver')
import { successLog, errorLog, underlineLog } from '../utils/index.js'

const projectDir = process.cwd()

let ssh = new NodeSSH() // 生成ssh实例

// 部署流程入口
export async function deploy(config) {
  const { script, remoteCommand, webDir, distPath, projectName, name } = config
  const spinner = ora('正在打包中')
  try {
    spinner.start()
    execBuild(script)
    await startZip(distPath)
    await connectSSH(config)
    await uploadFile(webDir)
    await unzipFile(webDir)
    distPath && (await deleteLocalZip())
    await execRemoteCommand(remoteCommand)
    spinner.stop()

    successLog(`\n 恭喜您，${underlineLog(projectName)}项目${underlineLog(name)}部署成功了^_^\n`)
    process.exit(0)
  } catch (err) {
    spinner.stop()
    errorLog(`  部署失败 ${err}`)
    process.exit(1)
  }
}

// 第一步，执行打包脚本
function execBuild(script) {
  if (!script) return
  try {
    console.log(`\n- ${script}`)
    spinner.text = '正在打包中'
    console.log()
    childProcess.execSync(script, { cwd: projectDir })
    successLog('  打包成功')
  } catch (err) {
    errorLog(err)
    process.exit(1)
  }
}

// 第二部，打包zip
function startZip(distPath) {
  if (!distPath) return
  return new Promise((resolve, reject) => {
    distPath = path.resolve(projectDir, distPath)
    console.log('- 打包成zip')
    const archive = archiver('zip', {
      zlib: { level: 9 },
    }).on('error', (err) => {
      throw err
    })
    const output = fs.createWriteStream(`${projectDir}/dist.zip`)
    output.on('close', (err) => {
      if (err) {
        errorLog(`  关闭archiver异常 ${err}`)
        reject(err)
        process.exit(1)
      }
      successLog('  zip打包成功')
      resolve()
    })
    archive.pipe(output)
    archive.directory(distPath, '/')
    archive.finalize()
  })
}

// 第三步，连接SSH
async function connectSSH(config) {
  const { host, port, username, password, privateKey, passphrase, distPath } = config
  const sshConfig = {
    host,
    port,
    username,
    password,
    privateKey,
    passphrase,
  }
  try {
    console.log(`- 连接${underlineLog(host)}`)
    await ssh.connect(sshConfig)
    successLog('  SSH连接成功')
  } catch (err) {
    errorLog(`  连接失败 ${err}`)
    process.exit(1)
  }
}

// 第四部，上传zip包
async function uploadFile(webDir) {
  if (!webDir) return
  try {
    console.log(`- 上传zip至目录${underlineLog(webDir)}`)
    await ssh.putFile(`${projectDir}/dist.zip`, `${webDir}/dist.zip`)
    successLog('  zip包上传成功')
  } catch (err) {
    errorLog(`  zip包上传失败 ${err}`)
    process.exit(1)
  }
}

// 运行命令
async function runCommand(command, webDir) {
  await ssh.execCommand(command, { cwd: webDir })
}

// 第五步，解压zip包
async function unzipFile(webDir) {
  if (!webDir) return
  try {
    console.log('- 开始解压zip包')
    await runCommand(`cd ${webDir}`, webDir)
    await runCommand('unzip -o dist.zip && rm -f dist.zip', webDir)
    successLog('  zip包解压成功')
  } catch (err) {
    errorLog(`  zip包解压失败 ${err}`)
    process.exit(1)
  }
}

// 第六步，删除本地dist.zip包
async function deleteLocalZip() {
  return new Promise((resolve, reject) => {
    console.log('- 开始删除本地zip包')
    fs.unlink(`${projectDir}/dist.zip`, (err) => {
      if (err) {
        errorLog(`  本地zip包删除失败 ${err}`, err)
        reject(err)
        process.exit(1)
      }
      successLog('  本地zip包删除成功')
      resolve()
    })
  })
}

// 第七步，运行远程命令
async function execRemoteCommand(remoteCommand) {
  try {
    console.log('- 执行远程命令')
    let command = remoteCommand?.join?.(' && ')
    command && (await ssh.execCommand(command))
    successLog('  执行远程命令成功')
  } catch (err) {
    errorLog(`  执行远程命令失败 ${err}`)
    process.exit(1)
  }
}
