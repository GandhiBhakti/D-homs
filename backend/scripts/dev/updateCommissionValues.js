const db = require('./config/database');

async function updateCommissionValues() {
    try {
        // Get all commissions
        const [commissions] = await db.execute('SELECT id FROM doctor_commission ORDER BY id');
        
        // Define different percentage values for each row
        const percentageValues = [21, 25, 30, 15, 20, 18, 22, 28, 35, 12];
        
        for (let i = 0; i < commissions.length; i++) {
            const commission = commissions[i];
            const percentage = percentageValues[i % percentageValues.length];
            
            await db.execute(
                'UPDATE doctor_commission SET opd_commission_value = ? WHERE id = ?',
                [percentage, commission.id]
            );
            
            console.log(`Updated commission ID ${commission.id} to ${percentage}%`);
        }
        
        console.log('All commission values updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error updating commission values:', error);
        process.exit(1);
    }
}

updateCommissionValues();
