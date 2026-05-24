MySQL = exports.oxmysql

function InitializeDatabase()
    MySQL.query([[
        CREATE TABLE IF NOT EXISTS dealer_dealerships (
            id INT AUTO_INCREMENT PRIMARY KEY,
            owner VARCHAR(100) NOT NULL,
            name VARCHAR(255) NOT NULL,
            balance DECIMAL(15, 2) DEFAULT 0.00,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_owner (owner)
        )
    ]])

    MySQL.query([[
        CREATE TABLE IF NOT EXISTS dealer_inventory (
            id INT AUTO_INCREMENT PRIMARY KEY,
            dealership_id INT NOT NULL,
            owner_identifier VARCHAR(100) NOT NULL,
            plate VARCHAR(50) NOT NULL,
            model VARCHAR(100) NOT NULL,
            label VARCHAR(255) NOT NULL,
            props TEXT NOT NULL,
            price DECIMAL(15, 2) DEFAULT 0.00,
            status ENUM('stored', 'showroom', 'sold') DEFAULT 'stored',
            inspection TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (dealership_id) REFERENCES dealer_dealerships(id) ON DELETE CASCADE,
            UNIQUE KEY unique_plate (dealership_id, plate)
        )
    ]])

    MySQL.query([[
        CREATE TABLE IF NOT EXISTS dealer_showroom (
            id INT AUTO_INCREMENT PRIMARY KEY,
            dealership_id INT NOT NULL,
            slot INT NOT NULL,
            inventory_id INT,
            coords TEXT,
            heading FLOAT,
            FOREIGN KEY (dealership_id) REFERENCES dealer_dealerships(id) ON DELETE CASCADE,
            UNIQUE KEY unique_slot (dealership_id, slot)
        )
    ]])

    MySQL.query([[
        CREATE TABLE IF NOT EXISTS dealer_transactions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            dealership_id INT NOT NULL,
            type ENUM('sale', 'purchase', 'deposit', 'withdrawal') NOT NULL,
            amount DECIMAL(15, 2) NOT NULL,
            balance_after DECIMAL(15, 2) NOT NULL,
            description TEXT,
            buyer_identifier VARCHAR(100),
            seller_identifier VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (dealership_id) REFERENCES dealer_dealerships(id) ON DELETE CASCADE,
            INDEX idx_dealership_type (dealership_id, type),
            INDEX idx_created_at (created_at)
        )
    ]])

    print('[二手车行] 数据库初始化完成')
end

function CreateDealership(owner, name, callback)
    MySQL.insert('INSERT INTO dealer_dealerships (owner, name) VALUES (?, ?)', {owner, name}, function(id)
        if id then
            InitializeShowroomSlots(id, function()
                callback(id)
            end)
        else
            callback(false)
        end
    end)
end

function InitializeShowroomSlots(dealershipId, callback)
    local slots = {}
    for i = 1, Config.ShowroomSlots do
        table.insert(slots, {dealershipId, i, nil, nil, 0.0})
    end
    MySQL.insert('INSERT INTO dealer_showroom (dealership_id, slot, inventory_id, coords, heading) VALUES (?, ?, ?, ?, ?)', slots, function(results)
        callback(results)
    end)
end

function GetDealershipByOwner(owner, callback)
    MySQL.query('SELECT * FROM dealer_dealerships WHERE owner = ?', {owner}, function(results)
        if results and #results > 0 then
            callback(results[1])
        else
            callback(nil)
        end
    end)
end

function GetInventory(dealershipId, callback)
    MySQL.query('SELECT * FROM dealer_inventory WHERE dealership_id = ?', {dealershipId}, function(results)
        callback(results or {})
    end)
end

function AddToInventory(dealershipId, ownerIdentifier, plate, model, label, props, price, inspection, callback)
    MySQL.insert(
        'INSERT INTO dealer_inventory (dealership_id, owner_identifier, plate, model, label, props, price, inspection) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        {dealershipId, ownerIdentifier, plate, model, label, props, price, inspection},
        function(id)
            callback(id)
        end
    )
