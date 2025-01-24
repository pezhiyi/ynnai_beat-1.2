import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/modules/pages/message.module.css';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { FaNewspaper, FaBox, FaPalette, FaHandshake, FaBookOpen, FaCopy } from 'react-icons/fa';
import Layout from '../components/Layout/Layout';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { callDeepseekApi } from '@/utils/deepseekApi';

// 导出新闻数据
export const newsData = [
  {
    id: 1,
    title: '磁吸宠物手机壳新品上市',
    date: '2025-01-21',
    desc: '支持iPhone 15/16全系列，MagSafe磁吸无线充电，镜面质感高清打印，完美展现爱宠形象，防摔保护',
    category: '选品广场',
    image: '/news_image/phone-case.jpg',
    features: [
      'MagSafe磁吸技术，支持15W快速无线充电',
      '德国拜耳PC材质，军工级防摔保护',
      '高清镜面UV打印，细腻还原宠物照片',
      '超薄设计，完美贴合手机曲线',
      '防指纹涂层，长期保持清洁透亮'
    ],
    usage: [
      '选择适合您手机型号的手机壳款式',
      '上传您的宠物高清照片（建议像素不低于2000*2000）',
      '选择照片布局和滤镜效果',
      '确认设计效果并提交订单',
      '3-5个工作日内发货'
    ],
    additionalInfo: '本产品通过SGS防摔测试，从1.5米高度自由落体不会对手机造成损坏。支持所有符合MagSafe标准的无线充电器和配件。提供12个月免费质保服务。'
  },
  {
    id: 2,
    title: '龙年主题模板上线',
    date: '2025-01-18',
    desc: '龙年主题系列，喜庆红色元素，多种布局可选，让新年更添温馨',
    category: '模板设计',
    image: '/news_image/spring-template.jpg',
    features: [
      '原创龙年主题元素，独特创意设计',
      '多种布局方案，适合不同场景使用',
      '可自定义颜色和字体，灵活调整',
      '高分辨率素材，支持大尺寸打印',
      '含节日祝福文案，可一键套用'
    ],
    usage: [
      '在模板库中选择喜欢的龙年主题模板',
      '上传您的宠物照片',
      '调整照片位置和大小',
      '选择合适的文字和装饰元素',
      '导出高清成品图片'
    ],
    additionalInfo: '龙年主题模板将持续更新至2025年春节，会员可免费使用所有模板。支持横版、竖版多种尺寸，适合社交媒体发布和实体打印。'
  },
  {
    id: 3,
    title: 'AI抠图功能升级',
    date: '2025-01-15',
    desc: '全新算法升级，更精准的边缘识别，一键去除复杂背景，提升工作效率',
    category: '服务介绍',
    image: '/news_image/koutu.png',
    features: [
      '新一代AI边缘识别算法，精度提升300%',
      '支持批量处理，效率大幅提升',
      '智能处理毛发边缘，更自然真实',
      '一键替换背景，场景自由切换',
      '支持透明背景导出，兼容各种设计软件'
    ],
    usage: [
      '上传需要抠图的宠物照片',
      '点击"一键抠图"按钮',
      '使用工具微调边缘细节（可选）',
      '选择导出格式（支持PNG/PSD）',
      '下载成品图片'
    ],
    additionalInfo: '新版抠图功能已经过10万张宠物图片的训练，对各类宠物毛发纹理都有很好的识别效果。支持最大30M的图片处理，批量处理每次最多50张。'
  },
  {
    id: 4,
    title: '星蝶风装饰画动漫照绘制',
    date: '2025-01-12',
    desc: 'AI画像一键生成手绘头像漫画，设计成本可以忽略不计，情侣礼物画像定制卡通手绘头像漫画',
    category: '使用教程',
    image: '/news_image/xingdiefeng.png',
    features: [
      '独特星蝶风格，梦幻唯美',
      'AI智能绘制，快速生成',
      '支持多种风格切换',
      '可定制专属装饰元素',
      '适合制作装饰画和礼物'
    ],
    usage: [
      '上传清晰的宠物正面照片',
      '选择喜欢的星蝶风格和效果',
      '添加个性化装饰元素',
      '调整细节和色彩',
      '导出高清成品图片'
    ],
    additionalInfo: '星蝶风格是基于日本知名画师手绘风格开发，AI深度学习算法确保每张作品都独一无二。支持最大输出4K分辨率，适合大尺寸装饰画打印。'
  },
  {
    id: 5,
    title: '定制宠物抱枕新品',
    date: '2025-01-09',
    desc: '宠物风格叠加设计，3D立体印花技术，加厚超柔面料，送礼自用两相宜',
    category: '选品广场',
    image: '/news_image/baozhen.png',
    features: [
      '3D立体印花，细腻还原宠物形象',
      '高密度超柔面料，触感舒适',
      '隐形拉链设计，可拆洗内胆',
      '多尺寸可选，适合不同场景',
      '环保无味材质，安全健康'
    ],
    usage: [
      '选择抱枕尺寸和形状',
      '上传宠物照片（建议正面清晰照）',
      '选择布局和背景样式',
      '确认设计效果',
      '7-10个工作日制作完成发货'
    ],
    additionalInfo: '抱枕采用进口面料，耐水洗不褪色，送礼自用都很合适。提供45*45cm、60*60cm两种尺寸，可选方形或心形款式。'
  },
  {
    id: 6,
    title: '冬季温馨风模板上线',
    date: '2025-01-06',
    desc: '温暖色调，雪景元素，打造温馨幸福的冬日氛围',
    category: '模板设计',
    image: 'https://picsum.photos/200?random=6'
  },
  {
    id: 7,
    title: '图片批量处理功能',
    date: '2025-01-03',
    desc: '支持多图同时编辑，统一滤镜效果，提高工作效率',
    category: '服务介绍',
    image: 'https://picsum.photos/200?random=7'
  },
  {
    id: 8,
    title: '室内拍摄光线技巧',
    date: '2024-12-30',
    desc: '自然光运用，补光设备选择，后期调整方法详解',
    category: '使用教程',
    image: 'https://picsum.photos/200?random=8'
  },
  {
    id: 9,
    title: '宠物专属台历定制',
    date: '2024-12-27',
    desc: '2025年新款台历，12个月精美模板，记录爱宠的每一个瞬间',
    category: '选品广场',
    image: 'https://picsum.photos/200?random=9'
  },
  {
    id: 10,
    title: '圣诞节主题模板',
    date: '2024-12-24',
    desc: '圣诞老人、驯鹿等元素，节日氛围浓厚，打造温馨圣诞回忆',
    category: '模板设计',
    image: 'https://picsum.photos/200?random=10'
  },
  {
    id: 11,
    title: '宠物相册定制服务',
    date: '2024-12-20',
    desc: '精装烫金封面，相纸高清打印，多种版式可选，永久保存美好回忆',
    category: '选品广场',
    image: 'https://picsum.photos/200?random=11'
  },
  {
    id: 12,
    title: '冬季温暖主题模板',
    date: '2024-12-17',
    desc: '温暖色调，毛衣元素，营造温馨舒适的冬日氛围',
    category: '模板设计',
    image: 'https://picsum.photos/200?random=12'
  },
  {
    id: 13,
    title: '在线设计师咨询',
    date: '2024-12-14',
    desc: '一对一专业指导，解答设计疑惑，提供个性化建议',
    category: '服务介绍',
    image: 'https://picsum.photos/200?random=13'
  },
  {
    id: 14,
    title: '滤镜调色进阶教程',
    date: '2024-12-11',
    desc: '色彩理论基础，调色技巧分享，打造专业级照片',
    category: '使用教程',
    image: 'https://picsum.photos/200?random=14'
  },
  {
    id: 15,
    title: '宠物定制帆布包',
    date: '2024-12-08',
    desc: '环保材质，多种尺寸，个性化图案印制，实用美观',
    category: '选品广场',
    image: 'https://picsum.photos/200?random=15'
  },
  {
    id: 16,
    title: '感恩节主题模板',
    date: '2024-11-24',
    desc: '温馨家庭元素，感恩主题设计，记录温暖时刻',
    category: '模板设计',
    image: 'https://picsum.photos/200?random=16'
  },
  {
    id: 17,
    title: '智能美化功能更新',
    date: '2024-11-20',
    desc: '一键优化亮度对比度，智能调整肤色，提升照片质感',
    category: '服务介绍',
    image: 'https://picsum.photos/200?random=17'
  },
  {
    id: 18,
    title: '新手修图基础教程',
    date: '2024-11-16',
    desc: '常用工具介绍，基础修图流程，快速上手指南',
    category: '使用教程',
    image: 'https://picsum.photos/200?random=18'
  },
  {
    id: 19,
    title: '万圣节主题模板',
    date: '2024-10-30',
    desc: '可爱搞怪风格，南瓜元素装饰，打造趣味万圣节照片',
    category: '模板设计',
    image: 'https://picsum.photos/200?random=19'
  },
  {
    id: 20,
    title: '宠物定制马克杯',
    date: '2024-10-27',
    desc: '双层保温设计，高清图案打印，居家办公必备',
    category: '选品广场',
    image: 'https://picsum.photos/200?random=20'
  },
  {
    id: 21,
    title: '照片一键优化',
    date: '2024-10-24',
    desc: 'AI智能识别场景，自动调整参数，让照片更出彩',
    category: '服务介绍',
    image: 'https://picsum.photos/200?random=21'
  },
  {
    id: 22,
    title: '构图技巧精讲',
    date: '2024-10-21',
    desc: '九宫格法则，对角线构图，让照片更有美感',
    category: '使用教程',
    image: 'https://picsum.photos/200?random=22'
  },
  {
    id: 23,
    title: '秋季写真模板',
    date: '2024-10-18',
    desc: '金秋主题设计，温暖色调，展现秋日温馨',
    category: '模板设计',
    image: 'https://picsum.photos/200?random=23'
  },
  {
    id: 24,
    title: '宠物定制抱枕',
    date: '2024-10-15',
    desc: '超柔面料，3D数码印刷，家居装饰新选择',
    category: '选品广场',
    image: 'https://picsum.photos/200?random=24'
  },
  {
    id: 25,
    title: '图片批量导出',
    date: '2024-10-12',
    desc: '支持多种格式，自定义尺寸，提高工作效率',
    category: '服务介绍',
    image: 'https://picsum.photos/200?random=25'
  },
  {
    id: 26,
    title: '后期调色教程',
    date: '2024-10-10',
    desc: '色温色调调整，氛围营造技巧，提升照片质感',
    category: '使用教程',
    image: 'https://picsum.photos/200?random=26'
  }
];

