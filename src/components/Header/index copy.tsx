import { HeaderContainer } from "./styles";

import Image from 'next/future/image';
import Link from 'next/link';
import igniteLogo from '../../assets/igniteLogo.svg'
import { Cart } from '../Cart';
import { useRouter } from 'next/router';

export function Header() {
  const { pathname } = useRouter()

  const showCartButton = pathname !== "/success";

  return (
    <HeaderContainer>
      <Link href="/">
        <Image src={igniteLogo} alt="" />
      </Link>
      {showCartButton ?? <Cart />}
    </HeaderContainer>
  )
}

