import React from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '../../assets'
import styles from './home.module.css'

const Home = () => {
  return (
    <div className={styles.wrapper}> 
        <div className={styles.textCtn}>
            <h1>Welcome to Cognichat</h1>
            <p>Your Friendly AI-powered Chat Platform</p>
        </div>

        <div className={styles.description}>
            <p>Cognichat is an AI-powered platform that helps detects, translates and summarizes texts.</p>
            <p>This platform was developed with the Chrome AI API</p>
        </div>

        <div className={styles.imgCtn}>
            <img src={Logo} alt="Cognichat Logo"/>
        </div>

        <div className={styles.link}>
            <Link to='/app'> Visit Our App</Link>
        </div>
    </div>
  )
}

export {Home}