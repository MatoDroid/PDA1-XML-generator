import express from "express";
import { createServer as createViteServer } from "vite";
import axios from "axios";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON
  app.use(express.json());

  // Helper function to fetch data
  const fetchData = async (url: string, browserlessToken?: string) => {
    // 1. Try Browserless if token is present
    if (browserlessToken) {
      console.log(`[Server] Attempting Browserless proxy for: ${url}`);
      try {
        const browserlessUrl = `https://chrome.browserless.io/function?token=${browserlessToken}`;
        const response = await axios.post(browserlessUrl, {
          code: `module.exports = async ({ page, context }) => {
            return page.evaluate(async (url) => {
              try {
                const res = await fetch(url, {
                  headers: { 
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                  }
                });
                if (!res.ok) return { error: res.statusText, status: res.status };
                return res.json();
              } catch (err) {
                return { error: err.toString() };
              }
            }, context.url);
          };`,
          context: { url }
        }, {
          headers: { 'Content-Type': 'application/json' }
        });

        // Check if the browserless function returned an error object
        if (response.data && response.data.error) {
          console.warn(`[Server] Browserless function returned error:`, response.data);
          throw new Error(`Browserless error: ${response.data.error}`);
        }

        return response.data;
      } catch (error: any) {
        console.error(`[Server] Browserless failed: ${error.message}. Falling back to direct request.`);
        // Fallback proceeds below
      }
    }

    // 2. Direct Axios Fallback
    console.log(`[Server] Using direct Axios request for: ${url}`);
    const response = await axios.get(url, {
      headers: { 
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    return response.data;
  };

  // Combined RPO Endpoint (Search + Detail)
  app.get("/api/rpo/entity", async (req, res) => {
    try {
      const { ico } = req.query;
      if (!ico) {
        return res.status(400).json({ error: "Missing ICO" });
      }

      // 1. Search
      const searchUrl = `https://api.statistics.sk/rpo/v1/search?identifier=${ico}`;
      console.log(`[Server] RPO Combined: Searching for ICO ${ico}`);
      const searchData = await fetchData(searchUrl, process.env.BROWSERLESS_API_KEY);

      if (!searchData.results || searchData.results.length === 0) {
        return res.status(404).json({ error: "Organization not found" });
      }

      const entityId = searchData.results[0].id;
      if (!entityId) {
        return res.status(404).json({ error: "Entity ID not found in search results" });
      }

      // 2. Detail
      const detailUrl = `https://api.statistics.sk/rpo/v1/entity/${entityId}?showHistoricalData=true&showOrganizationUnits=true`;
      console.log(`[Server] RPO Combined: Fetching detail for ID ${entityId}`);
      const detailData = await fetchData(detailUrl, process.env.BROWSERLESS_API_KEY);

      res.json(detailData);
    } catch (error: any) {
      console.error("[Server] RPO Combined Error:", error.message);
      res.status(error.response?.status || 500).json({ 
        error: "Failed to fetch entity from RPO", 
        details: error.response?.data || error.message 
      });
    }
  });

  // RPO Proxy Routes
  app.get("/api/rpo/search", async (req, res) => {
    try {
      const { identifier } = req.query;
      if (!identifier) {
        return res.status(400).json({ error: "Missing identifier" });
      }

      const apiUrl = `https://api.statistics.sk/rpo/v1/search?identifier=${identifier}`;
      const data = await fetchData(apiUrl, process.env.BROWSERLESS_API_KEY);
      res.json(data);
    } catch (error: any) {
      console.error("[Server] RPO Search Error:", error.message);
      res.status(error.response?.status || 500).json({ 
        error: "Failed to fetch from RPO", 
        details: error.response?.data || error.message 
      });
    }
  });

  app.get("/api/rpo/detail/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: "Missing ID" });
      }

      const apiUrl = `https://api.statistics.sk/rpo/v1/entity/${id}?showHistoricalData=true&showOrganizationUnits=true`;
      const data = await fetchData(apiUrl, process.env.BROWSERLESS_API_KEY);
      res.json(data);
    } catch (error: any) {
      console.error("[Server] RPO Detail Error:", error.message);
      res.status(error.response?.status || 500).json({ 
        error: "Failed to fetch entity detail", 
        details: error.response?.data || error.message 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving (if needed in future)
    app.use(express.static('dist'));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
