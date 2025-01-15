'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, useAnimation, Variants } from 'framer-motion'

export default function LogoAnimation() {
  const controls = useAnimation()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    controls.start("visible")
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [controls])

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
      y: [
        null,
        15,    
        -9,    
        6,     
        -4.5,  
        3,     
        -2.25, 
        1.5,   
        -1.125,
        0.75,  
        -0.5625,
        0.375, 
        -0.28125,
        0.1875,
        -0.09375,
        0
      ],
      opacity: 1, 
      transition: { 
        y: {
          times: [
            0,
            0.15,
            0.25,
            0.35,
            0.45,
            0.55,
            0.63,
            0.70,
            0.76,
            0.81,
            0.85,
            0.89,
            0.92,
            0.95,
            0.98,
            1
          ],
          duration: 4.5,
          ease: [0.25, 0.1, 0.25, 1], 
        },
        opacity: {
          duration: 0.4,
          delay: 0.2,
        },
        duration: 4.5,
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen w-full flex items-center justify-center overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        className={`relative ${isMobile ? 'w-[80vw] h-[40vw]' : 'w-[50vw] h-[25vw]'}`}
      >
        <div className="flex items-center justify-center h-full">
          <motion.div 
            className={`relative ${isMobile ? 'h-[30vw] w-[30vw]' : 'h-[18.75vw] w-[18.75vw]'} mr-[-6.25vw] translate-x-[40%]`}
            variants={ynnVariants}
          >
            <Image
              src="/images/ynn.png"
              alt="YNN"
              fill
              className="object-contain"
              priority
            />
          </motion.div>
          
          <div className={`relative ${isMobile ? 'h-[20vw] w-[20vw]' : 'h-[12.5vw] w-[12.5vw]'} translate-x-[13%]`}>
            <motion.div 
              className="relative h-full w-full"
              variants={aiVariants}
            >
              <Image
                src="/images/ai_png.png"
                alt="AI"
                fill
                className="object-contain"
                priority
              />
            </motion.div>

            <motion.div 
              className={`absolute ${isMobile ? 'top-[2.0625vw] w-[3.15vw] h-[3.15vw]' : 'top-[1.2890625vw] w-[1.96875vw] h-[1.96875vw]'} left-[68%]`}
              variants={dotVariants}
            >
              <Image
                src="/images/doc.png"
                alt="Dot"
                fill
                className="object-contain"
                priority
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
