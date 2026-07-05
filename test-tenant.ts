import dbConnect from "./src/lib/db";
import { Tenant } from "./src/models/Tenant";

async function run() {
  try {
    await dbConnect();
    console.log("Connected to DB");
    
    let tenant = await Tenant.findOne();
    if (!tenant) {
      console.log("No tenants found");
      return;
    }
    
    console.log("Tenant ID:", tenant._id);
    console.log("Current Settings:", tenant.settings);
    
    // Update using raw mongoose updateOne
    const res = await Tenant.updateOne(
      { _id: tenant._id },
      { $set: { "settings.periode": "TEST_PERIODE_" + Date.now(), name: "TEST_NAME_" + Date.now() } }
    );
    console.log("UpdateOne Result:", res);
    
    // Fetch again
    const updated = await Tenant.findById(tenant._id);
    console.log("Settings After Update:", updated?.settings);
    console.log("Name After Update:", updated?.name);
    
  } catch (err) {
    console.error(err);
  }
  process.exit(0);
}

run();
