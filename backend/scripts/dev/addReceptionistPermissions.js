const db = require('./config/database');

async function addReceptionistPermissions() {
    try {
        // Receptionist permissions
        const permissions = [
            { name: 'view_opd_patients', description: 'View OPD patient list' },
            { name: 'create_opd_registration', description: 'Create new OPD registration' },
            { name: 'view_ipd_patients', description: 'View IPD patient list' },
            { name: 'create_ipd_admission', description: 'Create new IPD admission' },
            { name: 'view_doctors', description: 'View doctor list and schedules' },
            { name: 'view_departments', description: 'View departments' },
            { name: 'manage_appointments', description: 'Manage patient appointments' },
            { name: 'view_billing', description: 'View billing information' },
            { name: 'create_invoice', description: 'Create invoices' },
            { name: 'view_reports', description: 'View basic reports' }
        ];

        for (const perm of permissions) {
            const [existing] = await db.execute('SELECT * FROM permissions WHERE name = ?', [perm.name]);
            
            if (existing.length === 0) {
                await db.execute(
                    'INSERT INTO permissions (name, description) VALUES (?, ?)',
                    [perm.name, perm.description]
                );
                console.log(`Added permission: ${perm.name}`);
            } else {
                console.log(`Permission already exists: ${perm.name}`);
            }
        }

        // Get receptionist role or create it
        const [roles] = await db.execute('SELECT * FROM roles WHERE name = ?', ['receptionist']);
        
        let roleId;
        if (roles.length === 0) {
            const [result] = await db.execute(
                'INSERT INTO roles (name, description, permissions) VALUES (?, ?, ?)',
                ['receptionist', 'Hospital Receptionist', JSON.stringify(permissions.map(p => p.name))]
            );
            roleId = result.insertId;
            console.log('Created receptionist role');
        } else {
            roleId = roles[0].id;
            await db.execute(
                'UPDATE roles SET permissions = ? WHERE id = ?',
                [JSON.stringify(permissions.map(p => p.name)), roleId]
            );
            console.log('Updated receptionist role permissions');
        }

        console.log('Receptionist permissions added successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error adding permissions:', error);
        process.exit(1);
    }
}

addReceptionistPermissions();
