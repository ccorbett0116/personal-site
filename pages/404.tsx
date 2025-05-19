import Head from 'next/head';
import Image from 'next/image';

export default function Custom404() {
    return (
        <>
            <Head>
                <title>404 - Page Not Found</title>
                <meta name="robots" content="noindex, nofollow" />
                <meta
                    name="description"
                    content="The page you are looking for does not exist."
                />
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
                <Image
                    src="/404Page.png"
                    alt="404 Not Found"
                    fill
                    style={{ objectFit: 'contain' }}
                    unoptimized
                />
            </div>
        </>
    );
}
