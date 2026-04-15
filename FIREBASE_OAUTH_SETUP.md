# Firebase OAuth Setup for Local Development

## ⚠️ Current Errors

1. **`auth/unauthorized-domain`** - localhost:3000 is not authorized for Google OAuth
2. **Message channel error** - Likely Chrome extension interference
3. **Browser console warning** - Firebase needs authorized domain config

---

## ✅ **REQUIRED FIX: Add localhost to Firebase**

This is the official solution from Firebase:

### Step-by-Step:

1. **Open Firebase Console:**
   - URL: https://console.firebase.google.com/

2. **Select Your Project:**
   - Project: `gen-lang-client-0998131570`

3. **Navigate to Authentication Settings:**
   - Left sidebar: **Authentication**
   - Settings tab (gear icon)
   - **Authorized domains** section

4. **Add localhost:**
   - Click **Add domain**
   - Enter: `localhost:3000`
   - Click **Save**

5. **Wait 1-2 minutes** for Firebase to propagate changes

6. **Refresh your localhost:3000** and try Google login again

---

## 🛠️ **Troubleshooting**

### If Google Login Still Fails:

**Option A: Use Email/Password Login**
- Create test account with email
- Use that to test other features
- Come back to OAuth after Firebase updates

**Option B: Disable Browser Extensions**
- Open Chrome in incognito mode (no extensions)
- Or use Firefox/Safari temporarily

**Option C: Use Mock Dev Login**
- Already added `src/lib/devAuth.ts` for development
- Can be integrated into LoginPage if needed

---

## ✨ **Advanced: Configure Multiple Domains**

For production, you'll need to add:
- `yourdomain.com`
- `www.yourdomain.com`
- `api.yourdomain.com` (if separate)

Same process in Firebase → Authentication → Settings → Authorized domains

---

## 📱 **How Google OAuth Works**

1. **Frontend calls** `signInWithPopup(auth, googleProvider)`
2. **Firebase redirects** to Google login
3. **Google checks** if caller domain is authorized
4. **If authorized**: Returns login token
5. **If NOT authorized**: Error `auth/unauthorized-domain`

Adding localhost tells Firebase: "It's okay to accept requests from localhost:3000"

---

## ✅ **After Adding localhost in Firebase**

Your app features will work:
- ✅ Google login via popup
- ✅ User profile creation
- ✅ Admin authentication
- ✅ Role-based access (admin, editor, user)

---

## 🚀 **Quick Testing Checklist**

After adding localhost to Firebase:

- [ ] Refresh http://localhost:3000
- [ ] Click "Google के साथ साइन अप गर्नुहोस्" button
- [ ] Approve the localhost permission
- [ ] Should redirect to profile or admin dashboard
- [ ] Check browser console for any errors

---

**Status:** ⏳ Waiting for Firebase to authorize localhost

Once authorized, you can proceed with Phase 2 enhancements!
