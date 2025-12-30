# 📝 TaskMaster – SaaS To-Do List App with Auth & Payments

TaskMaster is a simple yet fully functional To-Do List (TDL) web application built with **Vite.js** (React), featuring:

> ⚠️ Please note that this project has been paused by Supabase because it was inactive, so authentication is no longer available.
 
- ✅ **User Authentication** via [Supabase](https://supabase.com)
- 💳 **Premium Subscription System** via [Stripe](https://stripe.com)
- 🗂️ **User-specific persistent data storage**
- 🌐 **Deployed on Vercel**
- 🔁 **Stripe ↔ Supabase Integration via Webhooks & Supabse Edge Functions**

This project demonstrates the implementation of a **complete SaaS architecture**: authentication, user-specific data, payment flow, and subscription management — and serves as a boilerplate for other use cases.

---

## 🚀 Features

- **Sign up / Sign in** using Supabase Auth
- **User-specific todos list** stored securely in Postgres DB (Supabase)
- **Stripe Checkout** for one-click subscription purchase
- **Stripe Customer Portal** to update or cancel subscriptions
- **Stripe Webhooks + Supabase Edge Functions** send user subscription datas in the DB
- **Access control**: Only premium users can use the app (arbitrary business plan xd)
- **Deployed on Vercel** for fast and easy access

---

## 💡 Why this project?

> While TDL is a basic app idea, the goal here is to prove out:
> 
> - 🔐 Secure user management  
> - 💰 Working payments flow  
> - 🧠 Clean SaaS app logic (auth + subscriptions)
>
> This exact pattern can be reused for **more useful SaaS products**.
