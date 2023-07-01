import Link from 'next/link';
import { FaGithub } from 'react-icons/fa';
import Logo from '../../../public/images/logo.svg'
import Container from '@/components/Container';

import styles from './Header.module.scss';
import Image from 'next/image';

const Header = () => {
  return (
    <header className={styles.header}>
      <Container className={styles.headerContainer}>
        <div className={styles.headerLogo}>
          <p className={styles.headerTitle}>
            <Link href="/">
            <Image src={Logo} height={250} width={250} alt='logo'/>
            </Link>
          </p>
        </div>
        <ul className={styles.headerLinks}>
          <li>
            <Link href='/image'>
            Image
            </Link>
          </li>
          <li>
            <Link href='/'>
            About
            </Link>
          </li>
        </ul>
      </Container>
    </header>
  );
};

export default Header;
