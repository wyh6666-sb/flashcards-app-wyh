# Project structure

```
flashcard-app/
├── backend/
│   ├── config/db.js         
│   ├── middleware/auth.js   
│   ├── routes/
│   │   ├── auth.js         
│   │   ├── decks.js          
│   │   ├── flashcards.js    
│   │   ├── history.js      
│   │   └── admin.js         
│   ├── server.js
│   ├── seed.js               
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── index.html            
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api.js
│       ├── auth.jsx        
│       ├── styles.css
│       └── components/
│           ├── AuthView.jsx
│           ├── Navbar.jsx
│           ├── DashboardView.jsx
│           ├── StudyView.jsx
│           ├── HistoryView.jsx
│           ├── AdminView.jsx
│           └── Modal.jsx
├── database/
│   └── schema.sql          
└── README.md
```

## Quick Start

### 1. Set up MySQL

Make sure change the DB_PASSWORD=0128 in .env.example "0128" to your own sql root password
Make sure MySQL ≥ 8 is running locally. Create the database and tables:

```bash
mysql -u root -p < database/schema.sql
```


### 2. Backend

```bash
cd backend
cp .env.example .env       
npm install
npm run seed               
npm start               
```


### 3. Frontend

```bash
cd frontend
npm install
npm run dev              
```

Open <http://localhost:5173>

### Demo accounts (after `npm run seed`)

| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | admin |
| `wyh` | `wyh123` | user |

