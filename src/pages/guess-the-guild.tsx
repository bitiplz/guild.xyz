import { Center, useBreakpointValue, useColorModeValue } from "@chakra-ui/react"
import ClientOnly from "components/common/ClientOnly"
import Layout from "components/common/Layout"
import GuessTheGuildGame from "components/guess-the-guild/GuessTheGuildGame"
import { GetStaticProps } from "next"
import { GuildBase } from "types"
import fetcher from "utils/fetcher"

type Props = {
  guilds: GuildBase[]
}

const Page = ({ guilds }: Props): JSX.Element => {
  const bgColor = useColorModeValue("var(--chakra-colors-gray-800)", "#37373a") // dark color is from whiteAlpha.200, but without opacity so it can overlay the banner image
  const bgOpacity = useColorModeValue(0.06, 0.1)
  const bgLinearPercentage = useBreakpointValue({ base: "50%", sm: "55%" })

  return (
    <Layout
      title={"Guess the Guild"}
      ogDescription="Guess the Guild minigame."
      background={bgColor}
      backgroundProps={{
        opacity: 1,
        _before: {
          content: '""',
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          bg: `linear-gradient(to top right, ${bgColor} ${bgLinearPercentage}, transparent), url('/banner.png ')`,
          bgSize: { base: "auto 100%", sm: "auto 115%" },
          bgRepeat: "no-repeat",
          bgPosition: "top 10px right 0px",
          opacity: bgOpacity,
        },
      }}
      backgroundOffset={120}
      textColor="white"
    >
      <ClientOnly>
        <Center>
          <GuessTheGuildGame guilds={guilds} />
        </Center>
      </ClientOnly>
    </Layout>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const guilds = await fetcher(`/v2/guilds?sort=members`).catch((_) => [])

  return {
    props: { guilds },
    revalidate: 300,
  }
}

export default Page
