import { ButtonGroup, Stack, Text } from "@chakra-ui/react"
import Button from "components/common/Button"

import { GDG_DIFFICULITY } from "./constants"

type Props = {
  value: string
  onChange: (String) => void
  small?: boolean
}

const SelectDiffuculity = ({ value, onChange, small }: Props) => {
  if (small) {
    return (
      <ButtonGroup isAttached>
        <Button
          size="sm"
          colorScheme={value === GDG_DIFFICULITY.EASY ? "blue" : undefined}
          onClick={() => onChange(GDG_DIFFICULITY.EASY)}
        >
          👶
        </Button>
        <Button
          size="sm"
          colorScheme={value === GDG_DIFFICULITY.MEDIUM ? "blue" : undefined}
          onClick={() => onChange(GDG_DIFFICULITY.MEDIUM)}
        >
          🙂
        </Button>
        <Button
          size="sm"
          colorScheme={value === GDG_DIFFICULITY.HARD ? "blue" : undefined}
          onClick={() => onChange(GDG_DIFFICULITY.HARD)}
        >
          💀
        </Button>
      </ButtonGroup>
    )
  }

  return (
    <>
      <Text mb="2" align="center">
        How hard do you like it? <br />( be honest! )
      </Text>
      <Stack w="full" p="4">
        <Button
          size="sm"
          colorScheme={value === GDG_DIFFICULITY.EASY ? "blue" : undefined}
          onClick={() => onChange(GDG_DIFFICULITY.EASY)}
        >
          EZPZ 👶
        </Button>
        <Button
          size="sm"
          colorScheme={value === GDG_DIFFICULITY.MEDIUM ? "blue" : undefined}
          onClick={() => onChange(GDG_DIFFICULITY.MEDIUM)}
        >
          What do you mean, casual? 🙂
        </Button>
        <Button
          size="sm"
          colorScheme={value === GDG_DIFFICULITY.HARD ? "blue" : undefined}
          onClick={() => onChange(GDG_DIFFICULITY.HARD)}
        >
          IDDQD 💀
        </Button>
      </Stack>
    </>
  )
}

export default SelectDiffuculity
