# 使用 *Node.js* 快速制作一个 *cli* 工具



本文将带着大家使用 *Node.js* 快速制作一个 *cli* 工具，主要包含以下内容：



- 搭建 *cli* 整体框架
- 完善 *cli* 命令



## 搭建 *cli* 整体框架



首先，在桌面上新建一个 *cli* 工程目录 *mycli*，*npm init -y* 进行初始化，如下：

```bash
cd desktop
mkdir mycli
cd mycli
npm init -y
```

然后安装如下的依赖：

- *commander*：用于定义 *cli* 工具的命令
- *git-clone*：用于从远程仓库克隆项目
- *open*：用于打开项目
- *shelljs*：用于书写 *shell* 命令

```bash
npm i commander git-clone open shelljs
```

接下来在项目根目录下创建 *index.js* 文件：

```bash
touch index.js
```

使用 *vscode* 打开 *mycli* 项目，编辑 *package.json* 文件，添加 *bin* 字段内容，设置命令 *mycli* 执行对应的文件为 *index.js*，如下：

```js
{
  ...
  "main": "index.js",
  "bin": {
    "mycli": "./index.js"
  },
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  ...
}
```

接下来使用 *npm link* 将该项目添加至全局环境，执行此命令后，我们的 *npm* 全局目录会多出来一个 *mycli* 的替身文件

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2021-11-04-055510.png" alt="image-20211104135509477" style="zoom:50%;" />

（图为此台电脑 *npm* 全局包目录 */usr/local/lib/node_modules* 部分截图）

并且在 */usr/local/bin* 目录下也会多出来一个 *mycli* 的二进制文件，如下图所示：

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2021-11-04-055734.png" alt="image-20211104135734169" style="zoom:50%;" />

（图为此台电脑  */usr/local/bin* 目录部分截图）



接下来打开终端，输入 *mycli*，会执行对应的 *index.js* 文件，打印输出 *Hello*，如下图所示：

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2021-11-04-060133.png" alt="image-20211104140132676" style="zoom:50%;" />

至此，我们的 *cli* 工具算是勉强能用。

接下来我们来搭建整体框架，代码如下：

```js
#!/usr/bin/env node
// 声明运行环境为 node
// console.log("Hello");

const program = require('commander');

// 定义程序的版本
program.version('1.0.0');

// 定义各种命令

// 创建项目
program.command('new <name>')
    .description('创建项目')
    .action(name => {
        console.log(`创建项目${name}成功`)
    })

// 运行项目
program.command('run')
    .description('运行项目')
    .action(name => {
        console.log(`运行项目成功`)
    })

// 预览项目
program.command('start')
    .description('预览项目')
    .action(name => {
        console.log(`预览项目成功`)
    })
// 解析命令行传入的参数
program.parse(process.argv);
```

在上面的代码中，我们引入了 *commander* 包，然后定义了 *cli* 工具的版本为 *1.0.0*，此外还定义了 *3* 个命令，分别对应创建项目、运行项目和预览项目，每条命令定义了提示文字和用户输入命令后要进行的行为。

可以进行一个简单的测试，具体操作如下图：

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2021-11-04-060841.png" alt="image-20211104140841436" style="zoom:50%;" />

至此，我们自己写的 *cli* 工具整体就已经成型了。



## 完善 *cli* 命令



接下来我们继续来完善该 *cli* 工具，使其可以真正的创建一个项目。

首先引入如下的依赖包：

```js
const shell = require("shelljs");
const download = require("git-clone");
const open = require('open');
const { spawn } = require('child_process');
```



然后我们从 *github* 找一个需要克隆的项目，例如 *vue3* 预览版：*https://github.com/dolymood/vue-next-webpack-preview*

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2021-11-04-061213.png" alt="image-20211104141212609" style="zoom:50%;" />

获取该项目的克隆地址，修改创建项目命令部分的代码，如下：

