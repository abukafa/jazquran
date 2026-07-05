const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected");

  const TenantSchema = new mongoose.Schema({
    name: String,
    slug: String,
    code: String,
    settings: {
      maxStudents: Number,
      themeColor: String,
      periode: String,
    }
  });

  const Tenant = mongoose.models.Tenant || mongoose.model('Tenant', TenantSchema);

  // find any tenant
  let tenant = await Tenant.findOne();
  if (!tenant) {
    console.log("No tenant found");
    process.exit(1);
  }

  console.log("Before save:", tenant.settings);
  
  if (!tenant.settings) tenant.settings = {};
  tenant.settings.periode = "TEST_" + Date.now();
  tenant.markModified("settings");
  
  await tenant.save();
  
  console.log("After save (in memory):", tenant.settings);
  
  const fetched = await Tenant.findById(tenant._id);
  console.log("Fetched after save:", fetched.settings);
  
  process.exit(0);
}

run().catch(console.error);
