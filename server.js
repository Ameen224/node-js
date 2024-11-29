const http = require("http");
const fs = require("fs");
const port = 3000;

// Load static files
const index = fs.readFileSync("./index.html", "utf-8");
const table = fs.readFileSync("./table.html", "utf-8");

let data;
try {
    data = JSON.parse(fs.readFileSync("./data.json", "utf-8"));
} catch (err) {
    console.error("Error loading data.json:", err);
    data = [];
}

const server = http.createServer((req, res) => {
    if (req.method === "GET" && req.url === "/home") {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(index);
    }

    if (req.method === "GET" && req.url === "/table") {
        const tableRows = data.map((entry, index) => `
                <tr data-id="${index}">
                    <td>${entry.name || ""}</td>
                    <td>${entry.age || ""}</td>
                    <td>${entry.number || ""}</td>
                    <td>${entry.mail || ""}</td>
                    <td>
                        <button onclick="editRow(${index})">Edit</button>
                        <button onclick="deleteRow(${index})">Delete</button>
                    </td>
                </tr>
            `)
            .join("");
        const tableHtml = table.replace("${tabledata}", tableRows);

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(tableHtml);
    }

    if (req.method === "POST" && req.url === "/update") {
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
            try {
                const { index, name, age, number, mail } = JSON.parse(body);
                if (index >= 0 && index < data.length) {
                    data[index] = { name, age, number, mail };

                    fs.writeFile("./data.json", JSON.stringify(data, null, 2), (err) => {
                        if (err) {
                            console.error(err);
                            res.writeHead(500, { "Content-Type": "application/json" });
                            res.end(JSON.stringify({ message: "Internal Server Error" }));
                        } else {
                            res.writeHead(200, { "Content-Type": "application/json" });
                            res.end(JSON.stringify({ message: "Data updated successfully" }));
                        }
                    });
                } else {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ message: "Invalid index" }));
                }
            } catch (error) {
                console.error(error);
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Internal Server Error" }));
            }
        });
    }

    if (req.method === "POST" && req.url === "/delete") {
        let body = "";
        req.on("data", (chunk) => (body += chunk));
        req.on("end", () => {
            try {
                const { index } = JSON.parse(body);
                if (index >= 0 && index < data.length) {
                    data.splice(index, 1);

                    fs.writeFile("./data.json", JSON.stringify(data, null, 2), (err) => {
                        if (err) {
                            console.error(err);
                            res.writeHead(500, { "Content-Type": "application/json" });
                            res.end(JSON.stringify({ message: "Internal Server Error" }));
                        } else {
                            res.writeHead(200, { "Content-Type": "application/json" });
                            res.end(JSON.stringify({ message: "Data deleted successfully" }));
                        }
                    });
                } else {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ message: "Invalid index" }));
                }
            } catch (error) {
                console.error(error);
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Internal Server Error" }));
            }
        });
    }
});

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/home`);
});


