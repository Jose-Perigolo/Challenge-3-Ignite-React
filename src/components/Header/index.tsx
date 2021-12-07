import styles from './header.module.scss'
import Link from 'next/link'

interface HeaderProps {
  postStyling: Boolean;
}

export default function Header ({postStyling} : HeaderProps) {
  // TODO
  return (
    <header className={styles.headerContainer}>
      <nav className={postStyling ? styles.headerPostContent : styles.headerContent}>
        <Link href={`/`}>
        <a href='#'>
          <img src='/images/logo.svg' alt='logo' />
        </a>
        </Link>
      </nav>
    </header>
  )
}
