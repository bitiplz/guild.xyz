import { Box, HStack, useColorModeValue } from "@chakra-ui/react"
import useIsStuck from "hooks/useIsStuck"
import { createContext, PropsWithChildren, useContext } from "react"

export type TabsProps = {
  isSticky?: boolean
  rightElement?: JSX.Element
}

// TODO: should be 2.5 instead of 3?
// button height + padding
export const TABS_HEIGHT =
  "calc(var(--chakra-space-11) + (2 * var(--chakra-space-2-5)))"
// size: sm button height + padding
export const TABS_HEIGHT_SM =
  "calc(var(--chakra-space-8) + (2 * var(--chakra-space-2-5)))"

export const TABS_SM_BUTTONS_STYLES =
  "#tabs .chakra-button {height: var(--chakra-space-8); font-size: var(--chakra-fontSizes-sm); border-radius: var(--chakra-radii-lg); padding: 0 var(--chakra-space-3)}"

const TabsContext = createContext<{
  isStuck: boolean
}>({ isStuck: false })

const Tabs = ({
  isSticky = true,
  rightElement,
  children,
}: PropsWithChildren<TabsProps>): JSX.Element => {
  const { ref, isStuck } = useIsStuck()

  const bgColor = useColorModeValue("white", "gray.800")

  return (
    <TabsContext.Provider value={{ isStuck }}>
      <HStack
        id="tabs"
        ref={ref}
        justifyContent="space-between"
        alignItems="center"
        position={isSticky ? "sticky" : "relative"}
        top={0}
        mt={-3}
        mb={2}
        width="full"
        zIndex={isSticky && isStuck ? "banner" : "auto"}
        _before={{
          content: `""`,
          position: "fixed",
          top: 0,
          left: 0,
          width: "full",
          height: isSticky && isStuck ? TABS_HEIGHT : 0,
          bgColor: bgColor,
          boxShadow: "md",
          transition: "height .2s",
        }}
      >
        <Box
          position="relative"
          ml={-8}
          minW="0"
          sx={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0px, black 40px, black calc(100% - 40px), transparent)",
          }}
        >
          <HStack
            overflowX="auto"
            py={2.5}
            px={8}
            sx={{
              "&::-webkit-scrollbar": {
                display: "none",
              },
              scrollbarWidth: "none",
              ".chakra-button": {
                transition: "all .2s",
              },
            }}
            spacing={0}
          >
            {children}
          </HStack>
        </Box>
        {rightElement}
      </HStack>
    </TabsContext.Provider>
  )
}

export const useIsTabsStuck = () => useContext(TabsContext)

export default Tabs
