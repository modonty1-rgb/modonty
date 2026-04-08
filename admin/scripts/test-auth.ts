import { authConfig } from "../auth.config";
import bcrypt from "bcryptjs";
import { db } from "../lib/db";

async function testAuth() {
  console.log("Testing auth provider...\n");
  
  const credentials = {
    email: "modonty@modonty.com",
    password: "Modonty123!",
  };
  
  // Get the credentials provider
  const credentialsProvider = authConfig.providers.find((p: any) => p.id === "credentials");
  
  if (!credentialsProvider) {
    console.log("❌ Credentials provider not found");
    return;
  }
  
  console.log("Found credentials provider");
  console.log(`Testing authorize function...`);
  
  const result = await credentialsProvider.authorize(credentials, null as any);
  
  console.log("\nResult:", result);
  
  if (result) {
    console.log("✅ Auth successful!");
  } else {
    console.log("❌ Auth failed!");
  }
}

testAuth().catch(console.error);
