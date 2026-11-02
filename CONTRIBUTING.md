# 参与开发

需要 Node.js 22 或更新版本。自动测试不依赖 DSH、模型服务或 API key。

```sh
npm ci
npm run pack
```

`pack` 会依次构建客户端、检查 JavaScript 语法、运行测试，并生成安装包和 SHA-256 校验文件。修改 `src/client` 后请一并提交重新生成的 `client.js`。React 由 DSH 宿主提供，构建时保持 external，不要将另一个 React 副本打入插件。

目录：

- `src/host/`：分支边界、关系持久化、原生 Session 操作。
- `src/client/`：原生 slot、标题栏、会话树与样式。
- `test/`：Host 和树模型测试，以及仅供隔离验收的本地 provider。
- `scripts/`：构建、打包与本机 DSH 验收工具。

修改分支逻辑时，请保留以下约定：引用替换当前分支草稿；钉回主线只填草稿，由用户手动发送；隐藏分支不出现在会话树中；插件不强制滚动聊天内容。

UI 修改应使用 DSH 主题变量，并检查浮窗、侧栏、全屏打开和窄窗口。依赖 dockkit DOM 标记的兼容层需要实际宿主验证，单元测试不能代替此项检查。开发用的 macOS 隔离验收见 [验收记录](docs/validation.md)。

提交反馈或截图前请移除凭据、token、私人会话内容和个人目录。发布步骤见 [发布指南](docs/releasing.md)。
