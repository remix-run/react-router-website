const http = require("http");
const md = require("@ryanflorence/md");

http
  .createServer(async (req, res) => {
    let html = await md.processMarkdown(`
# lol

\`\`\`jsx
console.log("lol")
\`\`\`

    `);
    res.end(html);
  })
  .listen(3000);
