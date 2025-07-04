const { Product, Sale, Delivery, Prediction, Ticket, Image} = require('./models');
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require('multer');
const path = require('path');
const app = express();
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: "*",
  }
});

io.on('connection', (socket) => {
  console.log('🟢 Nouveau client connecté :', socket.id, socket.handshake.headers.origin);

  // Envoie une confirmation au clients
  socket.emit('welcome', { message: 'Bienvenue, connexion établie!', socketId: socket.id });

  socket.on('disconnect', () => {
    console.log('🔴 Client déconnecté :', socket.id);
  });
});



// Connexion MongoDB
mongoose.connect("mongodb+srv://imranentv92:rTnX1oYR7MHzn6S7@cluster0.6xmgp9f.mongodb.net/commerce?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });
// GET - Tous les produits
app.get("/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// POST - Ajouter un produit
app.post("/products", async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.json(product);
});

app.post('/upload-image', upload.single('image'), async (req, res) => {
  try {
    const filePath = req.file.path;

    // Convert image to base64
    const base64Image = fs.readFileSync(filePath, { encoding: 'base64' });

    // Envoyer à imgbb
    const form = new FormData();
    form.append('key', "755a1b3f9f77b227a1d4d67b5728c986");
    form.append('image', base64Image);

    const response = await axios.post('https://api.imgbb.com/1/upload', form, {
      headers: form.getHeaders(),
    });

    const imageUrl = response.data.data.url;

    // Enregistrer dans MongoDB
    const savedImage = await Image.create({ url: imageUrl });

    // Supprimer le fichier local (optionnel)
    fs.unlinkSync(filePath);

    // Notifier via WebSocket
    io.emit('new-ticket-image', { imageUrl });

    res.status(200).json({ message: 'Image uploaded online', imageUrl, id: savedImage._id });
  } catch (err) {
    console.error('Erreur upload:', err);
    res.status(500).json({ error: 'Erreur upload image' });
  }
});
// PUT - Modifier un produit
app.put("/products/:id", async (req, res) => {
  try {
    console.log("PUT id:", req.params.id);
    console.log("PUT body:", req.body);
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body);
    if (!updated) return res.status(404).send("Produit non trouvé");
    res.json(updated);
  } catch (err) {
    res.status(400).send("Erreur lors de la mise à jour");
  }
});

// DELETE - Supprimer un produit
app.delete("/products/:id", async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).send("Produit non trouvé");
    res.json({ message: "Produit supprimé" });
  } catch (err) {
    res.status(400).send("Erreur lors de la suppression");
  }
});
app.post("/sell", async (req, res) => {
  try {
    const { items, total, date, customer } = req.body;

if (!customer || !customer.firstName || !customer.lastName || !customer.phone) {
  return res.status(400).json({ message: "❌ Infos client manquantes." });
}

    // 🔍 Vérifications des champs principaux
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "❌ 'items' est manquant ou vide." });
    }

    if (typeof total !== 'number' || total <= 0) {
      return res.status(400).json({ message: "❌ 'total' invalide." });
    }

    if (!date || isNaN(new Date(date))) {
      return res.status(400).json({ message: "❌ 'date' invalide." });
    }

    // 🔍 Validation du contenu de chaque item
    for (const item of items) {
      if (!item.productId || !item.quantity || !item.price) {
        return res.status(400).json({ message: `❌ Données manquantes dans un item : ${JSON.stringify(item)}` });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `❌ Produit non trouvé : ${item.productId}` });
      }

      // 🔄 Mise à jour de la quantité
      product.quantity = Math.max(0, product.quantity - item.quantity);
      await product.save();
    }

    // 💾 Création et enregistrement de la vente
    const newSale = new Sale({
      items,
      total,
      customer,
      date: new Date(date),
    });

    await newSale.save();

    console.log("✅ Vente enregistrée :", newSale);
    res.status(200).json({ message: "✅ Vente enregistrée", saleId: newSale._id });
  } catch (err) {
    console.error("💥 Erreur dans /sell :", err);
    res.status(500).json({ message: "❌ Erreur serveur lors de la vente" });
  }
});
app.get('/sales', async (req, res) => {
  try {
    const sales = await Sale.find().populate('items.productId').sort({ date: -1 });
    res.json(sales);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des ventes' });
  }
});

app.patch('/sales/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ message: 'Vente non trouvée' });
    }

    sale.status = status;
    await sale.save();

    res.json({ message: 'Statut mis à jour', sale });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du statut' });
  }
});

