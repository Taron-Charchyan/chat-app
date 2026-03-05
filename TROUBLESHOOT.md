# Registration Debugging Guide

## Step 1: Check Server is Running
Try visiting: http://localhost:5000/health

You should see:
```json
{
  "status": "Server is running",
  "timestamp": "...",
  "mongodb": "Connected (if no error above)"
}
```

## Step 2: Check Browser Console
1. Open http://localhost:5173 in your browser
2. Press F12 to open DevTools
3. Click "Console" tab
4. Go to Register page
5. Fill in the form with:
   - Username: Test
   - Email: test@test.com
   - Password: Test@123
   - Confirm Password: Test@123
6. Click Register button
7. Watch the console - you should see messages like:
   - "Register form submitted"
   - "Sending registration request with: {...}"
   - Or error messages

## Step 3: Check Network Tab (F12 > Network)
1. With DevTools open, click Network tab
2. Try to register again
3. Look for POST request to: `http://localhost:5000/api/auth/register`
4. Click that request to see:
   - Request body (should have username, email, password)
   - Response status (200 = success, 4xx/5xx = error)
   - Response body (what the server sent back)

## Step 4: Common Issues & Fixes

### Issue: Network request not being made
- **Solution**: Check if the button click is working - add this to Register.jsx button:
  ```jsx
  onClick={() => console.log('Button clicked')}
  ```

### Issue: Network request shows 500 error
- **Solution**: MongoDB connection failed. Check:
  - server/.env has correct MONGO_URI
  - MongoDB Atlas cluster is active
  - IP whitelist is configured (allow 0.0.0.0/0 for development)
  - Connection string password is URL-encoded if it has special chars

### Issue: Network request shows CORS error
- **Solution**: Server CORS is not enabling the endpoint. This shouldn't happen with current setup, but if it does:
  - Restart the server
  - Run: `npm install cors` in server folder

### Issue: Network request shows 400 error
- **Solution**: Check response body for error message:
  - "User already exists" - try different email/username
  - "Invalid email format" - use proper email format
  - "Please provide all required fields" - make sure all inputs are filled

### Issue: No response/timeout
- **Solution**: 
  - Check if server is actually running: `npm run server`
  - Check terminal output for errors
  - Try http://localhost:5000/health in browser

## Step 5: Enable More Logging

### Server-side
1. Open server/server.js
2. Add this after line 37 (after middleware setup):
   ```javascript
   app.use((req, res, next) => {
     console.log(`${req.method} ${req.path}`, req.body);
     next();
   });
   ```
3. Restart server - now you'll see all requests in terminal

### Client-side
1. Open browser console (F12)
2. All relevant log messages are already added
3. Look for "Register form submitted", "Sending registration request", etc.

## Step 6: Test API Directly (Advanced)

Open terminal and test the registration endpoint:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"Test","email":"test@test.com","password":"Test@123"}'
```

Expected response on success:
```json
{
  "token": "...",
  "user": {
    "id": "...",
    "username": "Test",
    "email": "test@test.com"
  }
}
```

## Step 7: Clear Data & Try Again

If you've already registered successfully:
1. The second attempt will fail with "User already exists"
2. Try with different email: test2@test.com
3. Or clear MongoDB:
   - Go to MongoDB Atlas dashboard
   - Delete and recreate the database

## Need More Help?

Check these files have no errors:
- server/server.js (starts without error)
- client/.env (has VITE_API_URL=http://localhost:5000)
- server/.env (has valid MONGO_URI and JWT_SECRET)

Run in the root folder:
```bash
npm run dev
```

Both server and client should start without errors in the terminal.
