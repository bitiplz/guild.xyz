import { Stack, Text } from "@chakra-ui/react"
import Button from "components/common/Button"
import GuildLogo from "components/common/GuildLogo"
import { GuildBase } from "types"

type Props = {
  questions: GuildBase[]
  options: GuildBase[]
  answers: GuildBase[]
  setAnswers: (GuildBase) => void
  showResults?: boolean
}

const GuessModeForm = ({
  questions,
  options,
  answers,
  setAnswers,
  showResults,
}: Props) => {
  const getBtnColor = (idx) => {
    let color

    if (showResults) {
      const guessedIdx = options.findIndex(({ id }) => id === answers[0].id)
      const correctIdx = options.findIndex(({ id }) => id === questions[0].id)

      if (idx === guessedIdx) {
        color = "red"
      }

      if (idx === correctIdx) {
        color = "green"
      }
    } else if (answers[0]?.id === options[idx].id) {
      color = "blue"
    }

    return color
  }

  return (
    <>
      <Text mb="4">Guess the guild by the logo</Text>
      <GuildLogo size="28" imageUrl={questions[0].imageUrl} />
      <Text p="4">???</Text>
      <Stack w="full" mb="4">
        {options.map((guild, i) => (
          <Button
            key={guild.id}
            isDisabled={showResults}
            colorScheme={getBtnColor(i)}
            onClick={() => setAnswers([guild])}
          >
            {guild.name}
          </Button>
        ))}
      </Stack>
    </>
  )
}

export default GuessModeForm
