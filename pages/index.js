import Head from "next/head";
import greatWords from "../words";
import { Container, Heading, useToast, Box, Text } from "@chakra-ui/core";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export default function Home({ word }) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [wordInfo, setWordInfo] = useState();

  const [selectedWord, setSelectedWord] = useState(
    word || greatWords[randomIntFromInterval(0, greatWords.length - 1)]
  );

  const value = useMemo(() => {
    return `${selectedWord?.value} ${new Date()
      .toLocaleString("tr", {
        month: "long",
      })
      .toLowerCase()} günleri`;
  }, [selectedWord]);

  const fetchWordInfo = (word) => {
    fetch(`https://sozluk.gov.tr/gts?ara=${word}`)
      .then((resp) => resp.json())
      .then((data) => {
        setWordInfo(data);
      })
      .catch((err) =>
        toast({
          title: "Böyle bir uygulamada bile hata çıkaran hayat",
          description: "Normal zamanda kim bilir kime ne yapmaz?",
          status: "error",
          isClosable: true,
        })
      );
  };

  useEffect(() => {
    if (router.query.w) {
      const wordIndex = greatWords.findIndex(
        (word) => word.value === router.query.w
      );

      if (wordIndex !== -1) {
        setSelectedWord(greatWords[wordIndex]);
        fetchWordInfo(greatWords[wordIndex].tdk);
      } else {
        const word =
          greatWords[randomIntFromInterval(0, greatWords.length - 1)];
        setSelectedWord(word);
        fetchWordInfo(word?.tdk);
        router.replace({ query: { w: word.value } });
      }
    } else {
      router.replace({ query: { w: selectedWord?.value } });
      fetchWordInfo(selectedWord?.tdk);
    }

    setLoading(false);
  }, []);

  return (
    <div>
      <Head>
        <title>{!loading ? value : "Dandik İndirim Günü Name Generator"}</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="title" content={!loading ? value : "Dandik İndirim Günü Name Generator"}/>
        <meta name="description" content="Dandik İndirim Günü isimleri generator. Dünyada bir numarayız."/>

        <meta property="og:type" content="website"/>
        <meta property="og:url" content="https://dandik-indirim.vercel.app/"/>
        <meta property="og:title" content={!loading ? value : "Dandik İndirim Günü Name Generator"}/>
        <meta property="og:description" content="Dandik İndirim Günü isimleri generator. Dünyada bir numarayız."/>
        <meta property="og:image" content="/cover.jpg"/>

        <meta property="twitter:card" content="summary_large_image"/>
        <meta property="twitter:url" content="https://dandik-indirim.vercel.app/"/>
        <meta property="twitter:title" content={!loading ? value : "Dandik İndirim Günü Name Generator"}/>
        <meta property="twitter:description" content="Dandik İndirim Günü isimleri generator. Dünyada bir numarayız."/>
        <meta property="twitter:image" content="/cover.jpg"/>
      </Head>

      {!loading && (
        <Container as="main" mt={24}>
          <Heading
            borderLeft="5px solid"
            borderLeftColor="red.600"
            fontWeight={400}
            size="4xl"
            lineHeight={1.4}
            pl={12}
            py={4}
          >
            {value}
          </Heading>
          <Box mt={4}>
            <Text fontSize="xl">{`${selectedWord.tdk}`}</Text>
            {wordInfo?.[0].anlamlarListe?.map((meaning, i) => (
              <Box
                bg="gray.100"
                mt={4}
                w="full"
                p={4}
                key={i.toString()}
                borderRadius="8px"
              >
                {meaning.anlam}
              </Box>
            ))}
          </Box>
        </Container>
      )}
    </div>
  );
}

export async function getServerSideProps(context) {
  return {
    props: {
      word: context.query.w || "",
    },
  };
}
