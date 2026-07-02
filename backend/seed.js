const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MenuItem = require('./models/MenuItem');

dotenv.config();

const seedData = [
  {
    name: 'Classic Burger',
    description: 'Juicy beef patty with lettuce, tomato, and our special sauce.',
    price: 149,
    category: 'Mains',
    image: '/images/burger.png',
    customizations: [
      { name: 'Remove', options: ['Lettuce', 'Tomato', 'Sauce', 'Onions'] },
      { name: 'Add-ons', options: ['Extra Cheese', 'Bacon', 'Avocado'] },
      { name: 'Doneness', options: ['Rare', 'Medium Rare', 'Medium', 'Medium Well', 'Well Done'] }
    ]
  },
  {
    name: 'Margherita Pizza',
    description: 'Fresh mozzarella, tomato sauce, and basil.',
    price: 249,
    category: 'Mains',
    image: '/images/margherita.png',
    customizations: [
      { name: 'Size', options: ['Small', 'Medium', 'Large'] },
      { name: 'Crust', options: ['Regular', 'Thin Crust', 'Gluten Free'] },
      { name: 'Add-ons', options: ['Extra Cheese', 'Olives', 'Mushrooms', 'Pepperoni'] }
    ]
  },
  {
    name: 'Paneer Tikka Pizza',
    description: 'Spicy paneer chunks, onion, capsicum, and mozzarella.',
    price: 299,
    category: 'Mains',
    image: '/images/paneer_tikka.png',
    customizations: [
      { name: 'Size', options: ['Small', 'Medium', 'Large'] },
      { name: 'Crust', options: ['Regular', 'Thin Crust', 'Cheese Burst'] },
      { name: 'Spice Level', options: ['Mild', 'Medium', 'Spicy'] }
    ]
  },
  {
    name: 'Farmhouse Pizza',
    description: 'Onion, crisp capsicum, mushroom, and fresh tomato.',
    price: 279,
    category: 'Mains',
    image: '/images/farmhouse.png',
    customizations: [
      { name: 'Size', options: ['Small', 'Medium', 'Large'] },
      { name: 'Crust', options: ['Regular', 'Thin Crust', 'Cheese Burst'] }
    ]
  },
  {
    name: 'Caesar Salad',
    description: 'Crisp romaine, parmesan, croutons, and Caesar dressing.',
    price: 199,
    category: 'Starters',
    image: '/images/salad.png',
    customizations: [
      { name: 'Add-ons', options: ['Extra Chicken', 'Extra Croutons'] },
      { name: 'Dressing', options: ['On the side', 'Light dressing', 'Extra dressing'] }
    ]
  },
  {
    name: 'French Fries',
    description: 'Crispy golden fries.',
    price: 99,
    category: 'Sides',
    image: '/images/fries.png',
    customizations: [
      { name: 'Size', options: ['Small', 'Large'] },
      { name: 'Style', options: ['Salted', 'Cajun Spiced', 'Truffle Parmesan'] }
    ]
  },
  {
    name: 'Coca Cola',
    description: 'Refreshing cola drink.',
    price: 59,
    category: 'Beverages',
    image: '/images/coke.png',
    customizations: [
      { name: 'Size', options: ['Small', 'Medium', 'Large'] },
      { name: 'Ice', options: ['Regular Ice', 'Less Ice', 'No Ice'] }
    ]
  }
];

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Seeding database...');
    await MenuItem.deleteMany({});
    await MenuItem.insertMany(seedData);
    console.log('Database seeded successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error seeding database:', err);
    process.exit(1);
  });
