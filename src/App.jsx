import { Box, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import CodeEditor from "./components/CodeEditor";
import BlocklyEditor from "./components/BlocklyEditor";

function App() {
  return (
    <Box minH="100vh" h="100vh" bg="#0f0a19" color="gray.500" px={6} py={4}>
      <Tabs variant="enclosed" colorScheme="cyan" h="100%" display="flex" flexDirection="column">
        <TabList mb={2}>
          <Tab>💻 Text Code Editor</Tab>
          <Tab>🧩 Blockly Visual Programming</Tab>
        </TabList>

        <TabPanels flex="1" overflow="hidden">
          <TabPanel p={0} h="100%">
            <CodeEditor />
          </TabPanel>
          
          <TabPanel p={0} h="100%">
            <BlocklyEditor />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

export default App;
