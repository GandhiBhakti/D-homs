const db = require('./config/database');

async function insertDummyPrescriptions() {
  try {
    console.log('Inserting dummy prescription data...');

    const dummyPrescriptions = [
      {
        patient_id: 1,
        doctor_id: 1,
        visit_type: 'OPD',
        visit_id: null,
        chief_complaint: 'Severe headache and fever for 3 days',
        diagnosis: 'Viral fever with migraine',
        prescription_details: 'Paracetamol 500mg - Take 1 tablet twice daily after meals\nAmoxicillin 500mg - Take 1 tablet three times daily for 5 days\nCough syrup - 10ml twice daily',
        lab_tests: 'Complete Blood Count, ESR',
        xray_tests: '',
        other_tests: '',
        notes: 'Patient advised to rest and drink plenty of fluids',
        follow_up_date: '2026-08-05',
        total_amount: 500,
        consultation_fee: 200,
        lab_fee: 200,
        xray_fee: 0,
        other_fee: 100
      },
      {
        patient_id: 2,
        doctor_id: 2,
        visit_type: 'OPD',
        visit_id: null,
        chief_complaint: 'Chest pain and shortness of breath',
        diagnosis: 'Acute bronchitis',
        prescription_details: 'Azithromycin 500mg - Take 1 tablet once daily for 3 days\nBronchodilator inhaler - Use as needed\nSteam inhalation twice daily',
        lab_tests: 'Chest X-Ray, Sputum culture',
        xray_tests: 'Chest X-Ray PA view',
        other_tests: 'ECG',
        notes: 'Patient advised to avoid smoking and dust',
        follow_up_date: '2026-08-03',
        total_amount: 1200,
        consultation_fee: 300,
        lab_fee: 400,
        xray_fee: 300,
        other_fee: 200
      },
      {
        patient_id: 3,
        doctor_id: 3,
        visit_type: 'IPD',
        visit_id: 1,
        chief_complaint: 'Severe abdominal pain',
        diagnosis: 'Acute appendicitis',
        prescription_details: 'IV antibiotics - Ceftriaxone 2g twice daily\nPainkillers as needed\nNPO status maintained',
        lab_tests: 'Complete Blood Count, Liver Function Test, Kidney Function Test',
        xray_tests: 'Abdominal X-Ray',
        other_tests: 'Ultrasound abdomen',
        notes: 'Patient prepared for surgery',
        follow_up_date: '2026-08-10',
        total_amount: 2500,
        consultation_fee: 500,
        lab_fee: 1000,
        xray_fee: 500,
        other_fee: 500
      },
      {
        patient_id: 4,
        doctor_id: 4,
        visit_type: 'OPD',
        visit_id: null,
        chief_complaint: 'Joint pain and stiffness',
        diagnosis: 'Rheumatoid arthritis',
        prescription_details: 'Methotrexate 15mg once weekly\nFolic acid 5mg daily\nNSAIDs for pain relief',
        lab_tests: 'Rheumatoid factor, ANA, CRP, ESR',
        xray_tests: 'X-Ray hands and feet',
        other_tests: '',
        notes: 'Regular follow-up required',
        follow_up_date: '2026-08-15',
        total_amount: 800,
        consultation_fee: 250,
        lab_fee: 350,
        xray_fee: 200,
        other_fee: 0
      },
      {
        patient_id: 5,
        doctor_id: 5,
        visit_type: 'OPD',
        visit_id: null,
        chief_complaint: 'Skin rash and itching',
        diagnosis: 'Allergic dermatitis',
        prescription_details: 'Antihistamine tablet - 1 tablet at night\nTopical corticosteroid cream - Apply twice daily\nMoisturizer - Apply after bath',
        lab_tests: 'Allergy panel test',
        xray_tests: '',
        other_tests: '',
        notes: 'Avoid allergens identified',
        follow_up_date: '2026-08-07',
        total_amount: 400,
        consultation_fee: 150,
        lab_fee: 250,
        xray_fee: 0,
        other_fee: 0
      },
      {
        patient_id: 1,
        doctor_id: 2,
        visit_type: 'OPD',
        visit_id: null,
        chief_complaint: 'Back pain',
        diagnosis: 'Lower back strain',
        prescription_details: 'Muscle relaxant - 1 tablet twice daily\nPainkiller - as needed\nHot fomentation\nPhysiotherapy exercises',
        lab_tests: '',
        xray_tests: 'Lumbar spine X-Ray',
        other_tests: 'MRI if needed',
        notes: 'Avoid heavy lifting',
        follow_up_date: '2026-08-08',
        total_amount: 700,
        consultation_fee: 200,
        lab_fee: 0,
        xray_fee: 300,
        other_fee: 200
      },
      {
        patient_id: 2,
        doctor_id: 3,
        visit_type: 'OPD',
        visit_id: null,
        chief_complaint: 'Eye irritation and redness',
        diagnosis: 'Conjunctivitis',
        prescription_details: 'Antibiotic eye drops - 2 drops 4 times daily\nLubricating eye drops - as needed\nWarm compress',
        lab_tests: '',
        xray_tests: '',
        other_tests: '',
        notes: 'Avoid touching eyes',
        follow_up_date: '2026-08-02',
        total_amount: 200,
        consultation_fee: 100,
        lab_fee: 0,
        xray_fee: 0,
        other_fee: 100
      },
      {
        patient_id: 3,
        doctor_id: 1,
        visit_type: 'OPD',
        visit_id: null,
        chief_complaint: 'High blood pressure',
        diagnosis: 'Hypertension Stage 1',
        prescription_details: 'Amlodipine 5mg - 1 tablet once daily\nLifestyle modifications\nLow salt diet',
        lab_tests: 'Lipid profile, Kidney function test, ECG',
        xray_tests: '',
        other_tests: 'ECG',
        notes: 'Regular BP monitoring required',
        follow_up_date: '2026-08-20',
        total_amount: 600,
        consultation_fee: 200,
        lab_fee: 300,
        xray_fee: 0,
        other_fee: 100
      },
      {
        patient_id: 4,
        doctor_id: 5,
        visit_type: 'IPD',
        visit_id: 2,
        chief_complaint: 'Difficulty breathing',
        diagnosis: 'Community acquired pneumonia',
        prescription_details: 'IV antibiotics - Ceftriaxone 2g twice daily\nOxygen therapy\nChest physiotherapy',
        lab_tests: 'CBC, Blood culture, Sputum culture',
        xray_tests: 'Chest X-Ray',
        other_tests: 'ABG analysis',
        notes: 'Monitor vitals closely',
        follow_up_date: '2026-08-12',
        total_amount: 3000,
        consultation_fee: 500,
        lab_fee: 1000,
        xray_fee: 500,
        other_fee: 1000
      },
      {
        patient_id: 5,
        doctor_id: 4,
        visit_type: 'OPD',
        visit_id: null,
        chief_complaint: 'Stomach pain and acidity',
        diagnosis: 'Gastritis',
        prescription_details: 'PPI - 1 tablet before breakfast\nAntacid - after meals\nAvoid spicy food',
        lab_tests: '',
        xray_tests: '',
        other_tests: 'Endoscopy if needed',
        notes: 'Dietary modifications advised',
        follow_up_date: '2026-08-06',
        total_amount: 300,
        consultation_fee: 150,
        lab_fee: 0,
        xray_fee: 0,
        other_fee: 150
      }
    ];

    for (const prescription of dummyPrescriptions) {
      await db.execute(
        `INSERT INTO prescriptions (
          patient_id, doctor_id, visit_type, visit_id, chief_complaint, diagnosis,
          prescription_details, lab_tests, xray_tests, other_tests, notes,
          follow_up_date, total_amount, consultation_fee, lab_fee, xray_fee, other_fee
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          prescription.patient_id,
          prescription.doctor_id,
          prescription.visit_type,
          prescription.visit_id,
          prescription.chief_complaint,
          prescription.diagnosis,
          prescription.prescription_details,
          prescription.lab_tests,
          prescription.xray_tests,
          prescription.other_tests,
          prescription.notes,
          prescription.follow_up_date,
          prescription.total_amount,
          prescription.consultation_fee,
          prescription.lab_fee,
          prescription.xray_fee,
          prescription.other_fee
        ]
      );
      console.log(`Inserted prescription for patient ${prescription.patient_id}`);
    }

    console.log('\nDummy prescription data inserted successfully!');
    console.log(`Total prescriptions inserted: ${dummyPrescriptions.length}`);

  } catch (error) {
    console.error('Error inserting dummy prescriptions:', error);
  } finally {
    await db.end();
    process.exit(0);
  }
}

insertDummyPrescriptions();