// 示例分类数据
const categories = [
  { id: 1, name: '全部资讯', icon: FaNewspaper },
  { id: 2, name: '选品广场', icon: FaBox },
  { id: 3, name: '模板设计', icon: FaPalette },
  { id: 4, name: '服务介绍', icon: FaHandshake },
  { id: 5, name: '使用教程', icon: FaBookOpen },
];

export default function MessagePage() {
  const [activeCategory, setActiveCategory] = useState('全部资讯');
  const [filteredNews, setFilteredNews] = useState(newsData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationType, setGenerationType] = useState('text');
  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedTone, setSelectedTone] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [messages, setMessages] = useState([]);
  const [showGenerateUI, setShowGenerateUI] = useState(false);
  const fileInputRef = useRef(null);
  const chatHistoryRef = useRef(null);

  // 生成API提示文本
  const generatePrompt = (userInput) => {
    if (!selectedProduct || !selectedPlatform || !selectedTone || !selectedType) {
      toast.error('请选择选项中您要的回复');
      return null;
    }

    return `创建一个关于${selectedType}${selectedProduct}的${selectedPlatform}20个字内的标题和120字内的内容，符合${selectedPlatform}标题和内容的限制，主要以${selectedTone}的调性，引入点击，帮助销售${userInput.trim() ? '，我的要求是' + userInput : ''}`;
  };

  const platformsByModule = {
    '商品模块': ['抖音', '小红书', '淘宝', '拼多多', 'Tiktok', 'Facebook', 'Ins'],
    '内容模块': ['抖音', '小红书', 'Tiktok', 'Facebook', 'Ins']
  };

  const productOptions = [
    '定制棒球帽',
    '个性定制T恤',
    '创意马克杯',
    '艺术帆布包',
    '定制手机壳',
    '个性抱枕',
    '定制挂画',
    '个性鼠标垫',
    '定制笔记本',
    '定制帆布鞋'
  ];

  const toneOptions = [
    "震惊",
    "品宣",
    "吸引",
    "售卖",
    "平淡"
  ];

  const typeOptions = [
    '宠物画像',
    '人物画像',
    '宠物风格叠加'
  ];

  const handleCategoryClick = (categoryName) => {
    setActiveCategory(categoryName);
    if (categoryName === '全部资讯') {
      setFilteredNews(newsData);
    } else {
      const filtered = newsData.filter(news => news.category === categoryName);
      setFilteredNews(filtered);
    }
  };

  const handleModuleSelect = (module) => {
    setSelectedModule(module);
    setSelectedPlatform(null); // 重置平台选择
  };

  const handlePlatformSelect = (platform) => {
    setSelectedPlatform(platform);
  };

  const handleGenerate = () => {
    if (selectedModule === '商品模块') {
      toast.error('该功能正在开发中，敬请期待！', {
        duration: 3000,
        icon: '🚧',
        style: {
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      });
      return;
    }

    setShowGenerateUI(true);
    setGenerationType('text');
  };

  const handleBackToSelect = () => {
    setShowGenerateUI(false);
    setMessages([]);
    setSelectedProduct('');
    setSelectedTone('');
    setSelectedType('');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setShowGenerateUI(false);
    setMessages([]);
    setSelectedModule(null);
    setSelectedPlatform(null);
    setSelectedProduct('');
    setSelectedTone('');
    setSelectedType('');
    setIsGenerating(false);
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length + uploadedImages.length > 3) {
      toast.error('最多只能上传3张图片');
      return;
    }

    const newImages = files.map(file => ({
      url: URL.createObjectURL(file),
      file: file
    }));

    setUploadedImages([...uploadedImages, ...newImages]);
  };

  const handleRemoveImage = (index) => {
    const newImages = [...uploadedImages];
    URL.revokeObjectURL(newImages[index].url);
    newImages.splice(index, 1);
    setUploadedImages(newImages);
  };

  const handleDownloadCanvas = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 900; // 3:4 ratio
    canvas.height = 1200;

    // 创建合成图片的逻辑
    const loadImages = uploadedImages.map(img => {
      return new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.src = img.url;
      });
    });

    Promise.all(loadImages).then(images => {
      // 计算每张图片的位置和大小
      const imageHeight = canvas.height / images.length;
      
      images.forEach((img, index) => {
        const aspectRatio = img.width / img.height;
        const drawWidth = canvas.width;
        const drawHeight = imageHeight;
        const x = 0;
        const y = index * imageHeight;
        
        ctx.drawImage(img, x, y, drawWidth, drawHeight);
      });

      // 下载图片
      const link = document.createElement('a');
      link.download = '合成图片.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  const handleSendMessage = async () => {
    const userInput = document.querySelector(`.${styles.chatInput}`).value;

    // 验证是否选择了所有必要的变量
    if (!selectedProduct || !selectedPlatform || !selectedTone || !selectedType) {
      toast.error('请选择选项中您要的回复');
      return;
    }

    const prompt = generatePrompt(userInput);
    if (!prompt) return;

    // 显示用户实际输入的消息，如果有的话
    if (userInput.trim()) {
      const newMessage = {
        type: 'user',
        content: userInput
      };
      setMessages(prev => [...prev, newMessage]);
    }
    
    document.querySelector(`.${styles.chatInput}`).value = '';

    // 调用 Deepseek API
    setIsGenerating(true);
    try {
      const apiMessages = [
        { role: 'system', content: '你是一个专业的营销文案撰写助手，擅长根据不同平台的特点创作引人注目的标题和内容。' },
        { role: 'user', content: prompt }
      ];

      const response = await callDeepseekApi(apiMessages);
      
      const aiMessage = {
        type: 'ai',
        content: response
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast.error('生成失败，请重试');
      console.error('API Error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        // 对于支持 navigator.clipboard 的现代浏览器
        await navigator.clipboard.writeText(text);
      } else {
        // 降级方案：创建临时文本区域
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          textArea.remove();
        } catch (err) {
          console.error('复制失败:', err);
          textArea.remove();
          return false;
        }
      }
      toast.success('已复制到剪贴板');
      return true;
    } catch (err) {
      console.error('复制失败:', err);
      toast.error('复制失败，请手动复制');
      return false;
    }
  };

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Layout>
      <Head>
        <title>资讯中心 - Ynnai Beat</title>
      </Head>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.categoryNav}>
            {categories.map((category) => (
              <button
                key={category.id}
                className={`${styles.categoryButton} ${activeCategory === category.name ? styles.active : ''}`}
                onClick={() => handleCategoryClick(category.name)}
              >
                <category.icon className={styles.categoryIcon} />
                {category.name}
              </button>
            ))}
          </div>

          <main className={styles.newsSection}>
            <div className={styles.inspirationSection}>
              <button
                className={styles.inspirationButton}
                onClick={() => setIsModalOpen(true)}
              >
                <span className={styles.buttonTitle}>✨ 灵感生成</span>
                <p className={styles.buttonDesc}>专属训练AI大模型助手，一键生成优质内容，帮助您5分钟创建与运营店铺。</p>
              </button>
            </div>

            {isModalOpen && (
              <div className={styles.modalOverlay}>
                <div className={styles.modal}>
                  {!showGenerateUI ? (
                    <>
                      <div className={styles.modalHeader}>
                        <h3>选择生成模块</h3>
                        <button 
                          className={styles.closeButton}
                          onClick={handleCloseModal}
                        >
                          ×
                        </button>
                      </div>
                      
                      <div className={styles.moduleSection}>
                        <div 
                          className={`${styles.moduleCard} ${selectedModule === '商品模块' ? styles.selected : ''}`}
                          onClick={() => handleModuleSelect('商品模块')}
                        >
                          <span className={styles.moduleIcon}>🛍️</span>
                          <h4>商品模块</h4>
                          <p>我要上架商品</p>
                        </div>
                        
                        <div 
                          className={`${styles.moduleCard} ${selectedModule === '内容模块' ? styles.selected : ''}`}
                          onClick={() => handleModuleSelect('内容模块')}
                        >
                          <span className={styles.moduleIcon}>📝</span>
                          <h4>内容模块</h4>
                          <p>我要运营店铺</p>
                        </div>
                      </div>

                      {selectedModule && (
                        <div className={styles.platformSection}>
                          <h4>选择平台</h4>
                          <div className={styles.platformGrid}>
                            {platformsByModule[selectedModule].map((platform) => (
                              <button
                                key={platform}
                                className={`${styles.platformButton} ${selectedPlatform === platform ? styles.selected : ''}`}
                                onClick={() => handlePlatformSelect(platform)}
                              >
                                {platform}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className={styles.modalFooter}>
                        <button
                          className={styles.generateButton}
                          onClick={handleGenerate}
                          disabled={!selectedModule || !selectedPlatform}
                        >
                          开始生成
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className={styles.modalHeader}>
                        <div className={styles.headerLeft}>
                          <button 
                            className={styles.backButton}
                            onClick={handleBackToSelect}
                          >
                            ←
                          </button>
                          <h3>内容生成</h3>
                        </div>
                        <button 
                          className={styles.closeButton}
                          onClick={handleCloseModal}
                        >
                          ×
                        </button>
                      </div>

                      <div className={styles.generationContent}>
                        <div className={styles.generationTypes}>
                          <button
                            className={`${styles.typeButton} ${generationType === 'text' ? styles.selected : ''}`}
                            onClick={() => setGenerationType('text')}
                          >
                            文字生成
                          </button>
                          <button
                            className={`${styles.typeButton} ${generationType === 'image' ? styles.selected : ''}`}
                            onClick={() => setGenerationType('image')}
                          >
                            图片创作
                          </button>
                        </div>

                        {generationType === 'text' ? (
                          <div className={styles.textGeneration}>
                            <div className={styles.optionsSection}>
                              <div className={styles.selectGroup}>
                                <label>商品</label>
                                <select 
                                  value={selectedProduct}
                                  onChange={(e) => setSelectedProduct(e.target.value)}
                                  className={styles.select}
                                >
                                  <option value="">选择商品</option>
                                  {productOptions.map((product) => (
                                    <option key={product} value={product}>
                                      {product}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className={styles.selectGroup}>
                                <label>类型</label>
                                <select 
                                  value={selectedType}
                                  onChange={(e) => setSelectedType(e.target.value)}
                                  className={styles.select}
                                >
                                  <option value="">选择类型</option>
                                  {typeOptions.map((type) => (
                                    <option key={type} value={type}>
                                      {type}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className={styles.selectGroup}>
                                <label>调性</label>
                                <select 
                                  value={selectedTone}
                                  onChange={(e) => setSelectedTone(e.target.value)}
                                  className={styles.select}
                                >
                                  <option value="">选择调性</option>
                                  {toneOptions.map((tone) => (
                                    <option key={tone} value={tone}>
                                      {tone}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className={styles.chatContainer}>
                              <div className={styles.chatHistory} ref={chatHistoryRef}>
                                {messages.map((message, index) => (
                                  <div
                                    key={index}
                                    className={styles.messageContainer}
                                  >
                                    <div className={`${styles.chatMessage} ${
                                      message.type === 'user' ? styles.userMessage : styles.aiMessage
                                    }`}>
                                      {message.content}
                                    </div>
                                    {message.type === 'ai' && (
                                      <button
                                        className={styles.copyButton}
                                        onClick={() => copyToClipboard(message.content)}
                                      >
                                        <FaCopy size={14} />
                                        复制内容
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <div className={styles.inputGroup}>
                                <textarea
                                  className={styles.chatInput}
                                  placeholder="可持续调整[文字框选填]"
                                  rows={1}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleSendMessage();
                                    }
                                  }}
                                />
                                <button 
                                  className={`${styles.sendButton} ${isGenerating ? styles.generating : ''}`}
                                  onClick={handleSendMessage}
                                  disabled={isGenerating}
                                >
                                  {isGenerating ? '生成中...' : '生成'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className={styles.imageGeneration}>
                            <div className={styles.imageUploadArea}>
                              {uploadedImages.map((img, index) => (
                                <div key={index} className={styles.uploadedImage}>
                                  <img src={img.url} alt={`上传图片 ${index + 1}`} />
                                  <button
                                    className={styles.removeImage}
                                    onClick={() => handleRemoveImage(index)}
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                              {uploadedImages.length < 3 && (
                                <button
                                  className={styles.uploadButton}
                                  onClick={() => fileInputRef.current.click()}
                                >
                                  + 上传图片
                                </button>
                              )}
                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                              />
                            </div>
                            {uploadedImages.length > 0 && (
                              <button
                                className={styles.downloadButton}
                                onClick={handleDownloadCanvas}
                              >
                                下载合成图片
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {filteredNews.map((news) => (
              <Link href={`/news/${news.id}`} key={news.id}>
                <article
                  className={styles.newsItem}
                >
                  <div 
                    className={styles.newsImage}
                    style={{
                      backgroundImage: `url(${news.image})`,
                    }}
                  />
                  <div className={styles.newsInfo}>
                    <h3 className={styles.newsTitle}>{news.title}</h3>
                    <p className={styles.newsDesc}>{news.desc}</p>
                    <span className={styles.newsDate}>{news.date}</span>
                    <span className={styles.newsCategory}>{news.category}</span>
                  </div>
                </article>
              </Link>
            ))}
          </main>
        </div>
      </div>
    </Layout>
  );
}
