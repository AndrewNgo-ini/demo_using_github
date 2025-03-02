const http = require("http");
const fs = require("fs");

const PORT = 3000;
const DATA_FILE = "pins.json";

// Hàm đọc dữ liệu từ file JSON
const readData = () => {
  if (!fs.existsSync(DATA_FILE)) {
    // Create default data if file doesn't exist
    const defaultPins = [
      {
        id: 1,
        title: "Delicious Homemade Pizza",
        description: "Try this amazing recipe for dinner tonight!",
        imageUrl: "/api/placeholder/300/400",
        height: 400,
        username: "FoodLover"
      },
      {
        id: 2,
        title: "Minimalist Living Room",
        description: "Interior design inspiration for modern homes",
        imageUrl: "/api/placeholder/300/200",
        height: 200,
        username: "DesignPro"
      },
      {
        id: 3, 
        title: "Mountain Hiking Adventure",
        description: "Breathtaking views from last weekend's trip",
        imageUrl: "/api/placeholder/300/500",
        height: 500,
        username: "OutdoorExplorer"
      },
      {
        id: 4,
        title: "DIY Plant Hangers",
        description: "Easy project for beginners",
        imageUrl: "/api/placeholder/300/350",
        height: 350,
        username: "CraftyCreator"
      },
      {
        id: 5,
        title: "Summer Fashion Trends 2025",
        description: "What everyone will be wearing this season",
        imageUrl: "/api/placeholder/300/280",
        height: 280,
        username: "FashionForward"
      }
    ];
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultPins, null, 2), "utf8");
    return defaultPins;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
};

// Hàm ghi dữ liệu vào file JSON
const writeData = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
};

// Tạo server
const server = http.createServer((req, res) => {
  // Add CORS headers to all responses
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  // Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // Handle normal requests
  if (req.method === "GET" && req.url === "/pins") {
    res.setHeader("Content-Type", "application/json");
    const pins = readData();
    res.writeHead(200);
    res.end(JSON.stringify(pins));
  }

  else if (req.method === "POST" && req.url === "/pins") {
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      try {
        const pins = readData();
        const newPin = JSON.parse(body);
        newPin.id = Date.now();
        pins.push(newPin);
        writeData(pins);
        
        res.setHeader("Content-Type", "application/json");
        res.writeHead(201);
        res.end(JSON.stringify(newPin));
      } catch (error) {
        res.setHeader("Content-Type", "application/json");
        res.writeHead(400);
        res.end(JSON.stringify({ message: "Invalid request data" }));
      }
    });
  }

  else if (req.method === "PUT" && req.url.startsWith("/pins/")) {
    const id = parseInt(req.url.split("/")[2]);
    let body = "";
    req.on("data", chunk => (body += chunk));
    req.on("end", () => {
      try {
        let pins = readData();
        let index = pins.findIndex(pin => pin.id === id);
        if (index !== -1) {
          const updatedPin = { ...pins[index], ...JSON.parse(body) };
          // Ensure id doesn't change
          updatedPin.id = id;
          pins[index] = updatedPin;
          writeData(pins);
          
          res.setHeader("Content-Type", "application/json");
          res.writeHead(200);
          res.end(JSON.stringify(updatedPin));
        } else {
          res.setHeader("Content-Type", "application/json");
          res.writeHead(404);
          res.end(JSON.stringify({ message: "Pin not found" }));
        }
      } catch (error) {
        res.setHeader("Content-Type", "application/json");
        res.writeHead(400);
        res.end(JSON.stringify({ message: "Invalid request data" }));
      }
    });
  }

  else if (req.method === "DELETE" && req.url.startsWith("/pins/")) {
    const id = parseInt(req.url.split("/")[2]);
    let pins = readData();
    let filteredPins = pins.filter(pin => pin.id !== id);
    if (pins.length !== filteredPins.length) {
      writeData(filteredPins);
      
      res.setHeader("Content-Type", "application/json");
      res.writeHead(200);
      res.end(JSON.stringify({ message: "Deleted successfully" }));
    } else {
      res.setHeader("Content-Type", "application/json");
      res.writeHead(404);
      res.end(JSON.stringify({ message: "Pin not found" }));
    }
  }
  
  // Handle placeholder image requests
  else if (req.url.startsWith("/api/placeholder/")) {
    const parts = req.url.split('/');
    if (parts.length >= 5) {
      // Simple placeholder response
      res.setHeader("Content-Type", "text/plain");
      res.writeHead(200);
      res.end("Placeholder image data would go here");
    } else {
      res.writeHead(404);
      res.end();
    }
  }

  else {
    res.setHeader("Content-Type", "application/json");
    res.writeHead(404);
    res.end(JSON.stringify({ message: "Route not found" }));
  }
});

server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));