end

function UpdateVehiclePrice(inventoryId, newPrice, callback)
    MySQL.update('UPDATE dealer_inventory SET price = ? WHERE id = ?', {newPrice, inventoryId}, function(result)
        callback(result > 0)
    end)
end

function UpdateVehicleStatus(inventoryId, status, callback)
    MySQL.update('UPDATE dealer_inventory SET status = ? WHERE id = ?', {status, inventoryId}, function(result)
        callback(result > 0)
    end)
end

function GetShowroom(dealershipId, callback)
    MySQL.query('SELECT ds.*, di.label, di.model, di.price, di.inspection FROM dealer_showroom ds LEFT JOIN dealer_inventory di ON ds.inventory_id = di.id WHERE ds.dealership_id = ?', {dealershipId}, function(results)
        callback(results or {})
    end)
end

function AssignToShowroom(slotId, inventoryId, coords, heading, callback)
    MySQL.update('UPDATE dealer_showroom SET inventory_id = ?, coords = ?, heading = ? WHERE id = ?', {inventoryId, coords, heading, slotId}, function(result)
        if result > 0 then
            if inventoryId then
                MySQL.update('UPDATE dealer_inventory SET status = "showroom" WHERE id = ?', {inventoryId})
            else
                MySQL.query('SELECT inventory_id FROM dealer_showroom WHERE id = ?', {slotId}, function(results)
                    if results and results[1] and results[1].inventory_id then
                        MySQL.update('UPDATE dealer_inventory SET status = "stored" WHERE id = ?', {results[1].inventory_id})
                    end
                end)
            end
            callback(true)
        else
            callback(false)
        end
    end)
end

function GetAccountBalance(dealershipId, callback)
    MySQL.query('SELECT balance FROM dealer_dealerships WHERE id = ?', {dealershipId}, function(results)
        if results and #results > 0 then
            callback(results[1].balance)
        else
            callback(0)
        end
    end)
end

function UpdateBalance(dealershipId, amount, callback)
    MySQL.update('UPDATE dealer_dealerships SET balance = balance + ? WHERE id = ?', {amount, dealershipId}, function(result)
        if result > 0 then
            GetAccountBalance(dealershipId, function(newBalance)
                callback(newBalance)
            end)
        else
            callback(false)
        end
    end)
end

function GetTransactions(dealershipId, callback)
    MySQL.query('SELECT * FROM dealer_transactions WHERE dealership_id = ? ORDER BY created_at DESC', {dealershipId}, function(results)
        callback(results or {})
    end)
end

function AddTransaction(dealershipId, type, amount, description, buyerIdentifier, sellerIdentifier, callback)
    MySQL.query('SELECT balance FROM dealer_dealerships WHERE id = ?', {dealershipId}, function(results)
        if results and #results > 0 then
            local balanceAfter = results[1].balance + amount
            MySQL.insert(
                'INSERT INTO dealer_transactions (dealership_id, type, amount, balance_after, description, buyer_identifier, seller_identifier) VALUES (?, ?, ?, ?, ?, ?, ?)',
                {dealershipId, type, amount, balanceAfter, description, buyerIdentifier, sellerIdentifier},
                function(id)
                    UpdateBalance(dealershipId, amount, function(newBalance)
                        callback(id, newBalance)
                    end)
                end
            )
        else
            callback(false, 0)
        end
    end)
end

function RemoveFromInventory(inventoryId, callback)
    MySQL.query('SELECT * FROM dealer_inventory WHERE id = ?', {inventoryId}, function(results)
        if results and #results > 0 then
            MySQL.update('DELETE FROM dealer_inventory WHERE id = ?', {inventoryId}, function(result)
                callback(result > 0, results[1])
            end)
        else
            callback(false, nil)
        end
    end)
end

function GetVehicleByPlate(dealershipId, plate, callback)
    MySQL.query('SELECT * FROM dealer_inventory WHERE dealership_id = ? AND plate = ?', {dealershipId, plate}, function(results)
        callback(results and #results > 0 and results[1] or nil)
    end)
end
