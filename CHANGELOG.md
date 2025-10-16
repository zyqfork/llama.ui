## [2.38.2] - 2025-10-16

### 🎨 Styling

- _(App)_ Add dark mode border color support (#226)
- _(chat)_ Update icon and styling in ChatMessage component (#226)

### 🚜 Refactor

- _(i18n)_ [**breaking**] Replace 'thoughts' with 'reasoning' in all language files (#226)

## [2.38.1] - 2025-10-15

### 🚀 Enhancements

- _(sidebar)_ Add conversation search functionality (#223)

### 🎨 Styling

- _(chat)_ Update styling for main content and chat input (#224)

### 🚜 Refactor

- _(Input)_ Replace native input with custom Input component (#222)
- _(icon)_ Migrate to direct icon component usage (#225)

## [2.38.0] - 2025-10-12

### 🚀 Enhancements

- UI components (#217)
- _(components)_ Add AutoSizingTextArea component (#219)

### 🛠 Fixes

- _(inference)_ Update condition for loading models (#221)

### 🎨 Styling

- _(chat)_ Expand ChatInput on focus (#220)

### 🚜 Refactor

- _(ui)_ Replace button elements with Button component
- _(common)_ Replace IntlIconButton with Button component
- _(ui)_ Replace label elements with custom Label component
- _(chat)_ Replace collapse component with custom button in ChatMessage
- Migrate project structure
- _(components)_ Introduce Icon component to replace direct react-icons usage
- _(vite.config)_ Update vendor chunk splitting logic
- _(chat)_ Move prefilled message logic to custom hook (#218)
- _(app)_ Simplify App component and extract toast logic to custom hooks

## [2.37.0] - 2025-10-06

### 🚀 Enhancements

- Speech to Text #66 (#127)

## [2.36.0] - 2025-10-01

### 🚀 Enhancements

- _(chat)_ Add mermaid chart support to markdown display #103 (#212)

## [2.35.0] - 2025-09-30

### 🚀 Enhancements

- _(ui)_ Add option to display raw messages #178 (#210)

### 🚜 Refactor

- _(database)_ Split storage utils into indexedDB and localStorage classes (#209)

## [2.34.0] - 2025-09-29

### 🛠 Fixes

- _(inference)_ Model list may be not loaded after setting save (#207)

## [2.33.0] - 2025-09-29

### 🚜 Refactor

- _(settings)_ Extract settings components to separate modules (#206)

## [2.32.3] - 2025-09-29

### 🚀 Enhancements

- _(api)_ Add NVIDIA NIM provider support (#205)

## [2.32.2] - 2025-09-29

### 🛠 Fixes

- _(api)_ Cache provider instance with correct cache key (#204)

## [2.32.1] - 2025-09-29

### 🛠 Fixes

- Auto-scroll too sticky (#203)

### 🚜 Refactor

- _(useChatScroll)_ Enhance hook with configurable options and improve chat scrolling behavior (#203)
- _(chat)_ Optimize pending message handling in ChatScreen (#203)
- _(ChatMessage)_ Wrap ThinkingSection in memo for performance optimization (#203)

## [2.32.0] - 2025-09-29

### ⚡️ Performance

- _(chat)_ Add throttling to pending messages for smoother UI updates (#201)

## [2.31.0] - 2025-09-29

### 🚜 Refactor

- _(api)_ Replace SSE processing with native stream processing (#200)

## [2.30.3] - 2025-09-29

### 🛠 Fixes

- Chat context selectedModel may not work

## [2.30.2] - 2025-09-28

### 🛠 Fixes

- ChatInput send button missed (#199)

## [2.30.1] - 2025-09-28

### 🏗️ CI/CD

- Fix GitHub Workflow permissions (#198)

## [2.30.0] - 2025-09-28

### 🏗️ CI/CD

- Update GitHub Pages deployment workflows (#197)

## [2.29.0] - 2025-09-28

### 🛠 Fixes

- ChatScreen - model name can be displayed incorrectly (#196)

### 🚜 Refactor

- _(api)_ Consolidate chat parameters in BaseOpenAIProvider (#195)

## [2.28.0] - 2025-09-28

### 🛠 Fixes

- _(provider)_ Add Mistral provider (#194)

## [2.27.0] - 2025-09-28

### 🚜 Refactor

- _(context)_ Replace useState with useReducer in core context providers (#186)

## [2.26.0] - 2025-09-28

### 🛠 Fixes

- _(inference)_ Re-init provider on null (#191)
- _(api)_ Update provider cache key to include base URL (#192)

## [2.25.1] - 2025-09-28

### 🛠 Fixes

- Decrease `pasteLongTextToFileLen` label size

## [2.25.0] - 2025-09-28

### 🛠 Fixes

- _(provider)_ Add Groq provider and extend CloudOpenAIProvider (#190)

## [2.24.1] - 2025-09-28

### 🛠 Fixes

- Database import-export toast type on error (#189)

## [2.24.0] - 2025-09-28

### 🛠 Fixes

- Memorize context functions (#185)
- _(provider)_ Add Google provider and extend BaseOpenAIProvider (#188)

### 🚜 Refactor

- Sidebar extract components (#184)
- API provider (#183)

## [2.23.4] - 2025-09-27

### 🛠 Fixes

- Trigger inference sync when default baseUrl is preconfigured (#167)

## [2.23.3] - 2025-09-26

### 🛠 Fixes

- Code display issue (#182)

## [2.23.2] - 2025-09-26

### 🚜 Refactor

- _(common)_ Add downloadAsFile helper and streamline download logic (#181)

## [2.23.1] - 2025-09-26

### 🛠 Fixes

- Adjust icons (#180)

## [2.23.0] - 2025-09-26

### 🚀 Enhancements

- _(deps)_ Replace @heroicons/react with react-icons (#177)

## [2.22.5] - 2025-09-25

### 🛠 Fixes

- Sidebar - today label missed (#174)

## [2.22.4] - 2025-09-25

### 🎨 User Interface

- i18n - Full UI translation (#172)

## [2.22.3] - 2025-09-23

### 🛠 Fixes

- i18n - Update document lang (#173)

## [2.22.2] - 2025-09-22

### 🛠 Fixes

- New Version toast miss icon (#171)

## [2.22.1] - 2025-09-22

### 🛠 Fixes

- LLM translation (#170)

## [2.22.0] - 2025-09-22

### 🚀 Enhancements

- Internationalization (#169)

## [2.21.5] - 2025-09-21

### 🛠 Fixes

- Welcome page - sample prompts flicker during inference chunks #162 (#164)

## [2.21.4] - 2025-09-19

### 🛠 Fixes

- Settings - Load Preset on click without click Save (#158)

## [2.21.3] - 2025-09-18

### 🛠 Fixes

- Toast does not open settings (#157)

## [2.21.2] - 2025-09-18

### 🎨 Styling

- Fix mobile padding (#156)

## [2.21.1] - 2025-09-18

### 🛠 Fixes

- Remove vscode logic (#155)

## [2.20.3] - 2025-09-17

### 🛠 Fixes

- Imported Presets are not shown #146 (#153)

## [2.20.2] - 2025-09-17

### 🛠 Fixes

- Cannot reopen Settings after switching from Settings to Chat #150 (#152)

## [2.20.1] - 2025-09-17

### 🚀 Enhancements

- Favicon update (#151)

## [2.20.0] - 2025-09-15

### 🚀 Enhancements

- Settings screen (#142)

## [2.19.3] - 2025-09-14

### 🚀 Enhancements

- Database Export page (#147)

## [2.19.2] - 2025-09-14

### 🛠 Fixes

- PWA - manifest updates (#145)

## [2.19.0] - 2025-09-13

### 🚀 Enhancements

- Llama-ui.js.org (#143)

> [!CAUTION]
> Export the database as backup (Settings -> Import/Export -> Export), before this update!
> New version is available at https://llama-ui.js.org/

## [2.18.0] - 2025-09-13

### 🛠 Fixes

- PWA - cache models (fix 429 Too Many Requests) (#141)

## [2.17.0] - 2025-09-12

### 🚀 Enhancements

- Delete conversation message (#140)

## [2.16.0] - 2025-09-12

### 🎨 Styling

- ChatInput - placeholder update (#138)

### 🚜 Refactor

- Project structure review (#139)

## [2.15.4] - 2025-09-11

### 🛠 Fixes

- Chat message model name is removed on edit #135 (#137)

## [2.15.3] - 2025-09-11

### 🛠 Fixes

- Conversation changes time group on rename #134 (#136)

## [2.15.2] - 2025-09-11

### 🛠 Fixes

- Dropdown - placement misprint (#133)

### 🎨 Styling

- Settings dropdown - truncate option text to prevent horizontal scroll (#133)
- Settings - Preset manager - move additional actions to dropdown (#133)

## [2.15.1] - 2025-09-09

### 🛠 Fixes

- Code - keep text wrapped (#129)

## [2.15.0] - 2025-09-08

### 🚜 Refactor

- Extract default configuration values #81 (#128)

## [2.14.1] - 2025-09-07

### 🛠 Fixes

- Markdown - show horizontal scroll on mobile (#125)

## [2.14.0] - 2025-09-07

### 🚀 Enhancements

- Change syntax highlighting theme #123 (#124)

## [2.13.3] - 2025-09-07

### 🛠 Fixes

- Inference context initialization (#122)

## [2.13.2] - 2025-09-07

### 🎨 Styling

- NewVersion popup - Add a note (#121)

## [2.13.1] - 2025-09-06

### 🛠 Fixes

- TextToSpeech - work incorrectly with same name but different lang code (#120)

### 🎨 Styling

- TextToSpeech - order voices by language popularity (#120)

## [2.13.0] - 2025-09-06

### 🚀 Enhancements

- Text to Speech #116 (#117)

## [2.12.3] - 2025-09-06

### 🛠 Fixes

- Header - model dropdown styles (#118)

### 🎨 Styling

- Settings - Mobile padding (#115)

## [2.12.2] - 2025-09-05

- Testing Github rules

## [2.12.1] - 2025-09-04

### 🎨 Styling

- Sidebar - fix desktop padding (#114)

## [2.12.0] - 2025-09-04

### 🚀 Enhancements

- Preset renaming #99 (#112)

### 🎨 Styling

- Setting button mobile (#113)

## [2.11.0] - 2025-09-04

### 🛠 Fixes

- Setting - fix Mobile tab dropdown (#110)

### 🎨 Styling

- Move ThemeController to Settings (#110)
- Header - Add new conversation button (#110)
- Header - Show conversation title (#110)
- ChatInput styling (#111)

## [2.10.1] - 2025-09-04

### ⚡️ Performance

- Optimize long conversation render performance (#109)

## [2.10.0] - 2025-09-04

### 🛠 Fixes

- ChatMessage - show action buttons condition (#107)

### ⚡️ Performance

- Optimize render performance (#107)

## [2.9.3] - 2025-09-04

### 🛠 Fixes

- ChatScreen scroll issue (#106)

## [2.9.2] - 2025-08-30

### 🛠 Fixes

- Conversation export fails #104 (#105)

## [2.9.1] - 2025-08-30

### 🛠 Fixes

- Model dropdown overlapping UI on mobile #101 (#102)

## [2.9.0] - 2025-08-29

### 🚀 Enhancements

- Display code language #56 (#98)

## [2.8.0] - 2025-08-29

### 🚀 Enhancements

- Conversation branch-off #68 (#96)

### 🛠 Fixes

- Sidebar - show long conversation name on hover

## [2.7.2] - 2025-08-29

### 🛠 Fixes

- Message disappears on invalid choices in chat completion response #92 (#95)

## [2.7.1] - 2025-08-29

### 🛠 Fixes

- Settings - icons not displayed (#94)

## [2.7.0] - 2025-08-29

### 🚀 Enhancements

- Settings - Dropdown add search (#91)
- Reusable customizable dropdown component (#93)

## [2.6.6] - 2025-08-28

### 🛠 Fixes

- Settings - Preset list display issues (#90)

## [2.6.5] - 2025-08-28

### 🛠 Fixes

- Settings - fetch models button not working (#89)

## [2.6.4] - 2025-08-27

### 🛠 Fixes

- Switch syntax highlight theme on light/dark color scheme (#88)

### 🚜 Refactor

- Move theme logic to app context (#87)

## [2.6.3] - 2025-08-27

### 🛠 Fixes

- Button tooltip shows scroll (#86)

### 🎨 Styling

- Replaced the tooltips with a titles to prevent scrolling from appearing incorrectly
- Reduce list left padding
- Change think icon size

## [2.6.2] - 2025-08-27

### 🛠 Fixes

- PWA - start_url is missing (#85)
- PWA - fix icons path (#85)

## [2.6.1] - 2025-08-27

### 🛠 Fixes

- Settings - Fetch Models button does not work (#83)
- Settings - Modal dropdown overflows on long names (#84)

## [2.6.0] - 2025-08-27

### 🚀 Enhancements

- Configuration presets #9 (#82)

## [2.5.5] - 2025-08-26

### 🛠 Fixes

- PWA dynamically update theme color (#79)

### 🎨 Styling

- Header - reduce padding on mobile devices (#80)

## [2.5.4] - 2025-08-26

### 🛠 Fixes

- Fetch models only on baseUrl and apiKey update (#77)

### 🎨 Styling

- Change default chat message user label (#78)

### 🚜 Refactor

- Inference Context - extract helper functions

## [2.5.3] - 2025-08-26

### 🎨 Styling

- Change default chat message user label

### 🚜 Refactor

- PWA - update screenshots sizes

## [2.5.2] - 2025-08-26

### 🛠 Fixes

- Style option elements matching current theme (#72)

### 🎨 Styling

- Display visual feedback when assistant is typing (#70)

## [2.5.1] - 2025-08-26

### 🛠 Fixes

- Qwen API url (#74)

## [2.5.0] - 2025-08-25

### 🚀 Enhancements

- Welcome message (#62)
- No models popup screen

### 🛠 Fixes

- Api error body logging

### 🎨 Styling

- Update new version message
- Rename custom provider

## [2.4.2] - 2025-08-25

### 🛠 Fixes

- Fix routing issue (#61)

## [2.4.0] - 2025-08-24

### 🚀 Enhancements

- App version & title (#59)

### 🛠 Fixes

- Update screentshots

## [2.3.0] - 2025-08-24

### 🚀 Enhancements

- Display Sample Prompts on Welcome (#58)

## [2.2.0] - 2025-08-24

### 🚀 Enhancements

- PWA Update on User Prompt (#55)

## [2.1.0] - 2025-08-24

### 🚀 Enhancements

- Allow custom user labels (#54)

## [2.0.2] - 2025-08-24

### 🛠 Fixes

- CORS error on provider select #49 (#53)

## [2.0.1] - 2025-08-24

### 🚀 Enhancements

- Header shows model dropdown

### 🛠 Fixes

- Model update (#51)

## [2.0.0] - 2025-08-23

### 🚀 Enhancements

- Multiple providers support (#48)
- Create SettingsModalDropdown component
- Add manual fetch models button
- Add provider icons
- Handle api error codes

### 🛠 Fixes

- Filter system messages on send
- Freeze default config

### 🎨 Styling

- SettingDialog notes width

### 🚜 Refactor

- Split app.context into app, inferenceApi and message

## [1.3.2] - 2025-08-20

### 🛠 Fixes

- System prompt is not used #45 (#46)

## [1.3.1] - 2025-08-20

### 🎨 Styling

- Update footer note

## [1.3.0] - 2025-08-20

### 🚀 Enhancements

- ChatScreen code block styles (#42)

### 🛠 Fixes

- Reasoning content is not displayed #15 (#43)
- ChatScreen code block styles (#42)

### 🚜 Refactor

- Move split thinking from ChatMessage
- Server error handling

## [1.2.4] - 2025-08-18

### 🚀 Enhancements

- PWA caching (#40)

## [1.2.3] - 2025-08-18

### 🚀 Enhancements

- Footer update (#35)

### 🛠 Fixes

- Header title align (#36)
- Syntax highlighting for code blocks (#37)
- Side panel scroll #34 (#38)

## [1.2.2] - 2025-08-18

### 🚀 Enhancements

- Use html for settings notes (#31)

## [1.2.1] - 2025-08-18

### 🛠 Fixes

- Invalid format for imported records (#30)

## [1.2.0] - 2025-08-18

### 🚀 Enhancements

- Modern Design (#28)

### 🛠 Fixes

- Conversation export format differs #24 (#27)

## [1.1.7] - 2025-08-17

### 🚀 Enhancements

- Messages import/export (#20)
- API Provider (#25)

### 🎨 Styling

- Updated server unavailable message (#22)

### 🚜 Refactor

- Settings dialog update (#21)

## [1.1.6] - 2025-08-16

### 🚀 Enhancements

- Docker (#18)
- PWA (#19)

## [1.1.5] - 2025-08-16

### 🚀 Enhancements

- Re-organize Settings dialog (#17)

## [1.1.4] - 2025-08-15

### 🚀 Enhancements

- Editing attachments (#12)

### 🛠 Fixes

- Do not allow send empty message on edit (#11)

### 🎨 Styling

- Format timings

### 🚜 Refactor

- Extract ChatInput logic from ChatScreen (#14)

## [1.1.3] - 2025-08-15

### 🛠 Fixes

- Message time (#10)

## [1.1.2] - 2025-08-14

### 🚜 Refactor

- Fix release archive content

## [1.1.1] - 2025-08-14

### 🚀 Enhancements

- Change main buttons colors
- Add meta data to HTML head
- Customizable base url (#1)
- Allow edit assistant message (#4)
- Save model to message entity (#7)

### 🛠 Fixes

- Export missing messages (#2)

### 🚜 Refactor

- Build cleanup
- Update build scripts

### 💼 Other

- GitHub issue templates (#5)
- Github Actions
- Copilot setup

## [1.1.0] - 2025-08-14

### 🎨 Styling

- ChatInput: split input and buttons
- Favicon as SVG emoji
- Header displays model name, buttons update
- ServerInfo: moved to the bottom
- ChatScreen shows greeting message
- Sidebar updated header
- Add Yesterday chat group
- Increase SettingDialog maximum width
- Fix iPad Sidebar width
- Fix Conversation dropdown button visibility
- Add DaisyUI themes previews
- Move Performance metric under "i" icon

### 🚜 Refactor

- Clean-up package.json dependencies
- Update gitignore

## [1.0.0] - 2025-08-14

### 💼 Other

- Fork from llama.cpp web UI
