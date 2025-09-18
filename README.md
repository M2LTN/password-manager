# 🔐 Password Manager  

A **secure password manager prototype** built with **Node.js, Express, MySQL, and EJS**.  
Designed as a SaaS-style portfolio project with **user authentication, paywall plans, and a clean UI** inspired by modern password managers (like NordPass & LastPass).  

---

## ✨ Features  

- 👤 **User Authentication**  
  - Register, login, logout  
  - Session-based auth stored in MySQL  
  - Passwords hashed with **bcrypt**  

- 🔑 **Password Vault**  
  - Add and view saved passwords  
  - Each password linked to its user account  
  - Responsive, modern UI built with **Bootstrap 5**  

- 💸 **Paywall Plans**  
  - **Free plan:** Max 5 saved passwords  
  - **Personal plan:** Unlimited passwords  
  - **Business plan:** Paid-only tier  

- 🔒 **Security Best Practices**  
  - Credentials hidden in `.env`  
  - Hashed passwords (no plaintext storage)  
  - Helmet for HTTP security headers  
  - Escaped templates (XSS-safe)  

---

## 🛠️ Tech Stack  

- **Backend:** Node.js, Express  
- **Database:** MySQL + mysql2  
- **Templating:** EJS  
- **Frontend:** Bootstrap 5  
- **Auth & Security:** bcrypt, express-session, helmet  
- **Environment Config:** dotenv  

---

## 📂 Project Structure  

```
PASS/
│── node_modules/          
│── public/                 # static assets
│── views/                  # EJS templates
│   ├── welcome.ejs         # public landing page
│   ├── register.ejs        # user registration
│   ├── login.ejs           # login form
│   └── index.ejs           # dashboard (password vault)
│── server.js               # main Express app
│── test.js                 # health check script
│── .env                    # environment variables
│── .gitignore
│── package.json
```

---

## ⚡ Getting Started  

### 1. Clone repo & install dependencies  
```bash
git clone https://github.com/M2LTN/password-manager.git
cd password-manager
npm install
```

### 2. Configure `.env`  
```env
DB_USER=root
DB_PASS=***
DB_NAME=password_manager
```

### 3. Setup MySQL  
```sql
CREATE DATABASE password_manager;
USE password_manager;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  role ENUM('free','personal','business') DEFAULT 'free'
);

CREATE TABLE passwords (
  id INT AUTO_INCREMENT PRIMARY KEY,
  service VARCHAR(255),
  username VARCHAR(255),
  password VARCHAR(255),
  user_id INT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 4. Run the app  
```bash
node server.js
```
Visit 👉 [http://localhost:3000](http://localhost:3000)  

---

## 🧪 Testing  

Run health check script:  
```bash
node test.js
```

This checks:  
- `.env` variables loaded  
- Database connection works  
- Required tables exist  
- Server responds correctly  

---
## 🚀 Future Improvements  

- 🔐 Password encryption (AES) instead of hashing only  
- 💳 Real payment integration (Stripe/PayPal)  
- 📱 Mobile-friendly design with advanced UI  
- 👥 Team/organization management for business plan  

---

## 📜 License  

MIT License © 2025 — Built for portfolio showcase  