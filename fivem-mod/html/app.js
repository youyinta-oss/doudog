let playerData = {
    playerId: null,
    playerName: null,
    coins: 0,
    ownedMods: [],
    equippedMod: null
};

let allMods = [];
let apiUrl = 'http://localhost:3001/api';

window.addEventListener('message', function(event) {
    const data = event.data;

    if (data.type === 'openShop') {
        playerData.playerId = data.data.playerId;
        playerData.playerName = data.data.playerName;
        document.getElementById('playerName').textContent = playerData.playerName;
        initializeShop();
    }

    if (data.type === 'closeShop') {
        hideShop();
    }
});

document.getElementById('closeBtn').addEventListener('click', function() {
    sendNUIMessage({ type: 'closeShop' });
});

document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');
        
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        
        document.getElementById(tabName + 'Tab').style.display = 'block';
    });
});

async function initializeShop() {
    showLoading();
    
    try {
        await Promise.all([
            loadPlayerData(),
            loadMods()
        ]);
        
        document.getElementById('loadingScreen').style.display = 'none';
        document.getElementById('shopContainer').style.display = 'flex';
    } catch (error) {
        console.error('Failed to initialize shop:', error);
        showNotification('加载失败，请重试', 'error');
    }
}

async function loadPlayerData() {
    try {
        const response = await fetch(`${apiUrl}/user/${getPlayerIdentifier()}/coins`);
        const data = await response.json();
        
        if (data.success) {
            playerData.coins = data.data.coins;
            document.getElementById('playerCoins').textContent = playerData.coins.toLocaleString();
        }
        
        const modsResponse = await fetch(`${apiUrl}/user/${getPlayerIdentifier()}/mods`);
        const modsData = await modsResponse.json();
        
        if (modsData.success) {
            playerData.ownedMods = modsData.data;
        }
        
        const equippedResponse = await fetch(`${apiUrl}/user/${getPlayerIdentifier()}/equipped-mod`);
        const equippedData = await equippedResponse.json();
        
        if (equippedData.success && equippedData.data) {
            playerData.equippedMod = equippedData.data;
            updateEquippedDisplay();
        }
    } catch (error) {
        console.error('Failed to load player data:', error);
    }
}

async function loadMods() {
    try {
        const response = await fetch(`${apiUrl}/mods`);
        const data = await response.json();
        
        if (data.success) {
            allMods = data.data;
            renderMods();
            renderInventory();
        }
    } catch (error) {
        console.error('Failed to load mods:', error);
    }
}

function renderMods() {
    const grid = document.getElementById('modsGrid');
    grid.innerHTML = '';
    
    const availableMods = allMods.filter(mod => {
        return !playerData.ownedMods.some(owned => owned.mod_id === mod.id);
    });
    
    if (availableMods.length === 0) {
        grid.innerHTML = '<p class="no-mods">所有Mod已被您购买</p>';
        return;
    }
    
    availableMods.forEach(mod => {
        const card = createModCard(mod, false);
        grid.appendChild(card);
    });
}

function renderInventory() {
    const grid = document.getElementById('inventoryGrid');
    grid.innerHTML = '';
    
    if (playerData.ownedMods.length === 0) {
        grid.innerHTML = '<p class="no-mods">您还没有购买任何Mod</p>';
        return;
    }
    
    playerData.ownedMods.forEach(userMod => {
        const mod = {
            id: userMod.mod_id,
            name: userMod.name,
            description: userMod.description,
            price: userMod.price,
            model_path: userMod.model_path,
            category: userMod.category
        };
        const card = createModCard(mod, true, userMod.equipped);
        grid.appendChild(card);
    });
}

function createModCard(mod, owned, equipped = false) {
    const card = document.createElement('div');
    card.className = `mod-card ${owned ? 'owned' : ''}`;
    
    const canAfford = playerData.coins >= mod.price;
    
    card.innerHTML = `
        <div class="mod-image">🎮</div>
        <div class="mod-info">
            <h3 class="mod-name">${mod.name}</h3>
            <p class="mod-description">${mod.description}</p>
            <div class="mod-price">
                <span class="price-tag">🪙 ${mod.price.toLocaleString()}</span>
                <span class="mod-category">${mod.category}</span>
            </div>
            <div class="mod-actions">
                ${owned ? 
                    (equipped ? 
                        '<button class="btn btn-equipped">✓ 已装备</button>' :
                        `<button class="btn btn-equip" onclick="equipMod(${mod.id}, '${mod.model_path}')">⚡ 装备</button>`
                    ) :
                    (canAfford ?
                        `<button class="btn btn-buy" onclick="purchaseMod(${mod.id})">购买</button>` :
                        '<button class="btn btn-buy" disabled>代币不足</button>'
                    )
                }
            </div>
        </div>
    `;
    
    return card;
}

function updateEquippedDisplay() {
    const container = document.getElementById('equippedMod');
    
    if (playerData.equippedMod) {
        container.innerHTML = `
            <h3>⚡ 当前装备</h3>
            <p class="mod-name">${playerData.equippedMod.name}</p>
            <p style="color: #9CA3AF; margin-top: 5px;">${playerData.equippedMod.description}</p>
        `;
    } else {
        container.innerHTML = `
            <h3>⚡ 当前装备</h3>
            <p class="no-equipment">暂无装备</p>
        `;
    }
}

async function purchaseMod(modId) {
    try {
        const response = await fetch(`${apiUrl}/user/${getPlayerIdentifier()}/buy-mod`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mod_id: modId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showNotification('购买成功！', 'success');
            playerData.coins = data.data.user.coins;
            document.getElementById('playerCoins').textContent = playerData.coins.toLocaleString();
            
            await loadPlayerData();
            renderMods();
            renderInventory();
        } else {
            showNotification(data.error || '购买失败', 'error');
        }
    } catch (error) {
        console.error('Purchase failed:', error);
        showNotification('购买失败，请重试', 'error');
    }
}

async function equipMod(modId, modelPath) {
    try {
        sendNUIMessage({
            type: 'equipMod',
            data: {
                modId: modId,
                modelPath: modelPath
            }
        });
        
        playerData.equippedMod = playerData.ownedMods.find(m => m.mod_id === modId);
        updateEquippedDisplay();
        renderInventory();
        
        showNotification('正在应用Mod...', 'success');
    } catch (error) {
        console.error('Equip failed:', error);
        showNotification('装备失败', 'error');
    }
}

function getPlayerIdentifier() {
    return `license:demo`;
}

function sendNUIMessage(data) {
    fetch(`http://${GetParentResourceName()}/__internal_sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).catch(() => {
        console.log('NUI message sent (fallback):', data);
    });
}

function showLoading() {
    document.getElementById('loadingScreen').style.display = 'flex';
    document.getElementById('shopContainer').style.display = 'none';
}

function hideShop() {
    document.getElementById('loadingScreen').style.display = 'flex';
    document.getElementById('shopContainer').style.display = 'none';
}

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function GetParentResourceName() {
    return 'fivem-mod';
}
