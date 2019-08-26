
// Login: Checks the database for the user's email and password to Login

const userLogin = function(email, password) {
  return pool.query(`
  SELECT email, password
  FROM users
  WHERE email = $1 AND password = $2
  `, [email, password])
  .then(res => res.rows[0])
  .catch(err => console.error(null, err.stack));
}

module.exports = userLogin

// Register: Adds a user to the database

const userRegister = function(user) {
  return pool.query(`
  INSERT INTO users
  (
  name,
  email,
  password,
  phone_number
  )
  VALUES
  ($1, $2, $3, $4) RETURNING *
  `, [user.name, user.email, user.password, user.phone_number])
  .then(res => res.rows)
  .catch(err => console.error(null, err.stack));
}

module.exports = userRegister

// Menu: Lists whole menu (items, price, picture, description)

const getMenu = function(type = null) {
  let queryString = `
  SELECT *
  FROM menu_items
  `;

  if (type) {
    queryString += `WHERE type = '${type}'`;
  }

  return pool.query(queryString)
    .then(res => res.rows)
    .catch(err => console.error(null, err.stack));
 };

module.exports = getMenu

// Order Timestamp: Creates a timestamp of a user's order

const createOrderTime = function(order) {
  return pool.query(`
  INSERT INTO orders (order_time, user_id, order_id)
  SELECT orders.order_time, orders.user_id, order_details.order_id
  FROM (
    VALUES
    ($1, $2, $3)
    )
  JOIN order_details ON orders.id = order_id
  RETURNING *
  `, [order.order_time, order.user_id, order.order_id])
    .then(res => res.rows)
    .catch(err => console.error(null, err.stack));
}

module.exports = createOrderTime

// Order Details: Creates a quantity of items ordered for a user's order

const createOrderDetails = function(order) {
  return pool.query(`
  INSERT INTO order_details (quantity, user_id, order_id)
  SELECT order_details.quantity, orders.user_id, order_details.order_id
  FROM (
    VALUES
    ($1, $2, $3)
    )
  JOIN orders ON orders.id = order_id
  RETURNING *
  `, [order.quantity, order.user_id, order.order_id])
  .then(res => res.rows)
  .catch(err => console.error(null, err.stack));
}

module.exports = createOrderDetails

// Insert users credit card information

const usersCreditCard = function(card) {
  return pool.query(`
  INSERT INTO users (credit_card_number, card_expiry_date, card_security_code)
  VALUES ($1, $2, $3)
  RETURNING *
  `, [card.credit_card_number, card.card_expiry_date, card.card_security_code])
  .then(res => res.rows)
  .catch(err => console.error(null, err.stack));
}

module.exports = usersCreditCard

// Insert credit card information into orders table from users

const ordersCreditCard = function (card) {
  return pool.query(`
  INSERT INTO orders (credit_card_number, card_expiry_date, card_security_code)
  SELECT users.credit_card_number, users.card_expiry_date, users.card_security_code
  FROM (
    VALUES
    ($1, $2, $3)
  )
  JOIN users ON users.id = user_id
  RETURNING *
  `, [card.credit_card_number, card.card_expiry_date, card.card_security_code])
  .then(res => res.rows)
  .then(err => console.error(null, err.stack));
}

module.exports = ordersCreditCard

// Purchase Price: Creates a record of price paid for each item

const createPurchasePrice = function(userid) {
  return pool.query(`
  INSERT INTO order_details (purchase_price) SELECT menu_items.price
  FROM users
  JOIN orders ON users.id = user_id
  JOIN order_details ON orders.id = order_details.order_id
  JOIN menu_items ON menu_items.id on order_details.menu_item_id
  WHERE users.id = $1
  RETURNING *
  `, [userid])
  .then(res => res.rows)
  .catch(err => console.error(null, err.stack));
}

module.exports = createPurchasePrice

// Total Price: Gets the total PURCHASE price for an order (PAST/PRESENT)

const totalPurchasePrice = function() {
  return pool.query(`
  SELECT (purchase_price * quantity) as total_purchase_price
  FROM order_details
  `)
  .then(res => res.rows[0])
  .catch(err => console.error(null, err.stack));
}

module.exports = totalPurchasePrice

// Total Price: Gets the total price for an order (PRESENT)

const totalPrice = function() {
  return pool.query(`
  SELECT (menu_items.price * quantity) as total_price
  FROM order_details
  JOIN menu_items ON menu_items.id = menu_item_id
  `)
}

module.exports = totalPrice

// Order History: Shows order history (Menu Item, Purchase Price, Quantity, Total Price, Timestamp)

const userOrderHistory = function(id) {
  return pool.query(`
  SELECT
    orders.id,
    orders.order_time,
    order_details.purchase_price,
    order_details.quantity,
    (order_details.purchase_price * order_details.quantity) as total_price,
    menu_items.item
  FROM orders
  INNER JOIN order_details ON orders.id = order_details.order_id
  INNER JOIN menu_items ON menu_items.id = order_details.menu_item_id
  WHERE orders.user_id = $1
  `, [id])
  .then(res => res.rows)
  .catch(err => console.error(null, err.stack));
}

module.exports = userOrderHistory
