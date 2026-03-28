import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.orderItem.deleteMany()
  await prisma.review.deleteMany()
  await prisma.order.deleteMany()
  await prisma.menuItem.deleteMany()
  await prisma.menuCategory.deleteMany()
  await prisma.table.deleteMany()
  await prisma.restaurant.deleteMany()

  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'Pizzeria da Luigi',
      address: 'Via Roma 1, 80100 Napoli NA',
      phone: '+39 081 1234567',
      email: 'info@pizzeriadaluigi.it',
      passwordHash: 'demo',
    },
  })

  for (let i = 1; i <= 8; i++) {
    await prisma.table.create({
      data: { number: i, restaurantId: restaurant.id },
    })
  }

  const pizze = await prisma.menuCategory.create({
    data: { name: 'Pizze', sortOrder: 0, restaurantId: restaurant.id },
  })

  const antipasti = await prisma.menuCategory.create({
    data: { name: 'Antipasti', sortOrder: 1, restaurantId: restaurant.id },
  })

  const bevande = await prisma.menuCategory.create({
    data: { name: 'Bevande', sortOrder: 2, restaurantId: restaurant.id },
  })

  const dolci = await prisma.menuCategory.create({
    data: { name: 'Dolci', sortOrder: 3, restaurantId: restaurant.id },
  })

  const pizzaImg = 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop'
  const pizzaImg2 = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop'
  const pizzaImg3 = 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&h=400&fit=crop'
  const bruschettaImg = 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&h=400&fit=crop'
  const capreseImg = 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600&h=400&fit=crop'
  const fritturaImg = 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&h=400&fit=crop'
  const mozzImg = 'https://images.unsplash.com/photo-1548340748-6d2b7d7da280?w=600&h=400&fit=crop'
  const insalataImg = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop'
  const colaImg = 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=600&h=400&fit=crop'
  const acquaImg = 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&h=400&fit=crop'
  const birraImg = 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600&h=400&fit=crop'
  const vinoImg = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=400&fit=crop'
  const spritzImg = 'https://images.unsplash.com/photo-1560512823-829485b8bf24?w=600&h=400&fit=crop'
  const tiramisuImg = 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=400&fit=crop'
  const pannaImg = 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=400&fit=crop'
  const cannoliImg = 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&h=400&fit=crop'
  const gelatoImg = 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&h=400&fit=crop'

  const pizzaItems = [
    { name: 'Margherita', desc: 'Pomodoro, mozzarella, basilico', price: 800, img: pizzaImg },
    { name: 'Marinara', desc: 'Pomodoro, aglio, origano', price: 700, img: pizzaImg2 },
    { name: 'Diavola', desc: 'Pomodoro, mozzarella, salame piccante', price: 950, img: pizzaImg3 },
    { name: 'Quattro Stagioni', desc: 'Pomodoro, mozzarella, funghi, prosciutto, carciofi, olive', price: 1000, img: pizzaImg },
    { name: 'Capricciosa', desc: 'Pomodoro, mozzarella, funghi, carciofi, olive, prosciutto', price: 1000, img: pizzaImg2 },
    { name: 'Prosciutto e Funghi', desc: 'Pomodoro, mozzarella, prosciutto cotto, funghi', price: 950, img: pizzaImg3 },
    { name: 'Tonno e Cipolla', desc: 'Pomodoro, mozzarella, tonno, cipolla', price: 900, img: pizzaImg },
    { name: 'Ortolana', desc: 'Pomodoro, mozzarella, verdure di stagione', price: 900, img: pizzaImg2 },
    { name: 'Bufala', desc: 'Pomodoro, mozzarella di bufala, basilico', price: 1050, img: pizzaImg3 },
    { name: 'Calzone', desc: 'Ripiena con pomodoro, mozzarella, prosciutto', price: 950, img: pizzaImg },
    { name: 'Pizza del Casale', desc: 'Salsiccia, patate, provola', price: 1100, img: pizzaImg2 },
    { name: 'Salsiccia e Friarielli', desc: 'Salsiccia, friarielli, provola', price: 1050, img: pizzaImg3 },
    { name: 'Tartufo e Porcini', desc: 'Crema di tartufo, porcini, fior di latte', price: 1300, img: pizzaImg },
    { name: 'Gorgonzola e Noci', desc: 'Gorgonzola DOP, noci, miele', price: 1000, img: pizzaImg2 },
    { name: 'Patatosa', desc: 'Pomodoro, mozzarella, patate al forno, wurstel', price: 950, img: pizzaImg3 },
  ]

  for (let i = 0; i < pizzaItems.length; i++) {
    await prisma.menuItem.create({
      data: {
        name: pizzaItems[i].name,
        description: pizzaItems[i].desc,
        price: pizzaItems[i].price,
        imageUrl: pizzaItems[i].img,
        allergens: '["glutine","lattosio"]',
        categoryId: pizze.id,
        restaurantId: restaurant.id,
        sortOrder: i,
      },
    })
  }

  const antipastiItems = [
    { name: 'Bruschetta al Pomodoro', desc: 'Pane tostato con pomodoro fresco, aglio e basilico', price: 500, img: bruschettaImg },
    { name: 'Caprese', desc: 'Mozzarella di bufala, pomodori, basilico', price: 700, allergens: '["lattosio"]', img: capreseImg },
    { name: 'Frittura di Paranza', desc: 'Pesciolini fritti misti', price: 900, img: fritturaImg },
    { name: 'Mozzarella in Carrozza', desc: 'Mozzarella fritta impanata', price: 600, allergens: '["glutine","lattosio"]', img: mozzImg },
    { name: 'Insalata Mista', desc: 'Lattuga, pomodori, carote, mais', price: 550, img: insalataImg },
  ]

  for (let i = 0; i < antipastiItems.length; i++) {
    await prisma.menuItem.create({
      data: {
        name: antipastiItems[i].name,
        description: antipastiItems[i].desc,
        price: antipastiItems[i].price,
        imageUrl: antipastiItems[i].img,
        allergens: antipastiItems[i].allergens ?? '[]',
        categoryId: antipasti.id,
        restaurantId: restaurant.id,
        sortOrder: i,
      },
    })
  }

  const bevandeItems = [
    { name: 'Coca Cola', desc: '33cl', price: 350, img: colaImg },
    { name: 'Fanta', desc: '33cl', price: 350, img: colaImg },
    { name: 'Acqua Naturale', desc: '75cl', price: 200, img: acquaImg },
    { name: 'Acqua Frizzante', desc: '75cl', price: 200, img: acquaImg },
    { name: 'Birra Peroni', desc: '33cl', price: 400, img: birraImg },
    { name: 'Birra Moretti', desc: '33cl', price: 400, img: birraImg },
    { name: 'Vino Rosso della Casa', desc: 'Calice', price: 500, img: vinoImg },
    { name: 'Vino Bianco della Casa', desc: 'Calice', price: 500, img: vinoImg },
    { name: 'Spritz', desc: 'Aperol o Campari', price: 600, img: spritzImg },
    { name: 'Limoncello', desc: 'Bicchierino', price: 400, img: vinoImg },
  ]

  for (let i = 0; i < bevandeItems.length; i++) {
    await prisma.menuItem.create({
      data: {
        name: bevandeItems[i].name,
        description: bevandeItems[i].desc,
        price: bevandeItems[i].price,
        imageUrl: bevandeItems[i].img,
        allergens: '[]',
        categoryId: bevande.id,
        restaurantId: restaurant.id,
        sortOrder: i,
      },
    })
  }

  const dolciItems = [
    { name: 'Tiramisù', desc: 'Classico con mascarpone e caffè', price: 500, allergens: '["glutine","lattosio","uova"]', img: tiramisuImg },
    { name: 'Panna Cotta', desc: 'Con coulis di frutti di bosco', price: 500, allergens: '["lattosio"]', img: pannaImg },
    { name: 'Cannoli Siciliani', desc: 'Con ricotta e gocce di cioccolato', price: 550, allergens: '["glutine","lattosio"]', img: cannoliImg },
    { name: 'Sfogliatella', desc: 'Riccia napoletana', price: 450, allergens: '["glutine","lattosio"]', img: pannaImg },
    { name: 'Gelato', desc: '3 gusti a scelta', price: 400, allergens: '["lattosio"]', img: gelatoImg },
  ]

  for (let i = 0; i < dolciItems.length; i++) {
    await prisma.menuItem.create({
      data: {
        name: dolciItems[i].name,
        description: dolciItems[i].desc,
        price: dolciItems[i].price,
        imageUrl: dolciItems[i].img,
        allergens: dolciItems[i].allergens,
        categoryId: dolci.id,
        restaurantId: restaurant.id,
        sortOrder: i,
      },
    })
  }

  console.log('Seed completato: Pizzeria da Luigi con 8 tavoli e 35 piatti')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
