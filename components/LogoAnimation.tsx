'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, useAnimation, Variants } from 'framer-motion'

export default function LogoAnimation() {
  const controls = useAnimation()
  const [isMobile, setIsMobile] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [touchStartTime, setTouchStartTime] = useState(0)
  const [touchStartPos, setTouchStartPos] = useState({ x: 0, y: 0 })
  const [isTouching, setIsTouching] = useState(false)

  useEffect(() => {
    controls.start("visible")
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [controls])

  // 重放动画函数
  const replayAnimation = async () => {
    if (isAnimating) return
    setIsAnimating(true)
    
    // Trigger haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
    
    await controls.start("hidden")
    await controls.start("visible")
    setIsAnimating(false)
  }

  // 处理触摸开始
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setTouchStartTime(Date.now())
    setTouchStartPos({
      x: touch.clientX,
      y: touch.clientY
    })
    setIsTouching(true)
  }

  // 处理触摸移动
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTouching) return
    
    const touch = e.touches[0]
    const moveDistance = Math.sqrt(
      Math.pow(touch.clientX - touchStartPos.x, 2) +
      Math.pow(touch.clientY - touchStartPos.y, 2)
    )
    
    // If moved more than 10px, cancel the touch interaction
    if (moveDistance > 10) {
      setIsTouching(false)
    }
  }

  // 处理触摸结束
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isTouching) return
    
    const touchEndTime = Date.now()
    const touchDuration = touchEndTime - touchStartTime
    
    // 获取触摸结束位置
    const touch = e.changedTouches[0]
    const touchEndPos = {
      x: touch.clientX,
      y: touch.clientY
    }

    // 计算触摸移动距离
    const moveDistance = Math.sqrt(
      Math.pow(touchEndPos.x - touchStartPos.x, 2) +
      Math.pow(touchEndPos.y - touchStartPos.y, 2)
    )

    // 如果触摸时间小于300ms且移动距离小于10px，认为是点击
    if (touchDuration < 300 && moveDistance < 10) {
      replayAnimation()
    }
    
    setIsTouching(false)
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.2,
        delayChildren: 0.3,
      }
    }
  }

  const ynnVariants: Variants = {
    hidden: { x: -100, y: -100, opacity: 0, rotate: -45, scale: 0.5 },
    visible: { 
      x: 0, 
      y: 0, 
      opacity: 1, 
      rotate: 0,
      scale: 1,
      transition: { 
        type: "spring",
        damping: 12,
        stiffness: 100,
        duration: 1.2,
        bounce: 0.4
      }
    }
  }

  const aiVariants: Variants = {
    hidden: { x: 100, y: 100, opacity: 0, rotate: 45, scale: 0.5 },
    visible: { 
      x: 0, 
      y: 0, 
      opacity: 1, 
      rotate: 0,
      scale: 1,
      transition: { 
        type: "spring",
        damping: 12,
        stiffness: 100,
        duration: 1.2,
        bounce: 0.4
      }
    }
  }

  const dotVariants: Variants = {
    hidden: { y: -200, opacity: 0 },
    visible: { 
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 5,
        stiffness: 100,
        duration: 1.5
      }
    }
  }

  const sloganVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        delay: 1.2,
        duration: 0.8,
        ease: "easeOut"
      }
    }
  }

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        delay: 1.2,
        duration: 0.8,
        ease: "easeOut"
      }
    }
  }

  return (
    <motion.div 
      className="logo-animation-container"
      variants={containerVariants}
      initial="hidden"
      animate={controls}
      onClick={replayAnimation}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ 
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'none',
        transform: isTouching ? 'scale(0.98)' : undefined,
        transition: 'transform 0.1s ease'
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="logo-content-wrapper">
        <motion.div className="logo-content">
          <motion.div 
            className="ynn-container"
            variants={ynnVariants}
          >
            <Image
              src="/images/ynn.png"
              alt="YNN"
              width={420}
              height={210}
              className="ynn-image"
              priority
            />
          </motion.div>
          
          <div className="ai-container">
            <motion.div 
              className="ai-image-container"
              variants={aiVariants}
            >
              <Image
                src="/images/ai_png.png"
                alt="AI"
                width={220}
                height={110}
                className="ai-image"
                priority
              />
            </motion.div>

            <motion.div 
              className="dot-container"
              variants={dotVariants}
            >
              <Image
                src="/images/doc.png"
                alt="Dot"
                width={35}
                height={35}
                className="dot-image"
                priority
              />
            </motion.div>
          </div>
        </motion.div>

        <div className="slogan-container">
          <motion.h1 
            className="slogan-text slogan-primary"
            variants={textVariants}
            initial="hidden"
            animate="visible"
          >
            人人都是超级设计师
          </motion.h1>
          <motion.p 
            className="slogan-text slogan-secondary"
            variants={textVariants}
            initial="hidden"
            animate="visible"
          >
            一站式AI定制商品平台
          </motion.p>
        </div>
      </div>
    </motion.div>
  )
}
