import express from "express";
import { parseChapters } from "./parseChapters";
const puppeteer = require("puppeteer");
const morgan = require("morgan");

const app = express();

const port = 3000;

// 允许Express处理JSON和URL编码的请求体
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// POST路由处理
// const api = express.Router();

// 中间件函数，用于打印用户IP和请求的路由
app.use((req, res, next) => {
  // 获取用户IP地址
  const userIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  // 获取请求的路由路径
  const route = req.originalUrl;
  // 打印信息到控制台
  console.log(`User IP: ${userIp}, Route: ${route}`);
  // 继续执行下一个中间件或路由处理器
  next();
});

app.post("/scrape", async (req, res) => {
  const { url } = req.body; // 从请求体中获取URL

  if (!url) {
    return res.status(400).send({ error: "URL is required" });
  }

  try {
    // 启动无头浏览器
    const browser = await puppeteer.launch({
      headless: true, // 指定Chrome可执行文件的路径
      executablePath:
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    });
    const page = await browser.newPage();
    // 设置自定义 User-Agent
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
    );
    await page.goto(url, { waitUntil: "networkidle2" }); // 等待网络空闲表示加载完成

    await page.exposeFunction("parseChapters", parseChapters);
    // 在页面环境中执行parseChapters函数
    // 直接在evaluate中定义和执行parseChapters逻辑
    const chapters = await page.evaluate(() => {
      const allElements = Array.from(
        document.querySelectorAll(
          "#panels ytd-engagement-panel-section-list-renderer:nth-child(2) #content ytd-macro-markers-list-renderer #contents ytd-macro-markers-list-item-renderer #endpoint #details"
        )
      );

      const withTitleAndTime = allElements.map((node) => ({
        title: node.querySelector(".macro-markers")?.textContent,
        timestamp: node.querySelector("#time")?.textContent,
      }));

      const filtered = withTitleAndTime.filter(
        (element) =>
          element.title !== undefined &&
          element.title !== null &&
          element.timestamp !== undefined &&
          element.timestamp !== null
      );

      return [
        ...new Map(filtered.map((node) => [node.timestamp, node])).values(),
      ];
    });

    await browser.close(); // 关闭浏览器
    res.json(chapters); // 使用res.json直接发送JSON响应
  } catch (error) {
    console.error("Error during scraping:", error);
    res.status(500).send({ error: "Failed to scrape the URL" });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
