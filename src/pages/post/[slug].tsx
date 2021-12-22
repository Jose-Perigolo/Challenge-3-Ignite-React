import { useEffect } from 'react'

import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'

import { getPrismicClient } from '../../services/prismic'
import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom'

import commonStyles from '../../styles/common.module.scss'
import styles from './post.module.scss'
import { AiOutlineCalendar } from 'react-icons/ai'
import { BiUser } from 'react-icons/bi'
import { AiOutlineClockCircle } from 'react-icons/ai'

import Header from '../../components/Header'

import { FormatDate, IsAfterDate, IsBeforeDate } from '../../utils/date-format'

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

interface PostsNavigation {
  uid: string
  data: {
    title: string
  }
  text: string
}

interface PostProps {
  post: Post
  preview: boolean
  postsNavigation: PostsNavigation[]
}

// username/repo format for Utterance
const REPO_NAME = 'Jose-Perigolo/Challenge-3-Ignite-React'

export const useUtterances = (commentNodeId: string) => {
  useEffect(() => {
    const scriptParentNode = document.getElementById(commentNodeId)
    if (!scriptParentNode) return

    // docs - https://utteranc.es/
    const script = document.createElement('script')
    script.src = 'https://utteranc.es/client.js'
    script.async = true
    script.setAttribute('repo', REPO_NAME)
    script.setAttribute('issue-term', 'pathname')
    script.setAttribute('label', 'comment :speech_balloon:')
    script.setAttribute('theme', 'photon-dark')
    script.setAttribute('crossorigin', 'anonymous')

    console.log('utteranc')

    scriptParentNode.appendChild(script)

    return () => {
      // cleanup - remove the older script with previous theme
      scriptParentNode.removeChild(scriptParentNode.firstChild as Node)
    }
  }, [commentNodeId])
}

const commentNodeId = 'comments'

export default function Post ({ post, preview, postsNavigation }: PostProps) {
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

  useUtterances(commentNodeId)

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

        <section className={styles.commentsContainer}>
          <div className={styles.postsNavigation}>
            {postsNavigation?.[0].uid &&
              postsNavigation?.[1].uid &&
              postsNavigation.map(post => {
                return (
                  <span key={post?.uid}>
                    <p>{post?.data?.title}</p>
                    <Link href={`/post/${post?.uid}`}>
                      <a>{post.text}</a>
                    </Link>
                  </span>
                )
              })}
          </div>
          <div id={commentNodeId} />
        </section>
      </main>

      {preview && (
        <aside className={commonStyles.exitPreviewLink}>
          <Link href='/api/exit-preview'>
            <button>Sair do modo Preview</button>
          </Link>
        </aside>
      )}
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

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params

  const prismic = getPrismicClient()

  const response = await prismic.getByUID('post', String(slug), {
    ref: previewData?.ref ?? null,
  })

  const navigationResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: 'post.title',
      orderings: '[document.first_publication_date]',
    }
  )

  const findAfter = navigationResponse.results.find(
    post =>
      post.uid !== response.uid &&
      IsAfterDate(post.first_publication_date, response.first_publication_date)
  )

  const findBefore = navigationResponse.results.find(
    post =>
      post.uid !== response.uid &&
      IsBeforeDate(post.first_publication_date, response.first_publication_date)
  )

  const postAfter = {
    uid: findAfter?.uid || false,
    data: {
      title: findAfter?.data.title || '',
    },
    text: 'Próximo post',
  }

  const postBefore = {
    uid: findBefore?.uid || false,
    data: {
      title: findBefore?.data.title || '',
    },
    text: 'Post anterior',
  }

  const postsNavigation = [postBefore, postAfter]

  console.log(postsNavigation)

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
    props: { post, preview, postsNavigation },
  }
}
