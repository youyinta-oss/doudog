let playerCoins = 0;
let ownedMods = [];
let equippedMod = null;
let allMods = [];
let categories = {};
let adminPlayers = [];
let editingModId = null;

window.addEventListener('message', function(event) {
    const data = event.data;

    if (data.type === 'openShop') {
        initShop(data.data);
    }

    if (data.type === 'openAdmin') {
        initAdmin(data.data);
    }

    if (data.type === 'updateData') {
        updatePlayerData(data.data);
    }

    if (data.type === 'updateMods') {
        allMods = data.data;
        renderShopMods();
    }

    if (data.type === 'updateAdminMods') {
        allMods = data.data;
        renderAdminMods();
    }

    if (data.type === 'updateAdminPlayers') {
        adminPlayers = data.data;
        renderPlayers();
    }

    if (data.type === 'notification') {
        showNotification(data.data.message, data.data.type);
    }
});

// 用户商店初始化
function initShop(data) {
    document.getElementById('shopContainer').style.display = 'flex';
    document.getElementById('adminContainer').style.display = 'none';
    
    document.getElementById('playerName').textContent = data.playerName || '玩家';
    playerCoins = data.coins || 0;
    ownedMods = data.ownedMods || [];
    equippedMod = data.equippedMod;
    allMods = data.mods || [];
    categories = data.categories || {};

    updateCoinDisplay();
    renderShopMods();
    renderInventory();
}

// 管理员界面初始化
function initAdmin(data) {
    document.getElementById('shopContainer').style.display = 'none';
    document.getElementById('adminContainer').style.display = 'flex';
    
    categories = data.categories || {};
    renderAdminMods();
    renderPlayers();
}

function updatePlayerData(data) {
    playerCoins = data.coins || 0;
    ownedMods = data.ownedMods || [];
    equippedMod = data.equippedMod;

    updateCoinDisplay();
    renderInventory();
}

function updateCoinDisplay() {
    const coinDisplay = document.getElementById('playerCoins');
    if (coinDisplay) {
        coinDisplay.textContent = playerCoins.toLocaleString();
    }
}

