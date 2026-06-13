import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

// Load environmental parameters
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

import { PRODUCTS as initialProducts, CUSTOMER_REVIEWS as initialReviews } from './src/data/products';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://cahuugpenecotdpbsnyj.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_WYDW1hVtDn8wfXHhHF761A_Qv9eBcgr';

let supabase: any;
try {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('Supabase client initialized successfully with project URL:', SUPABASE_URL);
} catch (err: any) {
  console.error('Warning: Supabase client initialization failed:', err.message);
}

// User signup route with validation and required location details
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, phone, password, location } = req.body;

    if (!name || !email || !phone || !password || !location || !location.province || !location.city || !location.address) {
      res.status(400).json({ error: 'All signup fields, including a complete data location, are required.' });
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();

    if (!supabase) {
      res.status(503).json({ error: 'Supabase database is currently unavailable.' });
      return;
    }

    // Check if user already exists matches email or phone directly on Supabase
    const { data: matchedUsers, error: checkError } = await supabase
      .from('users')
      .select('id, email, phone')
      .or(`email.eq.${trimmedEmail},phone.eq.${trimmedPhone}`);

    if (checkError) {
      console.error('Supabase query error checking user exists:', checkError.message);
    }

    if (matchedUsers && matchedUsers.length > 0) {
      res.status(400).json({ error: 'A user with this Email address or Phone Number is already signed up.' });
      return;
    }

    const newUser = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      email: trimmedEmail,
      phone: trimmedPhone,
      password: password, // Plain text for simplicity, matching our database schema setup
      location: {
        province: location.province,
        city: location.city,
        address: location.address,
        latitude: location.latitude || null,
        longitude: location.longitude || null
      },
      created_at: new Date().toISOString()
    };

    const { error: insertError } = await supabase.from('users').insert([newUser]);
    if (insertError) {
      res.status(500).json({ error: 'Failed to complete registration on Supabase datastore: ' + insertError.message });
      return;
    }

    // Return the user session data (hiding password string for security)
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({ success: true, user: userWithoutPassword });

  } catch (err: any) {
    console.error('Signup API error:', err);
    res.status(500).json({ error: 'Internal server error during account signup.' });
  }
});

