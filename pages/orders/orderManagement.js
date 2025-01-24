import { useState } from 'react';
import { HiPlus } from 'react-icons/hi';
import { FaTrash } from 'react-icons/fa';
import Layout from '@/components/Layout/Layout';
import styles from '@/styles/modules/pages/orders.module.css';
import { productsData } from '@/data/products';

const statusMap = {
  pending: { text: '待处理', color: '#f59e0b' },
  producing: { text: '生产中', color: '#3b82f6' },
  shipped: { text: '已发货', color: '#10b981' },
  cancelled: { text: '已取消', color: '#ef4444' }
};

export default function OrderManagement() {
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [orders, setOrders] = useState([
    {
      id: 'ORD20250122001',
      productId: '1',
      productName: '定制棒球帽',
      model: 'L码',
      recipientInfo: '张三 13800138000\n北京市朝阳区某某街道1号楼',
      status: 'pending',
      createdAt: '2025-01-22T10:30:00'
    },
    {
      id: 'ORD20250122002',
      productId: '2',
      productName: '个性定制T恤',
      model: 'XL码 白色',
      recipientInfo: '李四 13900139000\n上海市浦东新区某某路2号',
      status: 'producing',
      createdAt: '2025-01-21T15:20:00'
    },
    {
      id: 'ORD20250122003',
      productId: '3',
      productName: '创意马克杯',
      model: '350ml',
      recipientInfo: '王五 13700137000\n广州市天河区某某大厦3楼',
      status: 'cancelled',
      createdAt: '2025-01-20T09:15:00'
    },
    {
      id: 'ORD20250122004',
      productId: '4',
      productName: '艺术帆布包',
      model: '大号',
      recipientInfo: '赵六 13600136000\n深圳市南山区某某园区4号',
      status: 'shipped',
      createdAt: '2025-01-19T14:45:00'
    },
    {
      id: 'ORD20250122005',
      productId: '5',
      productName: '定制手机壳',
      model: 'iPhone 14 Pro',
      recipientInfo: '孙七 13500135000\n成都市武侯区某某街5号',
      status: 'producing',
      createdAt: '2025-01-18T11:25:00'
    }
  ]);
  const [newOrder, setNewOrder] = useState({
    productId: '',
    model: '',
    recipientInfo: '',
    image: null,
    imagePreview: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOrder(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewOrder(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleCreateOrder = () => {
    const newOrderData = {
      id: Date.now(),
      ...newOrder,
      status: 'pending',
      createdAt: new Date().toISOString(),
      productName: productsData.find(p => p.id === parseInt(newOrder.productId))?.title || ''
    };

    setOrders(prev => [newOrderData, ...prev]);
    setShowCreateModal(false);
    setNewOrder({
      productId: '',
      model: '',
      recipientInfo: '',
      image: null,
      imagePreview: ''
    });
  };

  const handleDeleteOrder = (orderId) => {
    setOrders(prev => prev.filter(order => order.id !== orderId));
  };

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  return (
    <Layout>
      <div className={styles.container}>
        <button 
          className={styles.createButton}
          onClick={() => setShowCreateModal(true)}
        >
          <HiPlus />
          创建订单
        </button>

        <div className={styles.tabsContainer}>
          <div className={styles.tabs}>
            <div 
              className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`}
              onClick={() => setActiveTab('all')}
            >
              全部订单
            </div>
            <div
              className={`${styles.tab} ${activeTab === 'pending' ? styles.active : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              待处理
            </div>
            <div
              className={`${styles.tab} ${activeTab === 'producing' ? styles.active : ''}`}
              onClick={() => setActiveTab('producing')}
            >
              生产中
            </div>
            <div
              className={`${styles.tab} ${activeTab === 'shipped' ? styles.active : ''}`}
              onClick={() => setActiveTab('shipped')}
            >
              已发货
            </div>
            <div
              className={`${styles.tab} ${activeTab === 'cancelled' ? styles.active : ''}`}
              onClick={() => setActiveTab('cancelled')}
            >
              已取消
            </div>
          </div>
        </div>

        <div className={styles.orderGrid}>
          {filteredOrders.map(order => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <span className={styles.orderNumber}>订单号: {order.id}</span>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDeleteOrder(order.id)}
                >
                  <FaTrash />
                </button>
              </div>
              <div className={styles.orderDetails}>
                <p><strong>商品:</strong> {order.productName}</p>
                <p><strong>型号:</strong> {order.model}</p>
                <p><strong>收件人信息:</strong> {order.recipientInfo}</p>
                {order.imagePreview && (
                  <div className={styles.orderImage}>
                    <img src={order.imagePreview} alt="订单图片" />
                  </div>
                )}
              </div>
              <div 
                className={styles.orderStatus}
                style={{ backgroundColor: statusMap[order.status].color }}
              >
                {statusMap[order.status].text}
              </div>
            </div>
          ))}
        </div>

        {showCreateModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2>创建新订单</h2>
              <form onSubmit={e => { e.preventDefault(); handleCreateOrder(); }}>
                <div className={styles.formGroup}>
                  <label>选择商品:</label>
                  <select 
                    name="productId"
                    value={newOrder.productId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">请选择商品</option>
                    {productsData.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>型号:</label>
                  <input
                    type="text"
                    name="model"
                    value={newOrder.model}
                    onChange={handleInputChange}
                    placeholder="请输入型号（如有）"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>收件人信息:</label>
                  <textarea
                    name="recipientInfo"
                    value={newOrder.recipientInfo}
                    onChange={handleInputChange}
                    placeholder="请输入完整收件信息（姓名、电话、地址）"
                    required
                    className={styles.recipientInfo}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>上传图片:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={styles.fileInput}
                  />
                  {newOrder.imagePreview && (
                    <div className={styles.imagePreview}>
                      <img src={newOrder.imagePreview} alt="预览图" />
                    </div>
                  )}
                </div>

                <div className={styles.modalActions}>
                  <button type="button" onClick={() => setShowCreateModal(false)}>
                    取消
                  </button>
                  <button type="submit">
                    确认创建
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