function renderShopMods() {
    const grid = document.getElementById('modsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';

    const ownedIds = ownedMods.map(m => m.mod_id);
    const availableMods = allMods.filter(mod => mod.enabled && !ownedIds.includes(mod.id));

    if (availableMods.length === 0) {
        grid.innerHTML = '<p style="color: #6B7280; text-align: center; grid-column: 1/-1;">暂无可用Mod</p>';
        return;
    }

    availableMods.forEach(mod => {
        const card = createShopModCard(mod);
        grid.appendChild(card);
    });
}

function createShopModCard(mod) {
    const card = document.createElement('div');
    card.className = 'mod-card';

    const canAfford = playerCoins >= mod.price;
    const displayCategory = categories[mod.category] || mod.category;

    card.innerHTML = `
        <div class="mod-image">
            ${mod.image_url ? `<img src="${mod.image_url}" style="width: 100%; height: 100%; object-fit: cover;">` : '🎮'}
        </div>
        <div class="mod-info">
            <h3 class="mod-name">${mod.name}</h3>
            <p class="mod-description">${mod.description || '暂无描述'}</p>
            <div class="mod-price">
                <span class="price-tag">💰 ${mod.price.toLocaleString()}</span>
                <span class="mod-category">${displayCategory}</span>
            </div>
            <div class="mod-actions">
                <button class="btn btn-buy" data-mod-id="${mod.id}" ${canAfford ? '' : 'disabled'}>
                    ${canAfford ? '购买' : '金币不足'}
                </button>
            </div>
        </div>
    `;

    const buyBtn = card.querySelector('.btn-buy');
    buyBtn.addEventListener('click', () => buyMod(mod.id));

    return card;
}

function renderInventory() {
    const grid = document.getElementById('inventoryGrid');
    if (!grid) return;
    
    grid.innerHTML = '';

    updateEquippedDisplay();

    if (ownedMods.length === 0) {
        grid.innerHTML = '<p style="color: #6B7280; text-align: center; grid-column: 1/-1;">您还没有购买任何Mod</p>';
        return;
    }

    ownedMods.forEach(userMod => {
        const card = createInventoryModCard(userMod);
        grid.appendChild(card);
    });
}

function createInventoryModCard(userMod) {
    const card = document.createElement('div');
    card.className = 'mod-card owned';

    const isEquipped = equippedMod && equippedMod.mod_id === userMod.mod_id;
    const displayCategory = categories[userMod.category] || userMod.category;

    card.innerHTML = `
        <div class="mod-image">
            ${userMod.image_url ? `<img src="${userMod.image_url}" style="width: 100%; height: 100%; object-fit: cover;">` : '🎮'}
        </div>
        <div class="mod-info">
            <h3 class="mod-name">${userMod.name}</h3>
            <p class="mod-description">${userMod.description || '暂无描述'}</p>
            <div class="mod-price">
                <span class="mod-category">${displayCategory}</span>
            </div>
            <div class="mod-actions">
                ${isEquipped ? 
                    `<button class="btn btn-unequip" onclick="unequipMod()">卸下</button>` :
                    `<button class="btn btn-equip" onclick="equipMod(${userMod.mod_id})">⚡ 装备</button>`
                }
            </div>
        </div>
    `;

    return card;
}

function updateEquippedDisplay() {
    const container = document.getElementById('equippedMod');
    if (!container) return;

    if (equippedMod) {
        container.innerHTML = `
            <h3>⚡ 当前装备</h3>
            <p class="mod-name">${equippedMod.name}</p>
            <p style="color: #9CA3AF; margin-top: 5px;">${equippedMod.description || ''}</p>
        `;
    } else {
        container.innerHTML = `
            <h3>⚡ 当前装备</h3>
            <p class="no-equipment">暂无装备</p>
        `;
    }
}

// 管理员功能
function renderAdminMods() {
    const grid = document.getElementById('adminModsGrid');
    if (!grid) return;

    grid.innerHTML = '';

    if (allMods.length === 0) {
        grid.innerHTML = '<p style="color: #6B7280; text-align: center; grid-column: 1/-1;">暂无Mod，请添加</p>';
        return;
    }

    allMods.forEach(mod => {
        const card = createAdminModCard(mod);
        grid.appendChild(card);
    });
}

function createAdminModCard(mod) {
    const card = document.createElement('div');
    card.className = 'mod-card';

    const displayCategory = categories[mod.category] || mod.category;

    card.innerHTML = `
        <div class="mod-image">
            ${mod.image_url ? `<img src="${mod.image_url}" style="width: 100%; height: 100%; object-fit: cover;">` : '🎮'}
        </div>
        <div class="mod-info">
            <h3 class="mod-name">${mod.name}</h3>
            <p class="mod-description">${mod.description || '暂无描述'}</p>
            <div class="mod-price">
                <span class="price-tag">💰 ${mod.price.toLocaleString()}</span>
                <span class="mod-category">${displayCategory}</span>
            </div>
            <div style="margin-bottom: 10px;">
                <span class="badge ${mod.enabled ? 'badge-success' : 'badge-error'}" style="font-size: 0.85rem;">
                    ${mod.enabled ? '上架中' : '已下架'}
                </span>
            </div>
            <div class="mod-actions">
                <button class="btn btn-edit btn-small" onclick="startEditMod(${mod.id})">编辑</button>
                <button class="btn btn-danger btn-small" onclick="deleteMod(${mod.id})">删除</button>
            </div>
            <div id="edit-form-${mod.id}" style="display: none;" class="edit-form"></div>
        </div>
    `;

    return card;
}

function startEditMod(modId) {
    const mod = allMods.find(m => m.id === modId);
    if (!mod) return;

    editingModId = modId;
    const formContainer = document.getElementById(`edit-form-${modId}`);
    formContainer.style.display = 'block';

    formContainer.innerHTML = `
        <input type="text" id="edit-name-${modId}" value="${mod.name}" placeholder="名称">
        <input type="number" id="edit-price-${modId}" value="${mod.price}" placeholder="价格">
        <input type="text" id="edit-model-${modId}" value="${mod.model}" placeholder="模型">
        <input type="text" id="edit-image-${modId}" value="${mod.image_url || ''}" placeholder="图片URL">
        <textarea id="edit-desc-${modId}" placeholder="描述">${mod.description || ''}</textarea>
        <select id="edit-category-${modId}">
            ${Object.keys(categories).map(key => `<option value="${key}" ${mod.category === key ? 'selected' : ''}>${categories[key]}</option>`).join('')}
        </select>
        <select id="edit-enabled-${modId}">
            <option value="true" ${mod.enabled ? 'selected' : ''}>上架</option>
            <option value="false" ${!mod.enabled ? 'selected' : ''}>下架</option>
        </select>
        <div style="display: flex; gap: 10px; margin-top: 10px;">
            <button class="btn btn-primary btn-small" onclick="saveEditMod(${modId})">保存</button>
            <button class="btn btn-small" style="background: rgba(107, 114, 128, 0.2); border: 2px solid #6B7280; color: #9CA3AF;" onclick="cancelEditMod(${modId})">取消</button>
        </div>
    `;
}

function cancelEditMod(modId) {
    const formContainer = document.getElementById(`edit-form-${modId}`);
    formContainer.style.display = 'none';
    editingModId = null;
}

function saveEditMod(modId) {
    const modData = {
        id: modId,
        name: document.getElementById(`edit-name-${modId}`).value,
        price: parseInt(document.getElementById(`edit-price-${modId}`).value),
        model: document.getElementById(`edit-model-${modId}`).value,
        image_url: document.getElementById(`edit-image-${modId}`).value,
        description: document.getElementById(`edit-desc-${modId}`).value,
        category: document.getElementById(`edit-category-${modId}`).value,
        enabled: document.getElementById(`edit-enabled-${modId}`).value === 'true'
    };

    fetchNUI('adminEditMod', modData);
    cancelEditMod(modId);
}

function deleteMod(modId) {
    if (!confirm('确定要删除这个Mod吗？')) return;
    fetchNUI('adminDeleteMod', { id: modId });
}

function renderPlayers() {
    const grid = document.getElementById('playersGrid');
    if (!grid) return;

    grid.innerHTML = '';

    if (adminPlayers.length === 0) {
        grid.innerHTML = '<p style="color: #6B7280; text-align: center; grid-column: 1/-1;">暂无在线玩家</p>';
        return;
    }

    adminPlayers.forEach(player => {
        const card = document.createElement('div');
        card.className = 'player-card';
        card.innerHTML = `
            <h3>${player.name}</h3>
            <div class="player-id">${player.identifier}</div>
            <div class="player-coins-display">
                💰 ${player.coins.toLocaleString()} 金币
            </div>
            <div class="give-coins-form">
                <input type="number" id="give-coins-${player.id}" placeholder="输入数量" min="1">
                <button class="btn btn-primary btn-small" onclick="giveCoins(${player.id})">赠送</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function giveCoins(playerId) {
    const input = document.getElementById(`give-coins-${playerId}`);
    const amount = parseInt(input.value);

    if (!amount || amount <= 0) {
        showAdminNotification('请输入有效数量', 'error');
        return;
    }

    fetchNUI('adminGiveCoins', { playerId: playerId, amount: amount });
    input.value = '';
}

// 事件监听器
document.getElementById('closeBtn').addEventListener('click', () => {
    fetchNUI('closeShop');
});

document.getElementById('closeAdminBtn').addEventListener('click', () => {
    fetchNUI('closeShop');
});

document.getElementById('addModBtn').addEventListener('click', () => {
    const modData = {
        name: document.getElementById('modName').value,
        description: document.getElementById('modDescription').value,
        price: parseInt(document.getElementById('modPrice').value),
        image_url: document.getElementById('modImage').value,
        model: document.getElementById('modModel').value,
        category: document.getElementById('modCategory').value
    };

    if (!modData.name || !modData.price || !modData.model) {
        showAdminNotification('请填写所有必填项', 'error');
        return;
    }

    fetchNUI('adminAddMod', modData);

    // 清空表单
    document.getElementById('modName').value = '';
    document.getElementById('modDescription').value = '';
    document.getElementById('modPrice').value = '';
    document.getElementById('modImage').value = '';
    document.getElementById('modModel').value = '';
});

document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        
        const targetTab = tabName === 'shop' ? 'shopTab' : 'inventoryTab';
        document.getElementById(targetTab).style.display = 'block';
    });
});

document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        
        const targetTab = tabName === 'mods' ? 'adminModsTab' : 'adminPlayersTab';
        document.getElementById(targetTab).style.display = 'block';
    });
});

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    const text = document.getElementById('notificationText');
    text.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function showAdminNotification(message, type) {
    const notification = document.getElementById('adminNotification');
    const text = document.getElementById('adminNotificationText');
    text.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';

    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function buyMod(modId) {
    fetchNUI('buyMod', { modId: modId });
}

function equipMod(modId) {
    fetchNUI('equipMod', { modId: modId });
}

function unequipMod() {
    fetchNUI('unequipMod', {});
}

function fetchNUI(type, data) {
    const message = {
        type: type,
        data: data || {}
    };
    
    if (window.parent && window.parent !== window) {
        window.parent.postMessage(message, '*');
    } else {
        console.log('NUI:', message);
        // 开发模式下模拟
        if (type === 'buyMod') {
            const mod = allMods.find(m => m.id === data.modId);
            if (mod && playerCoins >= mod.price) {
                playerCoins -= mod.price;
                ownedMods.push({
                    mod_id: mod.id,
                    name: mod.name,
                    description: mod.description,
                    price: mod.price,
                    image_url: mod.image_url,
                    model: mod.model,
                    category: mod.category,
                    equipped: false
                });
                updatePlayerData({ coins: playerCoins, ownedMods, equippedMod });
                renderShopMods();
            }
        } else if (type === 'equipMod') {
            const userMod = ownedMods.find(m => m.mod_id === data.modId);
            if (userMod) {
                ownedMods.forEach(m => m.equipped = false);
                userMod.equipped = true;
                equippedMod = userMod;
                updatePlayerData({ coins: playerCoins, ownedMods, equippedMod });
            }
        } else if (type === 'unequipMod') {
            ownedMods.forEach(m => m.equipped = false);
            equippedMod = null;
            updatePlayerData({ coins: playerCoins, ownedMods, equippedMod });
        }
    }
}
