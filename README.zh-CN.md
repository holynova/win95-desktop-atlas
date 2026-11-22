# Windows 95 桌面图鉴

[English](README.md) · [GitHub 仓库](https://github.com/holynova/win95-desktop-atlas) · [Cloudflare 演示](https://win95-desktop-atlas.xiaosang.cc/)

同一种 Windows 95 窗口语言下的十种网页版式。总览提供真实缩略图，也可以按内容类型筛选，或切换到特性对照表，比较阅读顺序、适用内容与使用边界。

![版式图鉴总览中的不同页面构图](assets/screenshot.png)

| 阅读任务 | 示例 |
| --- | --- |
| 顺着读 | 植物观察长文、邮票工作日时间线 |
| 细看图 | 单焦点海报、非对称城市影墙、建筑双联图 |
| 对照图文 | 印刷杂志跨页、邮票卡片目录、星点标注图 |
| 查找与操作 | 陶器属性矩阵、音乐主从列表 |

海报和杂志使用同一组印样，邮票目录与时间线使用同一枚海岸邮票。可以从页面菜单直接切换这两组案例，在每个示例底部展开版式笔记。

## 本地运行

使用 Node.js 做检查，使用 Python 3 启动预览。应用无需安装依赖。

```sh
npm run check
python3 -m http.server 8000 --directory dist
```

打开 `http://localhost:8000`。图像、标本和音频都在 `dist/assets` 中，城市照片选自 Unsplash。

## 发布

Cloudflare Pages 绑定 GitHub 生产分支 **main**，运行 `npm run check`，托管 `dist/`。提交改动后执行 `git push origin main` 发布。

![Cloudflare 演示站二维码](assets/qr.png)
