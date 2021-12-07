import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'

import { getPrismicClient } from '../../services/prismic'
import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom'

import commonStyles from '../../styles/common.module.scss'
import styles from './post.module.scss'
import { AiOutlineCalendar } from 'react-icons/ai'
import { BiUser } from 'react-icons/bi'
import { AiOutlineClockCircle } from 'react-icons/ai'

import Header from '../../components/Header'

import FormatDate from '../../utils/date-format'

import uuid from 'react-uuid'


interface Post {
  first_publication_date: string | null
  data: {
    title: string
    banner: {
      url: string
    }
    author: string
    content: {
      heading: string
      body: {
        text: string
      }[]
    }[]
  }
}

interface PostProps {
  post: Post
}

export default function Post ({ post }: PostProps) {
  
  function readingTime () {
    const timeHeading = post.data.content.map(
      post => post.heading?.split(' ').length
    )

    const timeText = post.data.content.map(
      post => RichText.asText(post.body).split(' ').length
    )

    const timeTotal = timeText.reduce(Sum) + timeHeading.reduce(Sum)

    function Sum (total, num) {
      const sum = (total || 0) + (num || 0)
      return sum
    }

    return Math.ceil(timeTotal / 200)
  }

  const router = useRouter()

  if (router.isFallback) {
    return <div>Carregando...</div>
  }

  return (
    <>
      <Head>
        <title> {post.data.title} | Ignews </title>
      </Head>

      <Header postStyling={true} />

      <div className={styles.bannerContainer}>
        <img src={post.data.banner.url} alt='banner' />
      </div>

      <main className={commonStyles.contentContainer}>
        <article className={styles.post}>
          <section className={styles.postIntro}>
            <strong>{post.data.title}</strong>
            <p>
              <AiOutlineCalendar />
              <time>{FormatDate(post.first_publication_date)}</time>
              <BiUser />
              <span>{post.data.author}</span>
              <AiOutlineClockCircle />
              <span>{readingTime()} min</span>
            </p>
          </section>
          {post.data.content.map(text => {
              return (
                <section className={styles.contentBody} key={uuid()}>
                  <h1>{text.heading}</h1>
                  <div
                    className={styles.postContent}
                    dangerouslySetInnerHTML={{
                      __html: RichText.asHtml(text.body),
                    }}
                  />
                </section>
              )
          })}
        </article>
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient()
  const posts = await prismic.query([
    Prismic.predicates.at('document.type', 'post'),
  ])

  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }))

  return {
    paths,
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params

  const prismic = getPrismicClient()

  const response = await prismic.getByUID('post', String(slug), {})

  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content,
      subtitle: response.data.subtitle,
    },
    uid: response.uid,
  }

  return {
    props: { post },
  }
}
