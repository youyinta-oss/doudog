let playerCoins = 0
let ownedMods = []
let equippedMod = null
let allMods = []
let categories = {}

window.addEventListener('message', function(event) {
    const data = event.data

    if (data.type === 'openShop') {
        initShop(data.data)
    }
    
    if (data.type === 'updateData') {
        updatePlayerData(data.data)
    }
    
    if (data.type === 'updateMods') {
        allMods = data.data
        renderShopMods()
    }
    
    if (data.type === 'notification') {
        showNotification(data.data.message, data.data.type)
    }
})

function initShop(data) {
    document.getElementById('playerName').textContent = data.playerName || '玩家'
    playerCoins = data.coins || 0
    ownedMods = data.ownedMods || []
    equippedMod = data.equippedMod
    allMods = data.mods || []
    categories = data.categories || {}
    
    updateCoinDisplay()
    renderShopMods()
    renderInventory()
}

function updatePlayerData(data) {
    playerCoins = data.coins || 0
    ownedMods = data.ownedMods || []
    equippedMod = data.equippedMod
    
    updateCoinDisplay()
    renderShopMods()
    renderInventory()
}

function updateCoinDisplay() {
    document.getElementById('playerCoins').textContent = playerCoins.toLocaleString()
}

function renderShopMods() {
    const grid = document.getElementById('modsGrid')
    grid.innerHTML = ''
    
    const availableMods = allMods.filter(mod => {
        return !ownedMods.some(owned => owned.mod_id === mod.id)
    })
    
    if (availableMods.length === 0) {
        grid.innerHTML = '<p style="color: #6B7280; text-align: center; grid-column: 1/-1;">所有Mod已被您购买</p>'
        return
    }
    
    availableMods.forEach(mod => {
        const card = createModCard(mod, false)
        grid.appendChild(card)
    })
}

function renderInventory() {
    const grid = document.getElementById('inventoryGrid')
    grid.innerHTML = ''
    
    updateEquippedDisplay()
    
    if (ownedMods.length === 0) {
        grid.innerHTML = '<p style="color: #6B7280; text-align: center; grid-column: 1/-1;">您还没有购买任何Mod</p>'
        return
    }
    
    ownedMods.forEach(userMod => {
        const mod = {
            id: userMod.mod_id,
            name: userMod.name,
            description: userMod.description,
            price: userMod.price,
            model: userMod.model,
            category: userMod.category
        }
        const card = createModCard(mod, true, userMod.equipped, userMod.id)
        grid.appendChild(card)
    })
}

function createModCard(mod, owned, equipped = false, userModId = null) {
    const card = document.createElement('div')
    card.className = `mod-card ${owned ? 'owned' : ''}`
    
    const canAfford = playerCoins >= mod.price
    const displayPrice = mod.price
    
    card.innerHTML = `
        <div class="mod-image">🎮</div>
        <div class="mod-info">
            <h3 class="mod-name">${mod.name}</h3>
            <p class="mod-description">${mod.description}</p>
            <div class="mod-price">
                <span class="price-tag">💰 ${displayPrice.toLocaleString()}</span>
                <span class="mod-category">${categories[mod.category] || mod.category}</span>
            </div>
            <div class="mod-actions">
                ${owned ? 
                    (equipped ? 
                        `<button class="btn btn-unequip" onclick="unequipMod()" data-mod-id="${mod.id}">
                            卸下
                        </button>` :
                        `<button class="btn btn-equip" onclick="equipMod(${mod.id})" data-mod-id="${mod.id}">
                            ⚡ 装备
                        </button>`
                    ) :
                    (canAfford ?
                        `<button class="btn btn-buy" onclick="buyMod(${mod.id})" data-mod-id="${mod.id}">
                            购买
                        </button>` :
                        `<button class="btn btn-buy" disabled>
                            金币不足
                        </button>`
                    )
                }
            </div>
        </div>
    `
    
    return card
}

function updateEquippedDisplay() {
    const container = document.getElementById('equippedMod')
    
    if (equippedMod) {
        container.innerHTML = `
            <h3>⚡ 当前装备</h3>
            <p class="mod-name">${equippedMod.name}</p>
            <p style="color: #9CA3AF; margin-top: 5px;">${equippedMod.description}</p>
        `
    } else {
        container.innerHTML = `
            <h3>⚡ 当前装备</h3>
            <p class="no-equipment">暂无装备</p>
        `
    }
}

function buyMod(modId) {
    fetchNUI('buyMod', { modId: modId })
}

function equipMod(modId) {
    fetchNUI('equipMod', { modId: modId })
}

function unequipMod() {
    fetchNUI('unequipMod', {})
}

function showNotification(message, type) {
    const notification = document.getElementById('notification')
    document.getElementById('notificationText').textContent = message
    notification.className = `notification ${type}`
    notification.style.display = 'block'
    
    setTimeout(() => {
        notification.style.display = 'none'
    }, 3000)
}

function fetchNUI(type, data) {
    const message = {
        type: type,
        data: data || {}
    }
    
    if (window.parent) {
        window.parent.postMessage(message, '*')
    } else {
        console.log('NUI:', message)
    }
}

document.getElementById('closeBtn').addEventListener('click', function() {
    fetchNUI('closeShop', {})
})

document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab')
        
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'))
        this.classList.add('active')
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none'
        })
        
        document.getElementById(tabName + 'Tab').style.display = 'block'
    })
})
