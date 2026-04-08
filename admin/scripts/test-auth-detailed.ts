import { db } from "../lib/db";
import bcrypt from "bcryptjs";

async function testAuth() {
  console.log("=== Testing Auth Detailed ===\n");
  
  const email = "modonty@modonty.com";
  const password = "Modonty123!";
  
  try {
    console.log(`1. Looking up user: ${email}`);
    const user = await db.user.findUnique({
      where: { email },
    });
    
    console.log(`   Found: ${!!user}`);
    
    if (!user) {
      console.log("❌ User not found");
      return;
    }
    
    console.log(`   User ID: ${user.id}`);
    console.log(`   Has password: ${!!user.password}`);
    
    if (!user.password) {
      console.log("❌ User has no password");
      return;
    }
    
    console.log(`\n2. Comparing password...`);
    const isValid = await bcrypt.compare(password, user.password);
    console.log(`   Match: ${isValid}`);
    
    if (!isValid) {
      console.log("❌ Password does not match");
      return;
    }
    
    console.log("✅ Auth would succeed!");
    console.log(`   Would return: { id, email, name }`);
    
  } catch (error) {
    console.log("❌ Error:", error);
  }
}

testAuth().then(() => process.exit(0)).catch(console.error);