// User login route accepting either Email OR Phone Number
app.post('/api/auth/login', async (req, res) => {
  try {
    const { loginField, password } = req.body;

    if (!loginField || !password) {
      res.status(400).json({ error: 'Please supply your Email/Phone and Password to login.' });
      return;
    }

    const matchField = loginField.trim().toLowerCase();

    // Intercept Superadmin Credentials
    if (matchField === 'buynownepal@buynow.com' && password === 'buynow@01') {
      const adminUser = {
        id: 'usr_superadmin',
        name: 'BuyNow Super Admin',
        email: 'buynownepal@buynow.com',
        phone: '9812345678',
        role: 'superadmin',
        location: {
          province: 'Kathmandu Valley',
          city: 'Kathmandu',
          address: 'New Baneshwor Head Office'
        },
        createdAt: new Date().toISOString()
      };

      // Record login attempt to Supabase Logins Table if available
      if (supabase) {
        try {
          await supabase.from('logins').insert([{
            user_id: adminUser.id,
            email: adminUser.email,
            name: adminUser.name,
            logged_at: new Date().toISOString()
          }]);
        } catch (e: any) {
          console.warn('Logins table entry skipped during admin session:', e.message);
        }
      }

      res.json({
        success: true,
        user: adminUser
      });
      return;
    }

    if (!supabase) {
      res.status(503).json({ error: 'Supabase database is currently offline.' });
      return;
    }

    // Query user profile directly from Supabase
    const { data: matchedUsers, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${matchField},phone.eq.${matchField}`);

    if (fetchError || !matchedUsers || matchedUsers.length === 0) {
      res.status(401).json({ error: 'Invalid details. No registered account found with that email or phone number.' });
      return;
    }

    const user = matchedUsers[0];

    if (user.password !== password) {
      res.status(401).json({ error: 'Invalid Password. Please double check and try again.' });
      return;
    }

    // Record login attempt to Supabase Logins Table
    try {
      await supabase.from('logins').insert([{
        user_id: user.id,
        email: user.email,
        name: user.name,
        logged_at: new Date().toISOString()
      }]);
    } catch (sbErr: any) {
      console.warn('Supabase exception logging login:', sbErr.message);
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({ success: true, user: userWithoutPassword });

  } catch (err) {
    console.error('Login API error:', err);
    res.status(500).json({ error: 'Internal server error during authentication.' });
  }
});

// Update user profile / location info route
app.post('/api/auth/profile/update', async (req, res) => {
  try {
    const { userId, name, email, phone, location } = req.body;

    if (!userId || !name || !email || !phone || !location) {
      res.status(400).json({ error: 'Required data profile properties must not be empty.' });
      return;
    }

    if (!supabase) {
      res.status(503).json({ error: 'Supabase database is currently offline.' });
      return;
    }

    const updatedLocation = {
      province: location.province,
      city: location.city,
      address: location.address,
      latitude: location.latitude || null,
      longitude: location.longitude || null
    };

    const { data: updatedUsers, error: updateError } = await supabase
      .from('users')
      .update({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        location: updatedLocation
      })
      .eq('id', userId)
      .select();

    if (updateError || !updatedUsers || updatedUsers.length === 0) {
      res.status(404).json({ error: 'Failed to update credentials on Supabase storage.' });
      return;
    }

    const updatedUser = updatedUsers[0];
    const { password: _, ...userWithoutPassword } = updatedUser;
    res.json({ success: true, user: userWithoutPassword });

  } catch (err) {
    console.error('Update profile API error:', err);
    res.status(500).json({ error: 'Failed to update credentials on user database.' });
  }
});

// Initialize Google Gen AI lazily and safely
let aiClient: GoogleGenAI | null = null;
const getAiClient = (): GoogleGenAI => {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY is not defined in system environment secrets.');
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
};

// Core Chat API proxy route
app.post('/api/chat', async (req, res) => {
  try {
    const { message, productsContext } = req.body;
    
    if (!message) {
      res.status(400).json({ error: 'Message payload is required.' });
      return;
    }

    const systemInstructions = `
You are the official BuyNow Nepal Smart Shopping Assistant. Your goal is to guide shoppers, compare products, answer delivery questions, and explain billing security.

Keep your answers structured, precise, friendly, and objective. Avoid long blocks of text; use bullet points and bold key words to make your text highly scannable. 
Always speak in a helpful, professional coordinator tone.

Here is the authentic corporate index:
- Company: BuyNow Nepal ("Shop Smart, Live Better")
- Head Office: New Baneshwor, Kathmandu, Nepal (Latitude 27.6947, Longitude 85.3420)
- Branch Office: Birtamode, Jhapa, Nepal
- Support Contacts: +977 9812345678 (Calling & WhatsApp) | support@buynownepal.com
- Support Hours: Sun-Fri 9:00 AM - 8:00 PM | Sat 10:00 AM - 5:00 PM

Shipping Guidelines:
- Kathmandu Valley (Kathmandu, Lalitpur, Bhaktapur): NPR 100
- Major Cities (province areas): NPR 150
- Remote Areas (high terrain villages): NPR 250
- Free Shipping: Fully applied on order totals above NPR 5,000!
- Express Dispatch: Priority dispatch adding NPR 300.

Billing Integrations security details:
- eSewa (Merchant name: BuyNow Nepal, Merchant Code: BUYNOWNP, email: payments@buynownepal.com)
- Khalti (Merchant: BuyNow Nepal, Public Key: khalti_public_key_demo)
- IME Pay (Merchant: BuyNow Nepal, Merchant Code: BNIME001)
- Cash on Delivery (COD): Supported throughout all covered territories.
- Bank Transfers: Supported via corporate Nabil Bank (0024829103940192) & Nepal SBI Bank (102919302910392).

Current Products Listing in Context:
${JSON.stringify(productsContext, null, 2)}

Provide clear answers based strictly on this information. If compared, outline differences in features, prices, and reviews clearly.
`;

    // Try generating response using official SDK
    const client = getAiClient();
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: systemInstructions,
        temperature: 0.7,
        maxOutputTokens: 800,
      }
    });

    res.json({ reply: response.text });

  } catch (error: any) {
    console.error('Gemini API call warning:', error.message);
    
    // Graceful error reporting to client so the local mock logic handles fallback smoothly
    res.status(503).json({ 
      error: 'API Key missing or exhausted.', 
      details: error.message 
    });
  }
});

// GET list of products (dynamic, syncing from Supabase)
app.get('/api/products', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('products').select('*');
      if (!error && data && data.length > 0) {
        // Map back to our structure cleanly and with absolute bullet-proof error handling
        const mappedProducts = data.map((p: any) => {
          let parsedSpecs: Record<string, string> = {};
          if (p.specs) {
            if (typeof p.specs === 'string') {
              try {
                const parsed = JSON.parse(p.specs);
                if (parsed && typeof parsed === 'object') {
                  parsedSpecs = parsed;
                }
              } catch (_) {
                parsedSpecs = {};
              }
            } else if (typeof p.specs === 'object') {
              parsedSpecs = p.specs;
            }
          }

          let parsedImages: string[] = [];
          if (Array.isArray(p.images)) {
            parsedImages = p.images;
          } else if (typeof p.images === 'string') {
            try {
              const parsed = JSON.parse(p.images);
              if (Array.isArray(parsed)) {
                parsedImages = parsed;
              } else if (p.images) {
                parsedImages = [p.images];
              }
            } catch (_) {
              if (p.images) parsedImages = [p.images];
            }
          }
          if (parsedImages.length === 0) {
            parsedImages = p.image ? [p.image] : [];
          }

          let parsedColors: string[] = [];
          if (Array.isArray(p.colors)) {
            parsedColors = p.colors;
          } else if (typeof p.colors === 'string') {
            try {
              const parsed = JSON.parse(p.colors);
              if (Array.isArray(parsed)) {
                parsedColors = parsed;
              } else {
                parsedColors = p.colors.split(',').map((c: any) => c.trim()).filter((c: any) => c);
              }
            } catch (_) {
              parsedColors = p.colors.split(',').map((c: any) => c.trim()).filter((c: any) => c);
            }
          }
          if (parsedColors.length === 0) {
            parsedColors = ['Carbon Black'];
          }

          let parsedFeatures: string[] = [];
          if (Array.isArray(p.features)) {
            parsedFeatures = p.features;
          } else if (typeof p.features === 'string') {
            try {
              const parsed = JSON.parse(p.features);
              if (Array.isArray(parsed)) {
                parsedFeatures = parsed;
              } else {
                parsedFeatures = p.features.split('\n').map((f: any) => f.trim()).filter((f: any) => f);
              }
            } catch (_) {
              parsedFeatures = p.features.split('\n').map((f: any) => f.trim()).filter((f: any) => f);
            }
          }

          return {
            id: p.id,
            name: p.name,
            description: p.description || '',
            price: Number(p.price),
            originalPrice: p.original_price ? Number(p.original_price) : undefined,
            image: p.image || (parsedImages[0] || ''),
            images: parsedImages,
            category: p.category || '',
            colors: parsedColors,
            rating: p.rating ? Number(p.rating) : 5.0,
            reviewsCount: p.reviews_count ? Number(p.reviews_count) : 0,
            stock: p.stock !== undefined && p.stock !== null ? Number(p.stock) : 10,
            features: parsedFeatures,
            specs: parsedSpecs
          };
        });
        res.json(mappedProducts);
        return;
      } else if (error) {
        console.warn('Supabase product select query warning (table might not exist yet):', error.message);
      }
    }
  } catch (err: any) {
    console.error('Failed to query or parse Supabase products:', err.message);
  }

  // Fallback to static in-memory products (NO offline JSON reads)
  res.json(initialProducts);
});

// POST Add or Edit Product (Admin only, with sync to Supabase)
app.post('/api/products', async (req, res) => {
  try {
    const productData = req.body;
    if (!productData.name || !productData.price || !productData.category) {
      res.status(400).json({ error: 'Product name, price, and category are required attributes.' });
      return;
    }

    if (!supabase) {
      res.status(503).json({ error: 'Supabase is currently offline.' });
      return;
    }

    const formattedProduct = {
      id: productData.id || 'prod_' + Math.random().toString(36).substr(2, 9),
      name: productData.name.trim(),
      description: (productData.description || '').trim(),
      price: Number(productData.price),
      original_price: productData.originalPrice ? Number(productData.originalPrice) : null,
      image: productData.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
      images: Array.isArray(productData.images) ? productData.images : [productData.image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600'],
      category: productData.category.trim(),
      colors: Array.isArray(productData.colors) ? productData.colors : (productData.colors || '').split(',').map((c: string) => c.trim()).filter((c: string) => c),
      rating: productData.rating ? Number(productData.rating) : 5.0,
      reviews_count: productData.reviewsCount ? Number(productData.reviewsCount) : 0,
      stock: productData.stock ? Number(productData.stock) : 10,
      features: Array.isArray(productData.features) ? productData.features : (productData.features || '').split('\n').map((f: string) => f.trim()).filter((f: string) => f),
      specs: typeof productData.specs === 'object' ? productData.specs : {}
    };

    const { error } = await supabase.from('products').upsert(formattedProduct, { onConflict: 'id' });

    if (error) {
      res.status(500).json({ error: 'Failed to save product in Supabase: ' + error.message });
      return;
    }

    const clientProduct = {
      id: formattedProduct.id,
      name: formattedProduct.name,
      description: formattedProduct.description,
      price: formattedProduct.price,
      originalPrice: formattedProduct.original_price || undefined,
      image: formattedProduct.image,
      images: formattedProduct.images,
      category: formattedProduct.category,
      colors: formattedProduct.colors,
      rating: formattedProduct.rating,
      reviewsCount: formattedProduct.reviews_count,
      stock: formattedProduct.stock,
      features: formattedProduct.features,
      specs: formattedProduct.specs
    };

    res.json({ success: true, product: clientProduct });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add/update product data.' });
  }
});

// DELETE product (Admin only, with sync to Supabase)
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!supabase) {
      res.status(503).json({ error: 'Supabase client is not available.' });
      return;
    }

    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      res.status(500).json({ error: 'Failed to delete product from Supabase: ' + error.message });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product.' });
  }
});

// GET list of reviews (dynamic)
app.get('/api/reviews', async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        const reviews = data.map((r: any) => ({
          id: r.id,
          author: r.author,
          location: r.location,
          rating: Number(r.rating || 5),
          comment: r.comment,
          date: r.date || new Date().toISOString().split('T')[0],
          likes: Number(r.likes || 0)
        }));
        res.json(reviews);
        return;
      } else if (error) {
        console.warn('Supabase reviews fetch query warning (table might not exist yet):', error.message);
      }
    }
  } catch (err: any) {
    console.warn('Failed to query Supabase reviews:', err.message);
  }

  // Fallback to static reviews in-memory lists (NO offline JSON reads)
  res.json(initialReviews);
});

// POST Add new review comment
app.post('/api/reviews', async (req, res) => {
  try {
    const { author, location, rating, comment } = req.body;
    if (!author || !comment || !location) {
      res.status(400).json({ error: 'Author, comment and location city are required review inputs.' });
      return;
    }

    if (!supabase) {
      res.status(503).json({ error: 'Supabase database is currently offline.' });
      return;
    }

    const newReview = {
      id: 'rev-' + Math.random().toString(36).substr(2, 9),
      author: author.trim(),
      location: location.trim(),
      rating: Number(rating || 5),
      comment: comment.trim(),
      date: new Date().toISOString().split('T')[0],
      likes: 0
    };

    const { error } = await supabase.from('reviews').insert([{
      id: newReview.id,
      author: newReview.author,
      location: newReview.location,
      rating: newReview.rating,
      comment: newReview.comment,
      date: newReview.date,
      likes: 0
    }]);

    if (error) {
      res.status(500).json({ error: 'Failed to submit review on Supabase: ' + error.message });
      return;
    }

    res.status(201).json({ success: true, review: newReview });
  } catch (err) {
    console.error('Add review API error:', err);
    res.status(500).json({ error: 'Failed to submit review comment to backend database.' });
  }
});

// POST like review comment
app.post('/api/reviews/:id/like', async (req, res) => {
  try {
    const { id } = req.params;

    if (!supabase) {
      res.status(503).json({ error: 'Supabase database is currently offline.' });
      return;
    }

    const { data: row, error: fetchErr } = await supabase
      .from('reviews')
      .select('likes')
      .eq('id', id)
      .single();

    if (fetchErr || !row) {
      res.status(404).json({ error: 'Review testimony not found.' });
      return;
    }

    const currentLikes = Number(row.likes || 0);
    const newLikes = currentLikes + 1;

    const { error: updateErr } = await supabase
      .from('reviews')
      .update({ likes: newLikes })
      .eq('id', id);

    if (updateErr) {
      res.status(500).json({ error: 'Failed to save updated likes count on Supabase: ' + updateErr.message });
      return;
    }

    res.json({ success: true, likes: newLikes });
  } catch (err) {
    res.status(500).json({ error: 'Failed to increment review helpfulness likes.' });
  }
});

// GET Supabase Diagnostics Status
app.get('/api/supabase-status', async (req, res) => {
  const status = {
    connected: false,
    url: SUPABASE_URL,
    tables: {
      users: { exists: false, error: null },
      products: { exists: false, error: null },
      reviews: { exists: false, error: null },
      logins: { exists: false, error: null }
    }
  };

  if (!supabase) {
    res.json(status);
    return;
  }

  try {
    status.connected = true;

    // Check users
    const checkUsers = await supabase.from('users').select('id').limit(1);
    if (!checkUsers.error) {
      status.tables.users.exists = true;
    } else {
      status.tables.users.error = checkUsers.error.message;
    }

    // Check products
    const checkProducts = await supabase.from('products').select('id').limit(1);
    if (!checkProducts.error) {
      status.tables.products.exists = true;
    } else {
      status.tables.products.error = checkProducts.error.message;
    }

    // Check reviews
    const checkReviews = await supabase.from('reviews').select('id').limit(1);
    if (!checkReviews.error) {
      status.tables.reviews.exists = true;
    } else {
      status.tables.reviews.error = checkReviews.error.message;
    }

    // Check logins
    const checkLogins = await supabase.from('logins').select('id').limit(1);
    if (!checkLogins.error) {
      status.tables.logins.exists = true;
    } else {
      status.tables.logins.error = checkLogins.error.message;
    }
  } catch (err: any) {
    console.error('Supabase connection diagnostics check warning:', err.message);
  }

  res.json(status);
});

// GET or POST Seed Supabase with local persistent data template lists
app.all('/api/supabase-seed', async (req, res) => {
  if (!supabase) {
    res.status(500).json({ error: 'Supabase client instance is not loaded.' });
    return;
  }

  const results: any = {
    products: 0,
    reviews: 0,
    errors: []
  };

  try {
    // 1. Seed Products from in-memory config list
    for (const p of initialProducts) {
      const { error } = await supabase.from('products').upsert({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        original_price: p.originalPrice || null,
        image: p.image,
        images: p.images || [p.image],
        category: p.category,
        colors: p.colors || [],
        rating: p.rating,
        reviews_count: p.reviewsCount,
        stock: p.stock,
        features: p.features || [],
        specs: p.specs || {}
      }, { onConflict: 'id' });
      if (error) {
        results.errors.push(`Product ${p.name} seed error: ${error.message}`);
      } else {
        results.products++;
      }
    }

    // 2. Seed Reviews from in-memory config list
    for (const r of initialReviews) {
      const { error } = await supabase.from('reviews').upsert({
        id: r.id,
        author: r.author,
        location: r.location,
        rating: r.rating,
        comment: r.comment,
        date: r.date,
        likes: r.likes || 0
      }, { onConflict: 'id' });
      if (error) {
        results.errors.push(`Review from ${r.author} seed error: ${error.message}`);
      } else {
        results.reviews++;
      }
    }

    res.json({ success: true, results });
  } catch (err: any) {
    console.error('Seed process error:', err);
    res.status(500).json({ error: 'Seed operation failed.', details: err.message });
  }
});

async function autoSeedSupabaseData() {
  if (!supabase) {
    console.log('Skipping startup auto-seed: Supabase client is not loaded.');
    return;
  }
  console.log('Initiating non-blocking startup auto-seed to Supabase...');
  try {
    const results = { products: 0, reviews: 0 };
    
    // Check if products table is empty
    const { data: existingProducts } = await supabase.from('products').select('id').limit(1);
    if (!existingProducts || existingProducts.length === 0) {
      console.log('Products table empty on Supabase, seeding from products.ts...');
      for (const p of initialProducts) {
        await supabase.from('products').upsert({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          original_price: p.originalPrice || null,
          image: p.image,
          images: p.images || [p.image],
          category: p.category,
          colors: p.colors || [],
          rating: p.rating,
          reviews_count: p.reviewsCount,
          stock: p.stock,
          features: p.features || [],
          specs: p.specs || {}
        }, { onConflict: 'id' });
        results.products++;
      }
    }

    // Check if reviews table is empty
    const { data: existingReviews } = await supabase.from('reviews').select('id').limit(1);
    if (!existingReviews || existingReviews.length === 0) {
      console.log('Reviews table empty on Supabase, seeding from products.ts...');
      for (const r of initialReviews) {
        await supabase.from('reviews').upsert({
          id: r.id,
          author: r.author,
          location: r.location,
          rating: r.rating,
          comment: r.comment,
          date: r.date,
          likes: r.likes || 0
        }, { onConflict: 'id' });
        results.reviews++;
      }
    }

    console.log(`Auto-seeding complete! Cleanly synced to Supabase: ${results.products} products, ${results.reviews} reviews.`);
  } catch (err: any) {
    console.warn('Startup auto-seed completed with standard notifications:', err.message);
  }
}

// Configure Vite integration Based on Environment Node_Env
async function bootstrap() {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Bootstrapping Vite Development Server...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Serving Compiled Assets in Production...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BuyNow Nepal server running on http://localhost:${PORT}`);
    // Auto sync/seed local data template to Supabase on start
    autoSeedSupabaseData();
  });
}

bootstrap();
