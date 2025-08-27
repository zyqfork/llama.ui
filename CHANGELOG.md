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
