const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');

async function updateEmail() {
  const client = new Client({
    host: 'aws-0-ap-northeast-2.pooler.supabase.com',
    port: 5432,
    user: 'postgres.zuoymwjmnqhqymalaxuf',
    password: 'TeraOnic$$796',
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  const newEmail = 'itstaqi2919@gmail.com';
  const oldEmail = 'taqi@teraflow.io';
  const userId = 'a0000000-0000-0000-0000-000000000001';

  // 1. Update auth.users
  await client.query(
    'UPDATE auth.users SET email = $1, updated_at = NOW() WHERE id = $2 OR email = $3',
    [newEmail, userId, oldEmail]
  );

  // 2. Update auth.identities
  await client.query(
    "UPDATE auth.identities SET identity_data = jsonb_set(identity_data, '{email}', to_jsonb($1::text)), updated_at = NOW() WHERE user_id = $2",
    [newEmail, userId]
  );

  // 3. Update profiles
  await client.query(
    'UPDATE public.profiles SET email = $1, updated_at = NOW() WHERE id = $2 OR email = $3',
    [newEmail, userId, oldEmail]
  );

  console.log('✅ Updated email to', newEmail, 'in auth.users, auth.identities, and profiles');
  await client.end();

  // 4. Test login with new email
  const supabase = createClient(
    'https://zuoymwjmnqhqymalaxuf.supabase.co',
    'sb_publishable_T3-GmiAy2EY4h5QIoA0_xg_bujZNHwN'
  );

  const loginRes = await supabase.auth.signInWithPassword({
    email: newEmail,
    password: 'TeraOnic$$796',
  });

  if (loginRes.error) {
    console.error('❌ Login error with new email:', loginRes.error.message);
  } else {
    console.log('🎉 LOGIN WITH NEW EMAIL SUCCEEDED!');
    console.log('User ID:', loginRes.data.user.id);
    console.log('User Email:', loginRes.data.user.email);
    console.log('JWT Token Preview:', loginRes.data.session.access_token.slice(0, 35) + '...');
  }
}

updateEmail().catch(console.error);