app.get("/dashboard", async (req, res) => {
  console.log("dashboard");
 const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  try {
    const deliveredSales = await Sale.find({ status: 'delivered' });
    const todaySales = await Sale.find({ status: 'delivered', date: { $gte: todayStart, $lte: todayEnd } });

    const allTickets = await Ticket.find({});
    const todayTickets = await Ticket.find({ date: { $gte: todayStart, $lte: todayEnd } });

    const totalOrders = deliveredSales.length + allTickets.length;
    const todayOrders = todaySales.length + todayTickets.length;

    const totalSales = deliveredSales.reduce((acc, sale) => acc + sale.total, 0)
                      + allTickets.reduce((acc, t) => acc + t.total, 0);

    const todaySalesAmount = todaySales.reduce((acc, sale) => acc + sale.total, 0)
                          + todayTickets.reduce((acc, t) => acc + t.total, 0);
console.log("Sending dashboard data...");
    res.json({
      totalOrders,
      todayOrders,
      totalSales,
      todaySales: todaySalesAmount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get("/predictions", async (req, res) => {
  try {
    // 1. Récupérer les ventes des 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sales = await Sale.find({ date: { $gte: thirtyDaysAgo } });

    // 2. Aggréger les ventes par jour
    const dailyTotals = {};

    for (const sale of sales) {
      const day = new Date(sale.date).toISOString().slice(0, 10); // format YYYY-MM-DD
      if (!dailyTotals[day]) {
        dailyTotals[day] = 0;
      }
      dailyTotals[day] += sale.total;
    }

    // 3. Trier les dates
    const sortedDates = Object.keys(dailyTotals).sort();

    // 4. Calcul moyenne mobile (sur 3 jours par ex)
    const movingAverage = (arr, windowSize) => {
      const result = [];
      for (let i = 0; i < arr.length; i++) {
        const start = Math.max(0, i - windowSize + 1);
        const window = arr.slice(start, i + 1);
        const avg = window.reduce((a, b) => a + b, 0) / window.length;
        result.push(avg);
      }
      return result;
    };

    const totals = sortedDates.map((date) => dailyTotals[date]);
    const smoothed = movingAverage(totals, 3);

    // 5. Générer les prévisions pour les 7 prochains jours
    const lastAvg = smoothed.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const predictions = [];

    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const forecastDate = new Date(today.getTime() + i * 86400000);
      predictions.push({
        date: forecastDate.toISOString().slice(0, 10),
        expectedSales: parseFloat((lastAvg * (1 + Math.random() * 0.1 - 0.05)).toFixed(2)), // +/- 5% variation
      });
    }

    res.json(predictions);
  } catch (err) {
    console.error("Erreur dans /predictions :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

app.post("/scan-ticket", async (req, res) => {
  try {
    const { items, total } = req.body;

    const savedItems = [];

    for (const item of items) {
      let product = await Product.findOne({ name: item.name });

      if (!product) {
        product = new Product({
          name: item.name,
          price: item.price,
          quantity: 100,
        });
        await product.save();
      }

      savedItems.push({
        productId: product._id,
        quantity: item.quantity,
        price: item.price,
      });
    }

    const newTicket = new Ticket({
      items: savedItems,
      total,
      date: new Date(),
    });

    await newTicket.save();
    console.log(ticketId);
    res.status(200).json({ message: "✅ Ticket enregistré", ticketId: newTicket._id });
  } catch (err) {
    console.error("Erreur /scan-ticket :", err);
    res.status(500).json({ message: "❌ Erreur serveur" });
  }
});

app.get("/latest-ticket", async (req, res) => {
  try {
    const latestTicket = await Ticket.findOne()
      .sort({ date: -1 }) // tri décroissant par date
      .populate("items.productId") // remplit les infos du produit
      .lean(); // pour retourner un objet JS simple

    if (!latestTicket) {
      return res.status(404).json({ message: "Aucun ticket trouvé" });
    }

    const formattedTicket = {
      items: latestTicket.items.map(item => ({
        name: item.productId.name,
        quantity: item.quantity,
        price: item.price,
      })),
      total: latestTicket.total,
    };

    console.log(formattedTicket);
    res.status(200).json(formattedTicket);
  } catch (err) {
    console.error("Erreur /latest-ticket :", err);
    res.status(500).json({ message: "❌ Erreur serveur" });
  }
});


// Lancement du serveur
server.listen(3000, '0.0.0.0', () => console.log("Backend running on http://localhost:3000"));
