import { Helmet } from "react-helmet-async";

type Props = {
    title: string;
    description: string;
    url: string;
};

export default function SEO({ title, description, url }: Props) {
    return (
        <Helmet>
            <html lang="bn" />
            <title>{title}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={url} />

            {/* OpenGraph */}
            <meta property="og:type" content="website" />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={url} />
            <meta property="og:image" content="https://rizqarashop.vercel.app/og.jpg" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content="https://rizqarashop.vercel.app/og.jpg" />

            {/* Schema */}
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Store",
                    name: "Rizqara Shop",
                    url: "https://rizqarashop.vercel.app",
                    sameAs: [
                        "https://www.instagram.com/rizqarashop/",
                        "https://www.pinterest.com/rizqarashop/"
                    ],
                    description:
                        "Bangladeshi handmade craft, clay products, custom sketch and personalized gifts shop.",
                    address: {
                        "@type": "PostalAddress",
                        addressCountry: "BD"
                    }
                })}
            </script>
        </Helmet>
    );
}
