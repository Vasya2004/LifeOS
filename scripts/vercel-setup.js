#!/usr/bin/env node

// ============================================
// VERCEL PROJECT SETUP SCRIPT
// ============================================

const { execSync } = require('child_process')
const fs = require('fs')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const question = (query) => new Promise(resolve => rl.question(query, resolve))

async function main() {
  console.log('\n🚀 LifeOS Vercel Setup\n')

  // Check if already logged in
  try {
    execSync('vercel whoami', { stdio: 'pipe' })
    console.log('✅ Already logged in to Vercel')
  } catch {
    console.log('🔑 Please login to Vercel...')
    execSync('vercel login', { stdio: 'inherit' })
  }

  // Check for existing project
  if (fs.existsSync('.vercel/project.json')) {
    console.log('✅ Project already linked to Vercel')
    
    const shouldReconfigure = await question('Reconfigure environment variables? (y/n): ')
    
    if (shouldReconfigure.toLowerCase() !== 'y') {
      console.log('\n✨ Done!')
      process.exit(0)
    }
  } else {
    console.log('📁 Linking project to Vercel...')
    execSync('vercel link', { stdio: 'inherit' })
  }

  // Read .env.local
  const envPath = '.env.local'
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local not found')
    process.exit(1)
  }

  const envContent = fs.readFileSync(envPath, 'utf8')
  
  // Extract values
  const supabaseUrl = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]
  const supabaseKey = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1]

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local')
    process.exit(1)
  }

  console.log('\n📤 Setting environment variables...')

  // Set env vars in Vercel
  try {
    execSync(`vercel env add NEXT_PUBLIC_SUPABASE_URL production`, {
      input: Buffer.from(supabaseUrl + '\n'),
      stdio: ['pipe', 'inherit', 'inherit']
    })
    console.log('✅ NEXT_PUBLIC_SUPABASE_URL set')
  } catch (e) {
    console.log('⚠️  Failed to set URL, may already exist')
  }

  try {
    execSync(`vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production`, {
      input: Buffer.from(supabaseKey + '\n'),
      stdio: ['pipe', 'inherit', 'inherit']
    })
    console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY set')
  } catch (e) {
    console.log('⚠️  Failed to set key, may already exist')
  }

  console.log('\n✨ Setup complete!')
  console.log('\nNext steps:')
  console.log('1. Run: ./scripts/deploy.sh')
  console.log('2. Or run: vercel --prod')
  console.log('')

  rl.close()
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
