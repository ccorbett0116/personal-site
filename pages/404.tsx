import Head from 'next/head';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found</title>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="description" content="The page you are looking for does not exist." />
      </Head>
      <div
        style={{
          height: '100vh',
          width: '100vw',
          margin: 0,
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
        }}
      >
        <img
          src="/404Page.png"
          alt="404 Not Found"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      </div>
    </>
  );
}
