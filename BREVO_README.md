# 📧 Brevo Email OTP Integration - README

## 🎯 Overview

This implementation replaces Gmail SMTP with **Brevo (Sendinblue) REST API** for sending OTP verification emails in the BookBarn application.

---

## ✨ Features

- ✅ **Brevo REST API Integration** - No SMTP firewall issues
- ✅ **OTP Hashing with BCrypt** - Secure storage
- ✅ **5-Minute Expiry** - Time-limited OTPs
- ✅ **Beautiful HTML Emails** - Professional templates
- ✅ **Production Ready** - Deployed on Railway
- ✅ **Error Handling** - Graceful fallbacks

---

## 📁 Modified Files

```
bookapp/
├── pom.xml                          # Added OkHttp dependency
├── src/main/resources/
│   └── application.properties       # Brevo API configuration
└── src/main/java/com/example/book/service/
    └── EmailService.java            # Complete Brevo integration
```

---

## 🚀 Quick Setup

### 1. Get Brevo API Key

```
1. Sign up: https://app.brevo.com/account/register
2. Go to: Settings → SMTP & API → API Keys
3. Create key: "BookBarn-Production"
4. Copy key (starts with xkeysib-)
```

### 2. Verify Sender Email

```
1. Go to: Senders → Domains & Addresses
2. Add: saibittu594@gmail.com
3. Click verification link in email
```

### 3. Set Environment Variables

**Railway:**
```
BREVO_API_KEY=xkeysib-your-key-here
BREVO_SENDER_EMAIL=saibittu594@gmail.com
BREVO_SENDER_NAME=BookBarn
```

**Local (PowerShell):**
```powershell
$env:BREVO_API_KEY="xkeysib-your-key-here"
$env:BREVO_SENDER_EMAIL="saibittu594@gmail.com"
$env:BREVO_SENDER_NAME="BookBarn"
```

### 4. Deploy

```bash
git add .
git commit -m "Implement Brevo email API"
git push
```

---

## 🔧 API Endpoints

### Send Registration OTP
```http
POST /otp/send-registration
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Send Password Reset OTP
```http
POST /otp/send-reset
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Verify OTP
```http
POST /otp/verify
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

### Resend OTP
```http
POST /otp/resend
Content-Type: application/json

{
  "email": "user@example.com",
  "purpose": "Registration"
}
```

---

## 🔐 Security

### OTP Hashing
```java
// OTPs are hashed before storage
String hashedOTP = passwordEncoder.encode(otp);
otpStore.put(email, new OTPData(hashedOTP, expiryTime));
```

### Verification
```java
// Verification uses BCrypt matching
if (passwordEncoder.matches(otp, data.getHashedOtp())) {
    // OTP is valid
}
```

### Expiry
```java
// OTPs expire after 5 minutes
LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(5);
```

---

## 📊 Brevo Free Tier

- **300 emails/day** (forever free)
- Unlimited contacts
- Full API access
- Email analytics
- HTML templates

---

## 🐛 Troubleshooting

### Email Not Sent

**Check:**
1. Environment variables are set
2. API key is valid
3. Sender email is verified
4. Brevo dashboard → Email Activity

**Logs:**
```
✅ OTP sent successfully to: user@example.com
❌ Failed to send OTP email to: user@example.com
🔐 OTP (for testing): 123456
```

### OTP Verification Fails

**Reasons:**
- OTP expired (5 minutes)
- Wrong OTP entered
- OTP already used

**Solution:**
- Request new OTP
- Check console logs (development)
- Verify email matches

---

## 📖 Documentation

- **BREVO_SETUP_COMPLETE.md** - Full setup guide
- **IMPLEMENTATION_SUMMARY.md** - Quick summary
- **railway-env-template.txt** - Environment variables

---

## 🎯 Testing

### Local Testing
```bash
# Set environment variables
$env:BREVO_API_KEY="xkeysib-your-key"
$env:BREVO_SENDER_EMAIL="saibittu594@gmail.com"
$env:BREVO_SENDER_NAME="BookBarn"

# Run application
cd c:\Users\heman\Downloads\project\bookapp
mvnw spring-boot:run

# Test endpoint
curl -X POST http://localhost:8080/otp/send-registration \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Production Testing
```bash
# Test from Railway deployment
curl -X POST https://your-app.up.railway.app/otp/send-registration \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

## 📞 Support

- **Brevo Docs**: https://developers.brevo.com/
- **API Reference**: https://developers.brevo.com/reference/sendtransacemail
- **Dashboard**: https://app.brevo.com/
- **Support**: https://help.brevo.com/

---

## ✅ Checklist

- [ ] Brevo account created
- [ ] API key obtained
- [ ] Sender email verified
- [ ] Environment variables set (Railway)
- [ ] Code pushed to Railway
- [ ] Tested from Netlify frontend
- [ ] Email received successfully
- [ ] OTP verification works

---

## 🎉 Success Criteria

After setup, you should see:

1. ✅ Beautiful HTML emails in inbox
2. ✅ 6-digit OTP code displayed
3. ✅ OTP verification succeeds
4. ✅ OTP expires after 5 minutes
5. ✅ Email delivery tracked in Brevo
6. ✅ No firewall/connection errors

---

**Setup Time: ~15 minutes**  
**Free Tier: 300 emails/day**  
**Production Ready: ✅ Yes**

---

Made with ❤️ for BookBarn
