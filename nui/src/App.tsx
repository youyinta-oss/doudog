import React, { useState, useEffect } from 'react'

interface Dealership {
  id: number
  owner: string
  name: string
  balance: number
}

interface Vehicle {
  id: number
  plate: string
  model: string
  label: string
  props: any
  price: number
  status: string
  inspection: Inspection
}

interface ShowroomSlot {
  id: number
  slot: number
  inventory_id: number
  label: string
  model: string
  price: number
  inspection: Inspection
}

interface Transaction {
  id: number
  type: string
  amount: number
  balance_after: number
  description: string
  created_at: string
}

interface PlayerVehicle {
  plate: string
  model: string
  props: any
}

interface Inspection {
  engine: number
  engineCondition: string
  body: number
  bodyCondition: string
  interior: number
  interiorCondition: string
  mileage: number
  modifications: any[]
  repairs: any[]
  accidentHistory: any[]
  inspectionDate: string
}

type TabType = 'overview' | 'inventory' | 'showroom' | 'account' | 'billing' | 'upload' | 'purchase'

function App() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [dealership, setDealership] = useState<Dealership | null>(null)
  const [inventory, setInventory] = useState<Vehicle[]>([])
  const [showroom, setShowroom] = useState<ShowroomSlot[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [playerVehicles, setPlayerVehicles] = useState<PlayerVehicle[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'inspection' | 'price' | 'deposit' | 'withdraw' | 'upload' | 'purchase'>('inspection')
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    const handleMessage = (event: CustomEvent<NuiMessage>) => {
      const { type, data } = event.detail

      switch (type) {
        case 'open':
          setIsOpen(true)
          loadData()
          break
        case 'close':
          setIsOpen(false)
          break
        case 'setDealership':
          setDealership(data)
          break
        case 'setInventory':
          setInventory(data)
          break
        case 'setShowroom':
          setShowroom(data)
          break
        case 'setTransactions':
          setTransactions(data)
          break
        case 'setPlayerVehicles':
          setPlayerVehicles(data)
          break
      }
    }

    window.addEventListener('nuiMessage', handleMessage as EventListener)
    return () => window.removeEventListener('nuiMessage', handleListener as EventListener)
  }, [])

  const handleListener = () => {}

  const loadData = () => {
    sendNuiMessage('getInventory')
    sendNuiMessage('getShowroom')
    sendNuiMessage('getAccount')
    sendNuiMessage('getTransactions')
  }

  const sendNuiMessage = (type: string, data?: any) => {
    fetch(`https://${GetParentResourceName()}/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data || {})
    }).catch(() => {})
  }

  const handleClose = () => {
    sendNuiMessage('close')
  }

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    if (tab === 'upload') {
      sendNuiMessage('getPlayerVehicles')
    }
  }

  const openModal = (type: 'inspection' | 'price' | 'deposit' | 'withdraw' | 'upload' | 'purchase', vehicle?: Vehicle) => {
    setModalType(type)
    setSelectedVehicle(vehicle || null)
    setInputValue('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelectedVehicle(null)
  }

  const handleSubmit = () => {
    switch (modalType) {
      case 'price':
        if (selectedVehicle && inputValue) {
          sendNuiMessage('updatePrice', { inventoryId: selectedVehicle.id, price: parseFloat(inputValue) })
        }
        break
      case 'deposit':
        if (inputValue) {
          const amount = parseFloat(inputValue)
          sendNuiMessage('deposit', { amount, moneyType: 'bank' })
        }
        break
      case 'withdraw':
        if (inputValue) {
          sendNuiMessage('withdraw', { amount: parseFloat(inputValue) })
        }
        break
      case 'upload':
        if (inputValue) {
          sendNuiMessage('uploadVehicle', { plate: inputValue })
        }
        break
    }
    closeModal()
  }

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const getConditionBadgeClass = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'badge-excellent'
      case 'good': return 'badge-good'
      case 'fair': return 'badge-fair'
      case 'poor': return 'badge-poor'
      default: return ''
    }
  }

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'excellent': return '优秀'
      case 'good': return '良好'
      case 'fair': return '一般'
      case 'poor': return '较差'
      default: return condition
    }
  }

  if (!isOpen) return null

  return (
    <div className="app">
      <div className="header">
        <h1>🚗 二手车行管理系统</h1>
        <button className="close-btn" onClick={handleClose}>✕</button>
      </div>

      <div className="nav-tabs">
        <button className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => handleTabChange('overview')}>概览</button>
        <button className={`nav-tab ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => handleTabChange('inventory')}>库存管理</button>
        <button className={`nav-tab ${activeTab === 'showroom' ? 'active' : ''}`} onClick={() => handleTabChange('showroom')}>展厅配置</button>
        <button className={`nav-tab ${activeTab === 'account' ? 'active' : ''}`} onClick={() => handleTabChange('account')}>车行账户</button>
        <button className={`nav-tab ${activeTab === 'billing' ? 'active' : ''}`} onClick={() => handleTabChange('billing')}>账单流水</button>
        <button className={`nav-tab ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => handleTabChange('upload')}>上传车辆</button>
        <button className={`nav-tab ${activeTab === 'purchase' ? 'active' : ''}`} onClick={() => handleTabChange('purchase')}>收购车辆</button>
      </div>

      <div className="content">
        {activeTab === 'overview' && (
          <div className="grid grid-2">
            <div className="card">
              <div className="card-header">
                <span className="card-title">车行余额</span>
              </div>
              <div className="card-value">{formatMoney(dealership?.balance || 0)}</div>
            </div>
            <div className="card">
              <div className="card-header">
                <span className="card-title">库存车辆</span>
              </div>
              <div className="card-value">{inventory.length}</div>
            </div>
            <div className="card">
              <div className="card-header">
                <span className="card-title">展厅展位</span>
              </div>
              <div className="card-value">{showroom.filter(s => s.inventory_id).length} / {showroom.length}</div>
            </div>
            <div className="card">
              <div className="card-header">
                <span className="card-title">本月交易</span>
              </div>
              <div className="card-value">{transactions.length}</div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div>
            <div className="grid grid-4" style={{ marginBottom: '20px' }}>
              <div className="card">
                <div className="card-title">库存总数</div>
                <div className="card-value">{inventory.length}</div>
              </div>
              <div className="card">
                <div className="card-title">仓库中</div>
                <div className="card-value">{inventory.filter(v => v.status === 'stored').length}</div>
              </div>
              <div className="card">
                <div className="card-title">展厅中</div>
                <div className="card-value">{inventory.filter(v => v.status === 'showroom').length}</div>
              </div>
              <div className="card">
                <div className="card-title">已售出</div>
                <div className="card-value">{inventory.filter(v => v.status === 'sold').length}</div>
              </div>
            </div>

            {inventory.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🚗</div>
                <p>暂无库存车辆</p>
              </div>
            ) : (
              <div className="grid grid-2">
                {inventory.map(vehicle => (
                  <div key={vehicle.id} className="vehicle-card">
                    <div className="vehicle-header">
                      <div>
                        <div className="vehicle-name">{vehicle.label}</div>
                        <span className={`badge badge-${vehicle.status}`}>{vehicle.status === 'stored' ? '库存' : vehicle.status === 'showroom' ? '展厅' : '已售'}</span>
                      </div>
                      <span className="vehicle-plate">{vehicle.plate}</span>
                    </div>

                    <div className="vehicle-info">
                      <div className="vehicle-info-item">
                        <span className="vehicle-info-label">价格</span>
                        <span className="vehicle-info-value">{formatMoney(vehicle.price)}</span>
                      </div>
                      {vehicle.inspection && (
                        <>
                          <div className="vehicle-info-item">
                            <span className="vehicle-info-label">发动机</span>
                            <span className={`badge ${getConditionBadgeClass(vehicle.inspection.engineCondition)}`}>{getConditionLabel(vehicle.inspection.engineCondition)}</span>
                          </div>
                          <div className="vehicle-info-item">
                            <span className="vehicle-info-label">里程</span>
                            <span className="vehicle-info-value">{vehicle.inspection.mileage.toLocaleString()} km</span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="actions">
                      {vehicle.inspection && (
                        <button className="btn btn-secondary btn-sm" onClick={() => openModal('inspection', vehicle)}>检测报告</button>
                      )}
                      <button className="btn btn-primary btn-sm" onClick={() => openModal('price', vehicle)}>改价</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'showroom' && (
          <div>
            <div className="showroom-grid">
              {showroom.map(slot => (
                <div key={slot.id} className={`showroom-slot ${slot.inventory_id ? 'occupied' : ''}`}>
                  <span className="showroom-slot-label">展位 {slot.slot}</span>
                  {slot.inventory_id ? (
                    <>
                      <span className="showroom-slot-name">{slot.label}</span>
                      <span className="showroom-slot-price">{formatMoney(slot.price)}</span>
                      <div className="showroom-slot-actions">
                        <button className="btn btn-secondary btn-sm" onClick={() => openModal('inspection', slot as unknown as Vehicle)}>检测</button>
                        <button className="btn btn-danger btn-sm" onClick={() => sendNuiMessage('removeFromShowroom', { slotId: slot.id })}>移除</button>
                      </div>
                    </>
                  ) : (
                    <span className="text-muted">空展位</span>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: '24px' }}>
              <div className="section-title">从库存上架</div>
              <div className="grid grid-3">
                {inventory.filter(v => v.status === 'stored').map(vehicle => (
                  <div key={vehicle.id} className="vehicle-card">
                    <div className="vehicle-header">
                      <span className="vehicle-name">{vehicle.label}</span>
                      <span className="vehicle-plate">{vehicle.plate}</span>
                    </div>
                    <div className="vehicle-info">
                      <div className="vehicle-info-item">
                        <span className="vehicle-info-label">价格</span>
                        <span className="vehicle-info-value">{formatMoney(vehicle.price)}</span>
                      </div>
                    </div>
                    <button className="btn btn-success btn-sm btn-block" onClick={() => {
                      const emptySlot = showroom.find(s => !s.inventory_id)
                      if (emptySlot) {
                        sendNuiMessage('addToShowroom', { slotId: emptySlot.id, inventoryId: vehicle.id })
                      }
                    }}>上架到空展位</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div>
            <div className="grid grid-2">
              <div className="card">
                <div className="card-title">当前余额</div>
                <div className="card-value">{formatMoney(dealership?.balance || 0)}</div>
              </div>
            </div>

            <div className="grid grid-2" style={{ marginTop: '20px' }}>
              <div className="card">
                <div className="card-header">
                  <span className="card-title">充值</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>从银行账户充值到车行</p>
                <button className="btn btn-primary" onClick={() => openModal('deposit')}>充值</button>
              </div>
              <div className="card">
                <div className="card-header">
                  <span className="card-title">提现</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>从车行余额提现到现金</p>
                <button className="btn btn-warning" onClick={() => openModal('withdraw')}>提现</button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div>
            {transactions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <p>暂无交易记录</p>
              </div>
            ) : (
              <div className="transaction-list">
                {transactions.map(tx => (
                  <div key={tx.id} className="transaction-item">
                    <div className="transaction-info">
                      <span className="transaction-type">
                        {tx.type === 'sale' ? '💰 售出' : tx.type === 'purchase' ? '🚗 收购' : tx.type === 'deposit' ? '💳 充值' : '💵 提现'}
                      </span>
                      <span className="transaction-desc">{tx.description} · {formatDate(tx.created_at)}</span>
                    </div>
                    <span className={`transaction-amount ${tx.amount >= 0 ? 'positive' : 'negative'}`}>
                      {tx.amount >= 0 ? '+' : ''}{formatMoney(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'upload' && (
          <div>
            <div className="card">
              <div className="card-header">
                <span className="card-title">上传车辆到库存</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>将你名下的车辆上传到车行库存，系统会自动生成检测报告</p>

              {playerVehicles.length === 0 ? (
                <div className="empty-state">
                  <p>你没有可上传的车辆</p>
                </div>
              ) : (
                <div className="grid grid-2">
                  {playerVehicles.map(vehicle => (
                    <div key={vehicle.plate} className="vehicle-card">
                      <div className="vehicle-header">
                        <span className="vehicle-name">{vehicle.model}</span>
                        <span className="vehicle-plate">{vehicle.plate}</span>
                      </div>
                      <button className="btn btn-primary btn-block" onClick={() => sendNuiMessage('uploadVehicle', { plate: vehicle.plate })}>上传到库存</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'purchase' && (
          <div>
            <div className="card">
              <div className="card-header">
                <span className="card-title">收购车辆</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>收购其他玩家的车辆，自动从车行账户扣除</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>提示：收购时请确保目标玩家在附近</p>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            {modalType === 'inspection' && selectedVehicle?.inspection && (
              <>
                <div className="modal-header">
                  <h3 className="modal-title">车辆检测报告</h3>
                  <button className="close-btn" onClick={closeModal}>✕</button>
                </div>
                <div className="modal-body">
                  <div className="vehicle-header" style={{ marginBottom: '20px' }}>
                    <div>
                      <div className="vehicle-name">{selectedVehicle.label}</div>
                      <span className="vehicle-plate">{selectedVehicle.plate}</span>
                    </div>
                  </div>

                  <div className="condition-grid">
                    <div className="condition-item">
                      <div className="condition-label">发动机</div>
                      <div className="condition-value">{selectedVehicle.inspection.engine}%</div>
                      <span className={`badge ${getConditionBadgeClass(selectedVehicle.inspection.engineCondition)}`}>{getConditionLabel(selectedVehicle.inspection.engineCondition)}</span>
                      <div className="condition-bar">
                        <div className={`condition-bar-fill ${selectedVehicle.inspection.engineCondition}`} style={{ width: `${selectedVehicle.inspection.engine}%` }}></div>
                      </div>
                    </div>
                    <div className="condition-item">
                      <div className="condition-label">车身</div>
                      <div className="condition-value">{selectedVehicle.inspection.body}%</div>
                      <span className={`badge ${getConditionBadgeClass(selectedVehicle.inspection.bodyCondition)}`}>{getConditionLabel(selectedVehicle.inspection.bodyCondition)}</span>
                      <div className="condition-bar">
                        <div className={`condition-bar-fill ${selectedVehicle.inspection.bodyCondition}`} style={{ width: `${selectedVehicle.inspection.body}%` }}></div>
                      </div>
                    </div>
                    <div className="condition-item">
                      <div className="condition-label">内饰</div>
                      <div className="condition-value">{selectedVehicle.inspection.interior}%</div>
                      <span className={`badge ${getConditionBadgeClass(selectedVehicle.inspection.interiorCondition)}`}>{getConditionLabel(selectedVehicle.inspection.interiorCondition)}</span>
                      <div className="condition-bar">
                        <div className={`condition-bar-fill ${selectedVehicle.inspection.interiorCondition}`} style={{ width: `${selectedVehicle.inspection.interior}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '20px' }}>
                    <div className="section-title">基本信息</div>
                    <div className="vehicle-info">
                      <div className="vehicle-info-item">
                        <span className="vehicle-info-label">里程数</span>
                        <span className="vehicle-info-value">{selectedVehicle.inspection.mileage.toLocaleString()} km</span>
                      </div>
                      <div className="vehicle-info-item">
                        <span className="vehicle-info-label">检测日期</span>
                        <span className="vehicle-info-value">{selectedVehicle.inspection.inspectionDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {modalType === 'price' && selectedVehicle && (
              <>
                <div className="modal-header">
                  <h3 className="modal-title">修改价格</h3>
                  <button className="close-btn" onClick={closeModal}>✕</button>
                </div>
                <div className="modal-body">
                  <p style={{ marginBottom: '16px' }}>车辆: {selectedVehicle.label} ({selectedVehicle.plate})</p>
                  <div className="form-group">
                    <label className="form-label">新价格 ($)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      placeholder={selectedVehicle.price.toString()}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={closeModal}>取消</button>
                  <button className="btn btn-primary" onClick={handleSubmit}>确认</button>
                </div>
              </>
            )}

            {modalType === 'deposit' && (
              <>
                <div className="modal-header">
                  <h3 className="modal-title">充值</h3>
                  <button className="close-btn" onClick={closeModal}>✕</button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">充值金额 ($)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      placeholder="请输入金额"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={closeModal}>取消</button>
                  <button className="btn btn-primary" onClick={handleSubmit}>确认充值</button>
                </div>
              </>
            )}

            {modalType === 'withdraw' && (
              <>
                <div className="modal-header">
                  <h3 className="modal-title">提现</h3>
                  <button className="close-btn" onClick={closeModal}>✕</button>
                </div>
                <div className="modal-body">
                  <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>当前余额: {formatMoney(dealership?.balance || 0)}</p>
                  <div className="form-group">
                    <label className="form-label">提现金额 ($)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      placeholder="请输入金额"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={closeModal}>取消</button>
                  <button className="btn btn-warning" onClick={handleSubmit}>确认提现</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
