import Head from 'next/head'

export default function Home() {
    return (
        <>
            <Head>
                <title>Cole Corbett</title>
                <meta name="description" content="Personal site for Cole Corbett" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
                <h1>Welcome to colecorbett.ca</h1>
                <p>This site is automatically deployed from GitHub via Alpine Linux, NGINX, and Next.js</p>
                <p>Python pushed me again!</p>
                <p>Uptime: 100% (probably)</p>
		<p>Tiny Chnage</p>
            </main>
        </>
    )
}
