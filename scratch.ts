
import mongoose from 'mongoose';

// We define minimal schema since we only want to read
const MutabaahSchema = new mongoose.Schema({}, { strict: false, collection: 'mutabaahdailies' });
const MutabaahDaily = mongoose.models.MutabaahDaily || mongoose.model('MutabaahDaily', MutabaahSchema);

const StudentSchema = new mongoose.Schema({}, { strict: false, collection: 'students' });
const Student = mongoose.models.Student || mongoose.model('Student', StudentSchema);

async function check() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const data = await MutabaahDaily.find({ 'murojaahPartner.isCompleted': true }).lean();
  
  console.log('--- DATA MUROJAAH PARTNER DI MONGODB ---');
  if(data.length === 0) {
     console.log('Tidak ada data Murojaah Partner di MongoDB.');
  }
  for (const d of data) {
    const student = await Student.findById(d.studentId).lean();
    console.log('Tanggal:', new Date(d.tanggal).toISOString().split('T')[0], '| Santri:', student?.nama, '| Murojaah:', JSON.stringify(d.murojaahPartner));
  }
  process.exit(0);
}
check();

