import { GetStaticProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'

import Prismic from '@prismicio/client'
import { getPrismicClient } from '../services/prismic'

import { FormatDate } from '../utils/date-format'

import Header from '../components/Header'

import styles from './home.module.scss'
import commonStyles from '../styles/common.module.scss'
import { AiOutlineCalendar } from 'react-icons/ai'
import { BiUser } from 'react-icons/bi'
import { useEffect, useState } from 'react'

interface Post {
  uid?: string
  first_publication_date: string | null
  data: {
    title: string
    subtitle: string
    author: string
  }
}

interface PostPagination {
  next_page: string
  results: Post[]
}

interface HomeProps {
  postsPagination: PostPagination
  preview: boolean
}

const FormatPost = (posts: PostPagination) => {
  const next_page = posts.next_page

  const results = posts.results.map(post => {
    return {
      uid: post.uid,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
      first_publication_date: post.first_publication_date,
    }
  })

  return { next_page, results }
}

export default function Home ({
  postsPagination,
  preview,
}: HomeProps): JSX.Element {
  const [loadMore, setLoadMore] = useState<Boolean>(false)
  const [posts, setPosts] = useState(postsPagination)

  useEffect(() => {
    if (loadMore) {
      fetch(postsPagination.next_page)
        .then(response => response.json())
        .then(data => {
          const { next_page, results } = FormatPost(data)

          const newResults = postsPagination.results.concat(results)

          const newPostPagination = { next_page, results: newResults }

          setPosts(newPostPagination)
        })

      setLoadMore(false)
    }
  }, [loadMore])

  function handleLoadMore () {
    setLoadMore(true)
  }

  return (
    <>
      <Head>
        <title>Home | Desafio 3</title>
      </Head>

      <Header postStyling={false} />

      <main className={commonStyles.contentContainer}>
        <div className={styles.posts}>
          {posts.results.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <strong>{post.data.title}</strong>
                <p className={styles.postSubtitle}>{post.data.subtitle}</p>
                <p>
                  <AiOutlineCalendar />
                  <span>{FormatDate(post.first_publication_date)}</span>
                  <BiUser />
                  <span>{post.data.author}</span>
                </p>
              </a>
            </Link>
          ))}
          {posts.next_page && (
            <button onClick={handleLoadMore}>Carregar mais posts</button>
          )}
        </div>
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

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient()

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      pageSize: 3,
      ref: previewData?.ref ?? null,
    }
  )

  const postsPagination = FormatPost(postsResponse)

  return {
    props: { postsPagination, preview },
  }
  // TODO
}
