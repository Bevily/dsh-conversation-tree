# GitHub 发布指南

仓库准备与本地打包不等于已发布。下面的上传、打标签和创建 Release 步骤由维护者执行。本项目保留 `private: true`，可以生成 tgz 并通过 GitHub Releases 分发；不会误执行 npm registry 发布。

## 首次公开前

1. 确认 `LICENSE` 与 `package.json` 的 license 字段符合维护者的选择。
2. 公开仓库为 https://github.com/Bevily/dsh-conversation-tree；package.json 已配置 repository、bugs 和 homepage 链接。
3. 检查 `git status --short` 与待提交 diff，确保没有用户配置、Session、token、私密日志和未脱敏截图。`.cache/`、`node_modules/`、`dist/` 和历史截图目录已忽略；公开图片放在 `docs/images/`。
4. 阅读 [验收记录](validation.md)，在 DSH Desktop 中补测浮窗缩放、侧栏往返、全屏提升、引用替换、钉回主线手动发送和会话树。记录实际平台与结果，未通过时保留限制说明。
5. 每个版本创建独立 Git 标签，并更新 README 的 GitHub 安装链接；已发布标签不移动。

## 本地生成与核验

```sh
npm ci
npm run pack
```

打包脚本会检查文件清单，并输出 `dist/SHA256SUMS`。安装包仅含插件运行文件、MIT 许可证、更新记录、README 与已筛选文档图片，不含测试 provider、测试 Session、缓存或 node_modules。

在 dist 目录验证下载包的 SHA-256：

```sh
cd dist
shasum -a 256 -c SHA256SUMS
```

Linux 可使用 `sha256sum -c SHA256SUMS`。校验和用于核对文件完整性，不代替来源验证。

当前版本为 `1.0.8`。后续更新时先运行 `npm version patch --no-git-tag-version`（或按变更选择 minor/major），更新 README 中的版本示例与 CHANGELOG，再重新打包。本地验收脚本会自动读取 package.json 的版本。

## 上传源码与创建 Release

远程仓库为 `git@github.com:Bevily/dsh-conversation-tree.git`。首次推送及后续发布流程：

1. 在 GitHub 新建仓库；如果推送已有本地仓库，保持远程为空，避免额外生成 README/许可证。
2. 将 GitHub 提供的真实仓库地址设为 origin，提交检查过的源码并推送 main。
3. 等待 GitHub Actions CI 通过。CI 运行 Node.js 22/24 下的构建、语法检查、测试、安装包清单校验和已提交 bundle 一致性检查；它不会自动发布。
4. 在确认过的提交上创建 `v1.0.8` 标签并推送。
5. GitHub 标签链接已可直接安装；如需分发离线包，可创建同名 GitHub Release，说明主要功能、安装步骤、DSH 适配版本和已知限制，上传 `dist/dsh-conversation-tree-1.0.8.tgz` 与 `dist/SHA256SUMS`。
6. 从 Release 重新下载附件、核验 SHA-256 并安装检查。不要用 GitHub 自动生成的 Source code 压缩包替代 tgz。

## 1.0.8 Release 说明草稿

DeepSeek Harness 原生会话分支插件。支持从回答或选段继续追问、可缩放浮窗、右侧栏、全屏提升、钉回主线及按工作区搜索会话树。

安装：在 DSH「插件 → 添加插件」中粘贴 `https://github.com/Bevily/dsh-conversation-tree#v1.0.8`。tgz 是可选的离线分发方式。

适配与边界：已在 DSH 0.2.1-rc.5 的 macOS ARM64 隔离 Web profile 验收；原生 agent loop 使用本地测试 provider。Electron 桌面版逐项验收和在线模型成功回复尚未完成，其他 DSH 版本及平台未验证。标题栏与隐藏列表兼容层依赖宿主 DOM 标记。钉回主线只填入可编辑摘录，不自动发送。

验证：构建、语法检查及 13 项自动测试通过。发布者应在此补充完成的桌面验收情况。
