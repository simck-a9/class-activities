const express = require('express');
const session = require('express-session');
const path = require('path');
const ejsMate = require('ejs-mate'); // Import ejs-mate

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

app.engine('ejs', ejsMate); // Set ejs-mate as the engine for .ejs files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'productappsecret',
  resave: false,
  saveUninitialized: true
}));

function requireLogin(req, res, next) {
  if (req.session && req.session.loggedIn) {
    next();
  } else {
    res.redirect('/login');
  }
}

app.get('/', (req, res) => {
  if (req.session && req.session.loggedIn) {
    res.redirect('/product');
  } else {
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  res.render('login', { title: 'Login', error: null });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'user@company.com' && password === 'product') {
    req.session.loggedIn = true;
    res.redirect('/product');
  } else {
    res.render('login', { title: 'Login', error: 'Invalid credentials' });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.get('/product', requireLogin, (req, res) => {
  // Example: Read images from public/images and send as products
  const fs = require('fs');
  const imagesDir = path.join(__dirname, 'public', 'images');
  let products = [];
  try {
    const files = fs.readdirSync(imagesDir);
    products = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f)).map(f => ({
      image: f,
      caption: f.split('.').slice(0, -1).join('.').replace(/[_-]/g, ' ')
    }));
  } catch (e) {}
  res.render('product', { title: 'Product', products });
});

app.get('/add-product', requireLogin, (req, res) => {
  res.render('add-product', { title: 'Add Product' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});