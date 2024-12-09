import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  // 注册一个命令
  let disposable = vscode.commands.registerCommand('extension.openXiaoHongShu', () => {
    const panel = vscode.window.createWebviewPanel(
      'xiaoHongShu', // 标识符
      '小红书', // 标题
      vscode.ViewColumn.One, // 显示在编辑器的哪个位置
      {
        enableScripts: true, // 启用 JavaScript
        retainContextWhenHidden: true // 保持上下文
      }
    );

    // 设置 Webview 的内容
    panel.webview.html = getWebviewContent(panel.webview);

    // 监听 Webview 消息
    panel.webview.onDidReceiveMessage(
      message => {
        switch (message.command) {
          case 'login':
            handleLogin(message.username, message.password, panel.webview);
            return;
        }
      },
      undefined,
      context.subscriptions
    );
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}

function getWebviewContent(webview: vscode.Webview) {
  // 获取 Webview 的 URI
  const nonce = getNonce();

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>小红书</title>
      <style>
        body, html {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          overflow: hidden;
          background-color: #121212; /* 设置暗黑模式背景颜色 */
          color: #ffffff; /* 设置暗黑模式文字颜色 */
        }
        iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
      </style>
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; frame-src https://www.xiaohongshu.com https://*.xiaohongshu.com; script-src 'nonce-${nonce}'; style-src 'unsafe-inline' http: https:;">
    </head>
    <body>
      <div id="login">
        <h2>登录小红书</h2>
        <input type="text" id="username" placeholder="用户名" />
        <input type="password" id="password" placeholder="密码" />
        <button onclick="login()">登录</button>
      </div>
      <iframe id="xhsFrame" style="display:none;" src="https://www.xiaohongshu.com/"></iframe>
      <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();

        function login() {
          const username = document.getElementById('username').value;
          const password = document.getElementById('password').value;
          vscode.postMessage({
            command: 'login',
            username: username,
            password: password
          });
        }

        window.addEventListener('message', event => {
          const message = event.data;
          switch (message.command) {
            case 'loginSuccess':
              document.getElementById('login').style.display = 'none';
              document.getElementById('xhsFrame').style.display = 'block';
              break;
            case 'loginError':
              alert('登录失败，请检查用户名和密码');
              break;
          }
        });
      </script>
    </body>
    </html>
  `;
}

// 生成随机 nonce
function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// 处理登录
async function handleLogin(username: string, password: string, webview: vscode.Webview) {
  try {
    // 在这里实现登录逻辑，调用小红书的登录接口
    // 假设登录成功
    webview.postMessage({ command: 'loginSuccess' });
  } catch (error) {
    webview.postMessage({ command: 'loginError' });
  }
}