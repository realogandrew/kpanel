# Running MongoDB locally

Use this if you're not using Docker or MongoDB Atlas. The KPanel API expects MongoDB on **localhost:27017** by default (or set `MONGO_URI` in `apps/kpanel-api/.env`).

## macOS (Homebrew)

### 1. Install MongoDB

```bash
brew tap mongodb/brew
brew install mongodb-community
```

### 2. Start MongoDB

**Option A – run in the foreground (stays in terminal):**
```bash
mongod --config /opt/homebrew/etc/mongod.conf
```
*(On Intel Macs the config path is often `/usr/local/etc/mongod.conf`.)*

**Option B – run as a service (starts on login, runs in background):**
```bash
brew services start mongodb-community
```

To stop the service later:
```bash
brew services stop mongodb-community
```

### 3. Confirm it’s running

MongoDB listens on port **27017**. You should see the API log something like:

`[db] Connected to MongoDB`

when you run `npm run dev` and the API starts.

---

## Windows

1. Download the **Community Server** MSI from [MongoDB Download Center](https://www.mongodb.com/try/download/community).
2. Run the installer and choose “Complete.” Optionally install **MongoDB Compass** (GUI).
3. MongoDB usually installs as a Windows Service and starts automatically. If not, start it from **Services** or run `mongod` from the install directory (e.g. `C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe`).

---

## Linux (Ubuntu/Debian)

```bash
# Import the MongoDB public key and add the repo
wget -qO- https://www.mongodb.org/static/pgp/server-7.0.asc | sudo tee /etc/apt/trusted.gpg.d/mongodb.asc
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

sudo apt update
sudo apt install -y mongodb-org

# Start the service
sudo systemctl start mongod
sudo systemctl enable mongod   # start on boot
```

---

## Connection string

Default in KPanel (no `.env` override):

- **URI:** `mongodb://localhost:27017/kpanel`
- **Database name:** `kpanel`

To use a different host/port or database, set in `apps/kpanel-api/.env`:

```bash
MONGO_URI=mongodb://localhost:27017/your_db_name
```
