const express = require("express");
const puppeteer = require("puppeteer");
const app = express();
// const parseChapters = require("./parseChapters");

const port = 3000;

// 允许Express处理JSON和URL编码的请求体
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// parseChapters函数的定义（确保这部分与你的实际代码一致）
// function parseChapters(document) {
//   // 函数体与之前描述的相同
// }
function parseChapters() {
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

  const withoutDuplicates = [
    ...new Map(filtered.map((node) => [node.timestamp, node])).values(),
  ];

  return withoutDuplicates;
}

// POST路由处理
app.post("/scrape", async (req, res) => {
  const { url } = req.body; // 从请求体中获取URL

  if (!url) {
    return res.status(400).send({ error: "URL is required" });
  }

  try {
    // 启动无头浏览器
    const browser = await puppeteer.launch({ headless: false });
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
