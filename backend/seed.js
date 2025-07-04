const mongoose = require("mongoose");
const { Product, Sale } = require("./models");

mongoose.connect("mongodb+srv://imranentv92:rTnX1oYR7MHzn6S7@cluster0.6xmgp9f.mongodb.net/commerce?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});



async function seedSales() {
  try {
    await mongoose.connection;

    const products = await Product.find();
    if (products.length < 3) {
      console.error("❌ Ajoutez au moins 3 produits avant de lancer ce seed.");
      process.exit(1);
    }

    const salesToInsert = [];

    const customerNames = [
      { firstName: "Alice", lastName: "Dupont", phone: "0601020304" },
      { firstName: "Karim", lastName: "Ben", phone: "0708091011" },
      { firstName: "Lina", lastName: "Hassan", phone: "0611223344" },
    ];

    for (let i = 0; i < 30; i++) {
      const day = new Date();
      day.setDate(day.getDate() - i); // date - i jours

      const numSalesToday = Math.floor(Math.random() * 3) + 1; // 1 à 3 ventes par jour

      for (let s = 0; s < numSalesToday; s++) {
        const items = [];

        const nbItems = Math.floor(Math.random() * 3) + 1; // 1 à 3 articles par vente

        let total = 0;

        for (let j = 0; j < nbItems; j++) {
          const product = products[Math.floor(Math.random() * products.length)];
          const quantity = Math.floor(Math.random() * 5) + 1;
          const price = product.price;

          total += price * quantity;

          items.push({
            productId: product._id,
            quantity,
            price,
          });
        }

        const customer = customerNames[Math.floor(Math.random() * customerNames.length)];

        salesToInsert.push({
          items,
          total: parseFloat(total.toFixed(2)),
          customer,
          date: new Date(day.setHours(Math.floor(Math.random() * 12) + 8)), // entre 8h et 20h
          status: ["pending", "delivered", "cancelled"][Math.floor(Math.random() * 3)],
        });
      }
    }

    await Sale.deleteMany({});
    await Sale.insertMany(salesToInsert);

    console.log(`✅ ${salesToInsert.length} ventes ajoutées dans la base.`);
    process.exit(0);
  } catch (err) {
    console.error("💥 Erreur lors du seed :", err);
    process.exit(1);
  }
}

seedSales();