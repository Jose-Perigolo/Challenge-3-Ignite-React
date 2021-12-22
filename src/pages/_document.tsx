import Document, {Html, Main, Head, NextScript} from 'next/document';

export default class MyDocument extends Document {
  render() {
    //TODO
    return (
      <Html>
        <Head>
            <link rel="preconnect" href="https://fonts.gstatic.com" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet"/>
            <link rel='shortcut icon' href="/favicon.png" type="image/png" /> 
            <script async defer src="https://static.cdn.prismic.io/prismic.js?new=true&repo=challenge-3-react"/>
        </Head>
        <body>
          <Main/>
          <NextScript/>
        </body>
      </Html>
    )
  }
}
