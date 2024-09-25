# cmd-deploy

前端命令行自动化一键部署工具，支持测试、线上等多环境部署，支持环境配置扩展，配置好后仅需一条命令即可完成整个部署流程。

## 适用对象

目前采用手动部署又期望快速实现轻量化部署的团队或者个人

前提条件：能通过 ssh 连上服务器

## 安装

全局安装 cmd-deploy

```sh
npm i cmd-deploy -g
```

查看版本，表示安装成功。

```sh
deploy -V
```

## 使用

### 1. 初始化部署模板

进入项目根目录下执行初始化命令，会在当前目录下生成 deploy 文件夹，里面包含 deploy.config.js 配置文件，配置好后仅需一条命令即可完成整个部署流程。

```sh
deploy init

# 板创建成功，文件位置：deploy/deploy.config.js
# 请配置 deploy 目录下的 deploy.config.js 配置文件
```

### 2. 配置部署环境

部署配置文件位于 deploy 文件夹下的`deploy.config.js`,
一般包含`dev`（测试环境）和`prod`（线上环境）两个配置，再有多余的环境配置形式与之类似，只有一个环境的可以删除另一个多余的配置（比如只有`prod`线上环境，可删除`dev`测试环境配置）。

具体配置信息请参考配置文件注释：

```js
export default {
  privateKey: '', // 本地私钥地址，位置一般在C:/Users/xxx/.ssh/id_rsa，非必填，有私钥则配置
  passphrase: '', // 本地私钥密码，非必填，有私钥则配置
  projectName: '', // 项目名称
  // 根据需要进行配置，如只需部署prod线上环境，可删除dev测试环境配置，反之亦然，支持多环境部署，再有多余的环境按照下面格式写即可
  // 以下为示例配置，请在实际使用时根据实际情况进行配置
  dev: {
    // 测试环境
    name: '测试环境',
    script: 'npm run build:dev', // 测试环境打包脚本
    host: '139.224.22.228', // 测试服务器地址
    port: 22, // ssh 端口，一般默认22
    username: 'root', // 登录服务器用户名
    password: '123456', // 登录服务器密码
    distPath: 'dist', // 本地打包dist目录
    webDir: '/usr/local/nginx/html/prod/pc', // 服务器文件部署地址示例： /usr/local/nginx/html/prod/pc
  },
  prod: {
    // 线上环境
    name: '线上环境',
    script: 'npm run build', // 线上环境打包脚本
    host: '139.224.22.228', // 测试服务器地址
    port: 22, // ssh 端口，一般默认22
    username: 'root', // 登录服务器用户名
    password: '123456', // 登录服务器密码
    distPath: 'dist', // 本地打包dist目录
    webDir: '/usr/local/nginx/html/prod/pc', // 服务器文件部署地址示例： /usr/local/nginx/html/prod/pc
  },
}
```

### 3.查看部署命令

配置好`deploy.config.js`，运行以下命令，查看部署命令

```sh
deploy --help

# Usage: index [options] [command]

# Options:
#   -V, --version   output the version number
#   -h, --help      display help for command

# Commands:
#   init            初始化部署相关配置
#   dev             cmd-deploy项目测试环境部署
#   prod            cmd-deploy项目线上环境部署
#   help [command]  display help for command
```

### 4. 测试环境部署

测试环境部署采用的时`dev`的配置，执行命令会有一个确认，确认后进入部署流程，完成 6 步操作后，部署成功！！！

```sh
deploy dev

# ✔ cmd-deploy项目是否部署到测试环境？ yes

# （1）npm run build
# ⠋ 正在打包中
#   打包成功
# （2）打包成zip
#   zip打包成功
# （3）连接139.224.22.197
#   SSH连接成功
# （4）上传zip至目录/usr/local/nginx/html/prod/pc
#   zip包上传成功
# （5）开始解压zip包
#   zip包解压成功
# （6）开始删除本地zip包
#   本地zip包删除成功


#  恭喜您，cmd-deploy项目测试环境部署成功了^_^
```

### 5. 线上环境部署

线上环境部署采用的时`prod`的配置，部署流程和测试环境相同：

```sh
deploy prod

# ✔ cmd-deploy项目是否部署到线上环境？ yes

# （1）npm run build
# ⠋ 正在打包中
#   打包成功
# （2）打包成zip
#   zip打包成功
# （3）连接139.224.22.197
#   SSH连接成功
# （4）上传zip至目录/usr/local/nginx/html/prod/pc
#   zip包上传成功
# （5）开始解压zip包
#   zip包解压成功
# （6）开始删除本地zip包
#   本地zip包删除成功


#  恭喜您，cmd-deploy项目线上环境部署成功了^_^
```

如果项目对您有所帮助，欢迎 star，O(∩_∩)O，感谢支持~

## 鸣谢

本项目主要由开源项目 [fe-deploy-cli](https://github.com/dadaiwei/fe-deploy-cli) 代码和依赖全面升级而来， node16 之前都是用的这个命令行工具，后面升级到 node18 之后，这个命令行工具不兼容，且最近版本已有五年之久，看 github 主页也没有升级维护的计划，所以用最新的 ES 规范和依赖重新写了，以方便 node18 后续的使用，在此感谢开源项目 fe-deploy-cli