```js
// 创建项目
program.command('new <name>')
    .description('创建项目')
    .action(name => {
        // console.log(`创建项目${name}成功`)
        // 从 git 上克隆一个项目下来
        const giturl = 'git@github.com:dolymood/vue-next-webpack-preview.git'
        // download 函数接收 3 个参数
        // 1. 项目克隆地址  2. 克隆下来的项目写入的目录地址  3. 克隆完成后的回调
        download(giturl, `./${name}`, () => {
            shell.rm('-rf', `${name}/.git`); // 删除 git 文件
            shell.cd(name); // 进入项目
            shell.exec('npm install'); // 安装依赖
            console.log(`
                创建项目 ${name} 成功
                cd ${name} 进入项目
                mycli run 启动项目
                mycli start 预览项目
            `)
        });
    })
```

在上面的代码中，我们从指定的 *github* 地址克隆了一个项目到当前目录，然后删除了 *.git* 文件，安装了相应的依赖，最后给予用户相应的提示。



修改运行项目命令部分的代码，如下：

```js
// 运行项目
program.command('run')
    .description('运行项目')
    .action(name => {
        // console.log(`运行项目成功`)
         // shell.exec('npm run dev');
         const cp = spawn('npm', ['run', 'dev']);
         cp.stdout.pipe(process.stdout);
         cp.stderr.pipe(process.stderr);
         cp.on('close', () => {
             console.log('启动项目成功');
         })
    })
```

该部分代码很简单，就是执行 *npm run dev* 命令来启动项目，可以直接通过 *shell* 来执行该命令，也可以通过 *Node.js* 的 *child_process* 模块的 *spawn* 方法来执行。



最后修改预览项目命令部分的代码，如下：

```js
// 预览项目
program.command('start')
    .description('预览项目')
    .action(name => {
        open('http://localhost:8080')
        console.log(`预览项目成功`)
    })
```

该部分直接使用 *open* 模块所提供的方法来打开浏览器，让用户来预览项目。



完整的代码如下：

```js
#!/usr/bin/env node
// 声明运行环境为 node
// console.log("Hello");

const program = require('commander');
const shell = require("shelljs");
const download = require("git-clone");
const open = require('open');
const { spawn } = require('child_process');

// 定义程序的版本
program.version('1.0.0');

// 定义各种命令

// 创建项目
program.command('new <name>')
    .description('创建项目')
    .action(name => {
        // console.log(`创建项目${name}成功`)
        // 从 git 上克隆一个项目下来
        const giturl = 'git@github.com:dolymood/vue-next-webpack-preview.git'
        // download 函数接收 3 个参数
        // 1. 项目克隆地址  2. 克隆下来的项目写入的目录地址  3. 克隆完成后的回调
        download(giturl, `./${name}`, () => {
            shell.rm('-rf', `${name}/.git`); // 删除 git 文件
            shell.cd(name); // 进入项目
            shell.exec('npm install'); // 安装依赖
            console.log(`
                创建项目 ${name} 成功
                cd ${name} 进入项目
                mycli run 启动项目
                mycli start 预览项目
            `)
        });
    })

// 运行项目
program.command('run')
    .description('运行项目')
    .action(name => {
        // console.log(`运行项目成功`)
         // shell.exec('npm run dev');
         const cp = spawn('npm', ['run', 'dev']);
         cp.stdout.pipe(process.stdout);
         cp.stderr.pipe(process.stderr);
         cp.on('close', () => {
             console.log('启动项目成功');
         })
    })

// 预览项目
program.command('start')
    .description('预览项目')
    .action(name => {
        open('http://localhost:8080')
        console.log(`预览项目成功`)
    })
    
// 解析命令行传入的参数
program.parse(process.argv);
```



最后我们对该 *cli* 工具进行测试。

打开新的终端，输入 *mycli new mycli_demo*，其中 *mycli_demo* 为项目名，效果如下：

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2021-11-04-062503.png" alt="image-20211104142502910" style="zoom:50%;" />

接下来测试 *mycli run* 命令，如下图所示：

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2021-11-04-062556.png" alt="image-20211104142556220" style="zoom:50%;" />

克隆下来的 *vue3* 预览项目已经成功运行，并且监听 *8080* 端口。



打开新的终端，输入 *mycli start* 可以直接打开浏览器预览当前运行的项目，如下图所示：

<img src="https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2021-11-04-062943.png" alt="image-20211104142942718" style="zoom:50%;" />

至此，我们就成功的使用 *Node.js* 快速制作了一个自己的 *cli* 工具出来。



-*EOF*-
