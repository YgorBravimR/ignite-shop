import { GetStaticPaths, GetStaticProps } from "next"
import Stripe from "stripe"
import { stripe } from "../../lib/stripe"
import Image from "next/future/image"
import { ImageContainer, ProductContainer, ProductDetails } from "../../styles/pages/product"
import axios from "axios"
import { useState } from "react"
import Head from "next/head"

interface ProductProps {
  product: {
    id: string
    name: string
    imageUrl: string
    price: string
    description: string;
    defaultPriceId: string;
  }
}

export default function Product({ product }: ProductProps) {
  const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] = useState(false)

  async function handleBuyProduct() {
    try {
      setIsCreatingCheckoutSession(true);

      const response = await axios.post('/api/checkout', {
        priceId: product.defaultPriceId,
      })

      const { checkoutUrl } = response.data

      // Para o caso de enviarmos o user para uma página interna, usariamos o hook useRouter com um router.push('/checkout')
      // Como iremos enviar para uma página externa, no caso o Stripe, usamos como no javascript tradicional, com window.location.href
      window.location.href = checkoutUrl

    } catch (err) {
      setIsCreatingCheckoutSession(false);
      // Conectar com alguma ferramenta de observabilidade (Datadog / Sentry)
      alert('Falha ao redirecionar ao checkout!')
    }
  }

  return (
    <>
      <Head>
        <title>{product.name} | Ignite Shop</title>
      </Head>
      <ProductContainer>
        <ImageContainer>
          <Image src={product.imageUrl} alt="" width={520} height={480} />
        </ImageContainer>

        <ProductDetails>
          <h1>{product.name}</h1>
          <span>{product.price}</span>

          <p>{product.description}</p>

          <button onClick={handleBuyProduct} disabled={isCreatingCheckoutSession}>
            Comprar agora
          </button>
        </ProductDetails>
      </ProductContainer>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      { params: { id: "" } }
    ],
    fallback: "blocking",
  }
}

export const getStaticProps: GetStaticProps<any, { id: string }> = async ({ params }: any) => {
  const productId = params.id;

  const product = await stripe.products.retrieve(productId, {
    expand: ['default_price']
  })

  const price = product.default_price as Stripe.Price
  const productPrice = Number(price.unit_amount)

  return {
    props: {
      product: {
        id: product.id,
        name: product.name,
        imageUrl: product.images[0],
        price: new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(productPrice / 100,),
        description: product.description,
        defaultPriceId: price.id,
      }
    },
    revalidate: 60 * 60 * 1 // 1 Hour
  }
}