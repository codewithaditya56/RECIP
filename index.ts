import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const app = new Hono<{ Bindings: Env }>();

app.use("*", cors());

// Schemas for validation
const ContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().min(1),
  message: z.string().min(1)
});

// API Routes

// Get credit scores endpoint
app.get("/api/scores", async (c) => {
  const db = c.env.DB;
  
  try {
    const scores = await db.prepare(`
      SELECT * FROM credit_scores 
      ORDER BY score_date DESC 
      LIMIT 10
    `).all();
    
    return c.json({ success: true, data: scores.results });
  } catch (error) {
    return c.json({ success: false, error: "Failed to fetch scores" }, 500);
  }
});

// Get credit trends endpoint
app.get("/api/trends", async (c) => {
  const db = c.env.DB;
  
  try {
    const trends = await db.prepare(`
      SELECT 
        strftime('%Y-%m', score_date) as month,
        AVG(score) as avg_score,
        COUNT(*) as count
      FROM credit_scores 
      WHERE score_date >= date('now', '-6 months')
      GROUP BY strftime('%Y-%m', score_date)
      ORDER BY month ASC
    `).all();
    
    return c.json({ success: true, data: trends.results });
  } catch (error) {
    return c.json({ success: false, error: "Failed to fetch trends" }, 500);
  }
});

// Get credit events endpoint
app.get("/api/events", async (c) => {
  const db = c.env.DB;
  
  try {
    const events = await db.prepare(`
      SELECT * FROM credit_events 
      ORDER BY event_date DESC 
      LIMIT 20
    `).all();
    
    return c.json({ success: true, data: events.results });
  } catch (error) {
    return c.json({ success: false, error: "Failed to fetch events" }, 500);
  }
});

// Get alerts endpoint
app.get("/api/alerts", async (c) => {
  const db = c.env.DB;
  
  try {
    const alerts = await db.prepare(`
      SELECT * FROM alerts 
      WHERE is_read = 0 
      ORDER BY created_at DESC
    `).all();
    
    return c.json({ success: true, data: alerts.results });
  } catch (error) {
    return c.json({ success: false, error: "Failed to fetch alerts" }, 500);
  }
});

// Submit contact form endpoint
app.post("/api/contact", zValidator("json", ContactSchema), async (c) => {
  const { name, email, subject, message } = c.req.valid("json");
  
  // In a real app, you would send an email or save to database
  console.log("Contact form submission:", { name, email, subject, message });
  
  return c.json({ 
    success: true, 
    message: "Thank you for your message! We'll get back to you soon." 
  });
});

// Financial data endpoint (mock for now)
app.get("/api/financial-data", async (c) => {
  // In a real app, this would fetch from Yahoo Finance or Alpha Vantage
  const mockData = [
    { symbol: "SPY", price: 445.32, change_percent: 1.2, sentiment_score: 0.65 },
    { symbol: "QQQ", price: 378.91, change_percent: -0.8, sentiment_score: 0.45 },
    { symbol: "IWM", price: 198.75, change_percent: 2.1, sentiment_score: 0.78 }
  ];
  
  return c.json({ success: true, data: mockData });
});

export default app;
